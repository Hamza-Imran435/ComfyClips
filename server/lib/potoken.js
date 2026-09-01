import { BotGuardClient, getChallenge } from 'bgutils-js/botguard';
import { buildURL, getHeaders, USER_AGENT } from 'bgutils-js/utils';
import { WebPoMinter } from 'bgutils-js/webpo';
import { JSDOM } from 'jsdom';

// YouTube demands a "proof of origin" token from server-side traffic; without
// one it either answers with "Sign in to confirm you're not a bot" or serves a
// single low-quality pre-merged format. Minting one in-process (rather than
// via a companion service) keeps everything inside the one deployment.
//
// Long-lived API key YouTube's own web player uses for the BotGuard challenge.
const REQUEST_KEY = 'O43z0dpjhgX20SCx4KAo';
// Re-mint slightly before expiry so a long download can't outlive its token.
const REFRESH_MARGIN_MS = 5 * 60 * 1000;

let domInstalled = false;
let cachedSession = null;

// BotGuard's VM expects to run in a browser: give it a DOM once per process.
function installDom() {
  if (domInstalled) return;
  const dom = new JSDOM('<!DOCTYPE html><html><head><title></title></head><body></body></html>', {
    url: 'https://www.youtube.com/',
    referrer: 'https://www.youtube.com/',
    resources: { userAgent: USER_AGENT },
  });
  Object.assign(globalThis, {
    window: dom.window,
    document: dom.window.document,
    location: dom.window.location,
    origin: dom.window.origin,
  });
  if (!Reflect.has(globalThis, 'navigator')) {
    Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator });
  }
  domInstalled = true;
}

async function fetchVisitorData() {
  const res = await fetch('https://www.youtube.com/', {
    headers: { 'User-Agent': USER_AGENT, 'Accept-Language': 'en-US,en;q=0.9' },
  });
  if (!res.ok) throw new Error(`YouTube homepage responded with ${res.status}`);
  const match = (await res.text()).match(/"visitorData":\s*"([^"]+)"/);
  if (!match) throw new Error('visitorData not found in YouTube homepage');
  return JSON.parse(`"${match[1]}"`);
}

async function createSession() {
  installDom();

  const visitorData = await fetchVisitorData();
  const challenge = await getChallenge({ requestKey: REQUEST_KEY, fetchFunction: fetch });

  const interpreterJs =
    challenge.interpreterJavascript?.privateDoNotAccessOrElseSafeScriptWrappedValue;
  if (!interpreterJs) throw new Error('challenge contained no interpreter JavaScript');

  // Defines the BotGuard VM on globalThis under challenge.globalName.
  new Function(interpreterJs)();

  const bgClient = await BotGuardClient.create({
    program: challenge.program,
    globalName: challenge.globalName,
    globalObject: globalThis,
  });

  const webPoSignalOutput = [];
  const botguardResponse = await bgClient.snapshot({ webPoSignalOutput });

  const itRes = await fetch(buildURL('GenerateIT'), {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify([REQUEST_KEY, botguardResponse]),
  });
  if (!itRes.ok) throw new Error(`GenerateIT responded with ${itRes.status}`);

  const [integrityToken, estimatedTtlSecs, mintRefreshThreshold, websafeFallbackToken] =
    await itRes.json();
  if (!integrityToken) throw new Error('integrity token was empty');

  const minter = await WebPoMinter.create(
    { integrityToken, estimatedTtlSecs, mintRefreshThreshold, websafeFallbackToken },
    webPoSignalOutput
  );

  return {
    visitorData,
    minter,
    gvs: await minter.mintAsWebsafeString(visitorData),
    expiresAt: Date.now() + (estimatedTtlSecs ?? 3600) * 1000 - REFRESH_MARGIN_MS,
  };
}

async function getSession() {
  if (cachedSession && Date.now() < cachedSession.expiresAt) return cachedSession;
  cachedSession = await createSession();
  return cachedSession;
}

export function extractYouTubeVideoId(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (!/(^|\.)youtube\.com$|^youtu\.be$/i.test(parsed.hostname)) return null;

  if (/^youtu\.be$/i.test(parsed.hostname)) return parsed.pathname.slice(1) || null;
  if (parsed.searchParams.has('v')) return parsed.searchParams.get('v');

  const match = parsed.pathname.match(/^\/(?:shorts|embed|live|v)\/([^/?#]+)/);
  return match ? match[1] : null;
}

// Clients that actually serve separate video+audio streams when handed a PO
// token. The plain 'web'/'web_safari' clients are SABR-only (no direct URLs at
// all) and 'mweb'/'android_vr' answer 403 on adaptive formats, so the embedded
// clients lead; mweb trails as a last resort for videos that disallow
// embedding, where it can still supply a pre-merged stream.
const PLAYER_CLIENTS = ['web_embedded', 'tv_embedded', 'mweb'];

// Returns the value for yt-dlp's `--extractor-args youtube:...`. Falls back to
// plain client spoofing if minting fails, so a token outage degrades to
// low-quality-but-working rather than breaking downloads outright.
export async function resolveYoutubeExtractorArgs(url) {
  const fallback = 'player_client=android,web';

  const videoId = extractYouTubeVideoId(url);
  if (!videoId) return fallback;

  try {
    const { visitorData, minter, gvs } = await getSession();
    const player = await minter.mintAsWebsafeString(videoId);
    const tokens = PLAYER_CLIENTS.flatMap((client) => [
      `${client}.gvs+${gvs}`,
      `${client}.player+${player}`,
    ]).join(',');

    return (
      `player_client=${PLAYER_CLIENTS.join(',')};po_token=${tokens};visitor_data=${visitorData}`
    );
  } catch (err) {
    console.error('[potoken] minting failed, falling back:', err.message);
    cachedSession = null;
    return fallback;
  }
}
