
# Build stage
FROM oven/bun:latest AS build

WORKDIR /app

COPY ./package.json /app/package.json

RUN export ELECTRON_SKIP_BINARY_DOWNLOAD=1; \
    export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1; \
    bun install && \
    bun add @playwright/test && \
    bun add chromium-bidi

COPY . /app
RUN bun run build


# Finalize the image
FROM oven/bun:latest

WORKDIR /app
RUN bunx playwright install --with-deps chromium
COPY --from=build /app/dist /app

CMD ["bun", "index.js"]
