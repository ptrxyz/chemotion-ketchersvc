
# Build stage
FROM oven/bun:latest AS build

WORKDIR /app

COPY package.json bun.lockb /app/

RUN export ELECTRON_SKIP_BINARY_DOWNLOAD=1; \
    export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1; \
    bun install --frozen-lockfile

COPY . /app
RUN bun run build


# Finalize the image
FROM oven/bun:latest

WORKDIR /app
ENV NODE_ENV=production

COPY package.json bun.lockb /app/
RUN export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1; \
    bun install --frozen-lockfile --production

RUN bunx playwright install --with-deps chromium
COPY --from=build /app/dist /app

CMD ["bun", "index.js"]
