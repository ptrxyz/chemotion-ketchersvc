#!/usr/bin/env bash

set -Eeuo pipefail

readonly CONTAINER_NAME="ketchersvc-test-container"
readonly IMAGE_NAME="ketchersvc:latest"
readonly BASE_URL="http://127.0.0.1:4000"
readonly FIXTURE="test/fixtures/molfile/test.json"

stats() {
  echo
  echo "=== Docker Stats ==="
  docker stats --no-stream "$CONTAINER_NAME" || true
  echo
}

cleanup() {
  stats
  docker rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true
}

wait_for_service() {
  echo "Waiting for ketchersvc to start..."

  until curl -fsS "$BASE_URL/status" >/dev/null 2>&1; do
    sleep 1
  done

  echo "ketchersvc is ready"
  echo
}

smoke_test() {
  echo "=== Smoke Test ==="

  curl -sS \
    -H "Content-Type: application/json" \
    --data-binary @"$FIXTURE" \
    "$BASE_URL/render" \
    | grep stroke >/dev/null

  echo "Smoke test passed"
  echo
}

benchmark_hyperfine() {
  echo "=== Hyperfine Benchmark ==="

  hyperfine \
    --warmup 20 \
    --runs 1000 \
    "curl -sS -o - -H 'Content-Type: application/json' --data-binary @$FIXTURE $BASE_URL/render | grep stroke > /dev/null"

  echo
}

benchmark_bombardier() {
  echo "=== Bombardier Benchmark ==="

  bombardier \
    -c 20 \
    -d 10m \
    -m POST \
    -H "Content-Type: application/json" \
    -f "$FIXTURE" \
    "$BASE_URL/render"

  echo
}

benchmark_k6() {
  echo "=== k6 Benchmark ==="

  docker run --rm -i \
    --network host \
    -v "$PWD:/work" \
    grafana/k6 run - <<'EOF'
import http from 'k6/http';
import { check } from 'k6';

const payload = open('/work/test/fixtures/molfile/test.json');

export const options = {
  vus: 20,
  duration: '10m',
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

  echo
}

trap cleanup EXIT

echo "=== Building Container ==="
bun run containerize
echo

echo "=== Starting Container ==="
docker run -d --rm \
  -p 4000:4000 \
  --name "$CONTAINER_NAME" \
  "$IMAGE_NAME"
echo

wait_for_service

smoke_test
stats

benchmark_hyperfine
stats

benchmark_bombardier
stats

benchmark_k6
stats
