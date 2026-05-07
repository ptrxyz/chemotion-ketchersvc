#!/bin/bash

bun run containerize
docker run -d --rm -p 4000:4000 --name ketchersvc-test-container ketchersvc:latest
until curl -fsS http://127.0.0.1:4000/status > /dev/null 2>&1; do
  echo "Waiting for ketchersvc to start..."
  sleep 1
done

trap 'docker rm -f ketchersvc-test-container >/dev/null 2>&1' EXIT

# one-off test to verify functionality
curl -sS -o - -H "Content-Type: application/json" --data-binary @test/fixtures/molfile/test.json http://127.0.0.1:4000/render | grep stroke > /dev/null

# Benchmark performance
hyperfine --warmup 20 --runs 1000 'curl -sS -o - -H "Content-Type: application/json" --data-binary @test/fixtures/molfile/test.json http://127.0.0.1:4000/render | grep stroke > /dev/null'

# Benchmark stability
bombardier -c 20 -d 1m -m POST -H "Content-Type: application/json" -f test/fixtures/molfile/test.json http://127.0.0.1:4000/render

# Benchmark with k6 to get more detailed metrics
docker run --rm -i --network host \
-v "$PWD:/work" \
grafana/k6 run - <<'EOF'
import http from 'k6/http';
import { check } from 'k6';

const payload = open('/work/test/fixtures/molfile/test.json');

export const options = {
  vus: 20,
  duration: '1m',
};

export default function () {
  const res = http.post(
    'http://127.0.0.1:4000/render',
    payload,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  check(res, {
    'status is 200': (r) => r.status === 200,
    'contains stroke': (r) => r.body.includes('stroke'),
  });
}
EOF
