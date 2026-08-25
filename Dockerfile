FROM node:20-slim

# ffmpeg is required to merge video/audio streams and convert audio formats.
RUN apt-get update \
  && apt-get install -y --no-install-recommends ffmpeg ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Root package: shared downloader/binaries/platforms logic used by both the
# CLI and the server.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY src ./src

# Website: build the static frontend.
COPY website/package.json website/package-lock.json ./website/
RUN npm --prefix website ci
COPY website ./website
RUN npm --prefix website run build

# Server: the API that runs yt-dlp and also serves the built website above.
COPY server/package.json server/package-lock.json ./server/
RUN npm --prefix server ci --omit=dev
COPY server ./server

ENV NODE_ENV=production
EXPOSE 8787
CMD ["node", "server/index.js"]
