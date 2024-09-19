
# Build stage
FROM oven/bun:latest AS build

WORKDIR /app

COPY ./package.json /app/package.json

RUN bunx playwright install 
RUN ELECTRON_SKIP_BINARY_DOWNLOAD=1 bun install

COPY . /app
RUN bun run build


# Finalize the image
FROM oven/bun:latest

WORKDIR /app
RUN bunx playwright install --with-deps chromium
COPY --from=build /app/dist /app

CMD ["bun", "index.js"]
