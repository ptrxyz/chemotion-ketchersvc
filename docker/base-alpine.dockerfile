FROM alpine:3.16.1
RUN apk add --update nodejs npm

RUN apk add --update chromium-chromedriver
RUN ln -s /usr/bin/chromium-browser /usr/bin/chrome-browser
