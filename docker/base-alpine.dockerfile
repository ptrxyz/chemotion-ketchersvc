FROM alpine:3.16.1
RUN apk add --update nodejs npm

RUN apk add --update chromium-chromedriver
RUN ln -s /usr/bin/chromium-browser /usr/bin/chrome-browser

RUN apk add mimalloc2 --repository=http://dl-cdn.alpinelinux.org/alpine/edge/testing/ && ln -s /usr/lib/libmimalloc.so.2.0 /usr/lib/libmimalloc.so
ENV LD_PRELOAD=/usr/lib/libmimalloc.so
