# Deploying the PO Token provider

YouTube requires a "proof of origin" token from most yt-dlp clients before it
will serve real download URLs. Without one, the server falls back to clients
that are more likely to hit YouTube's "Sign in to confirm you're not a bot"
wall on Vercel's datacenter IPs.

[bgutil-ytdlp-pot-provider](https://github.com/Brainicism/bgutil-ytdlp-pot-provider)
is yt-dlp's own recommended long-term fix: a small always-on service that
mints valid tokens automatically. No YouTube account, no cookies, nothing to
refresh. `server/lib/binaries.js` already auto-downloads the yt-dlp plugin
side of this — the only thing left is deploying the token-minting service
itself somewhere that can run a persistent process (Vercel's serverless
functions can't).

## 1. Deploy the service

It ships as a public Docker image (`brainicism/bgutil-ytdlp-pot-provider`),
so any host that can run an arbitrary Docker image works — e.g. Render, Fly.io,
or Railway, all of which have a free tier. Example (Render "Web Service" from
a Docker image, or equivalent on any of these):

- Image: `brainicism/bgutil-ytdlp-pot-provider`
- Port: `4416`
- No environment variables or persistent storage required.

Once deployed you'll have a public URL, e.g. `https://your-pot-provider.onrender.com`.

Sanity check it's alive:

```bash
curl https://your-pot-provider.onrender.com/ping
```

## 2. Point the server at it

In Vercel → your **server** project → Settings → Environment Variables, add:

```
POT_PROVIDER_URL=https://your-pot-provider.onrender.com
```

Redeploy. `resolvePotPluginArgs()` in `server/lib/binaries.js` picks this up
automatically and passes it to yt-dlp via `--extractor-args
"youtubepot-bgutilhttp:base_url=..."`.

## Notes

- If `POT_PROVIDER_URL` is unset, or the service is unreachable, yt-dlp just
  logs a warning and falls back to its default behavior — nothing breaks.
- A free-tier host that spins down when idle (e.g. Render free) will add a
  few seconds of cold-start latency on the *first* download after a period of
  inactivity, since it has to wake the container. Subsequent downloads are
  fast until it spins down again.
