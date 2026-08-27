FROM node:20-slim

# curl + unzip are only needed to install deno below; ca-certificates for
# both that and npm's own HTTPS downloads (yt-dlp, ffmpeg-static).
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates curl unzip \
  && rm -rf /var/lib/apt/lists/*

# Deno is required by yt-dlp to solve YouTube's signature challenge. Baked in
# at build time (rather than left to ComfyClips' runtime auto-download) so a
# fresh container never has to fetch it on its first request.
ENV DENO_INSTALL=/usr/local
RUN curl -fsSL https://deno.land/install.sh | sh -s -- --yes \
  && apt-get purge -y --auto-remove curl unzip

WORKDIR /app

# Root package: shared downloader/binaries/platforms logic used by both the
# CLI and the server. `npm ci` also fetches a static ffmpeg binary via the
# ffmpeg-static postinstall script — no system ffmpeg package needed.
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
