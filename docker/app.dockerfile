#syntax=docker/dockerfile-upstream:1.4.0-rc1
ARG BASE=base
FROM ${BASE}

WORKDIR /src
ADD ["package.json", "package-lock.json", "/src/"]
RUN npm install --production
ADD [".", "/src/"]

EXPOSE 9000
ENV CONFIG_PORT=9000 \
    CONFIG_KETCHER_URL=https://chemotion/ketcher \
    CONFIG_MIN_WORKERS=1 \
    CONFIG_MAX_WORKERS=4

CMD [ "node", "app.js" ]
