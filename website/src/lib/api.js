// Base URL of the standalone ComfyClips server. Empty string keeps requests
// relative, which relies on the Vite dev proxy (see vite.config.js) locally
// or a same-origin deploy in production. Set VITE_API_URL when the website
// and server are deployed as separate Vercel projects.
export const API_BASE_URL = (import.meta.env.API_URL ?? '').replace(/\/$/, '');
