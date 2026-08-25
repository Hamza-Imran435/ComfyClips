import { useState } from 'react';

const QUALITIES = [
  { key: 'best', label: 'Best available' },
  { key: '1080p', label: '1080p' },
  { key: '720p', label: '720p' },
  { key: '480p', label: '480p' },
];

const AUDIO_FORMATS = ['mp3', 'm4a', 'wav', 'opus'];

const REQUEST_TIMEOUT_MS = 3 * 60 * 1000 + 10_000;

function parseFilename(disposition) {
  const match = disposition?.match(/filename="([^"]+)"/);
  return match ? decodeURIComponent(match[1]) : 'comfyclips-download';
}

export default function DownloadTool() {
  const [url, setUrl] = useState('');
  const [mode, setMode] = useState('video');
  const [quality, setQuality] = useState('best');
  const [audioFormat, setAudioFormat] = useState('mp3');
  const [phase, setPhase] = useState('idle'); // idle | preparing | saving | done | error
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const busy = phase === 'preparing' || phase === 'saving';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (busy || !url.trim()) return;

    setError('');
    setProgress(0);
    setPhase('preparing');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const res = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), mode, quality, audioFormat }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Download failed. Check the link and try again.');
      }

      const contentLength = Number(res.headers.get('Content-Length')) || 0;
      const filename = parseFilename(res.headers.get('Content-Disposition'));

      setPhase('saving');
      const reader = res.body.getReader();
      const chunks = [];
      let received = 0;

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        received += value.length;
        if (contentLength) {
          setProgress(Math.min(100, Math.round((received / contentLength) * 100)));
        }
      }

      const blob = new Blob(chunks);
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);

      setPhase('done');
    } catch (err) {
      setPhase('error');
      setError(
        err.name === 'AbortError'
          ? 'That took too long. Try a shorter clip or a lower quality.'
          : err.message
      );
    } finally {
      clearTimeout(timeoutId);
    }
  };

  const buttonLabel = {
    idle: 'Download',
    preparing: 'Preparing…',
    saving: `Saving… ${progress}%`,
    done: 'Downloaded ✔ — go again?',
    error: 'Try again',
  }[phase];

  return (
    <section id="download" className="mx-auto max-w-4xl px-5 py-16 sm:px-8 sm:py-20">
      <h2 className="font-display text-3xl tracking-tight sm:text-4xl">
        Or just paste a link
      </h2>
      <p className="mt-4 max-w-lg font-body text-lg text-ink/65">
        Same tool, no install. This form runs the identical downloader on our server and streams
        the file straight to your device.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 rounded-2xl border border-ink/10 bg-white p-6 shadow-sm sm:p-8"
      >
        <label htmlFor="clip-url" className="block font-body text-sm font-medium text-ink/70">
          Video link
        </label>
        <input
          id="clip-url"
          type="url"
          required
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://youtube.com/watch?v=..."
          className="mt-2 w-full rounded-xl border border-ink/15 bg-paper px-4 py-3 font-mono text-sm text-ink outline-none transition-colors focus:border-ink"
        />

        <div className="mt-5 flex flex-wrap gap-2">
          {['video', 'audio'].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`rounded-full px-4 py-1.5 font-mono text-xs font-medium capitalize transition-colors ${
                mode === m ? 'bg-ink text-paper' : 'bg-ink/5 text-ink/60 hover:bg-ink/10'
              }`}
            >
              {m === 'video' ? 'Video' : 'Audio only'}
            </button>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {mode === 'video'
            ? QUALITIES.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setQuality(key)}
                  className={`rounded-full px-3.5 py-1.5 font-mono text-xs font-medium transition-colors ${
                    quality === key ? 'bg-lime text-ink' : 'bg-ink/5 text-ink/60 hover:bg-ink/10'
                  }`}
                >
                  {label}
                </button>
              ))
            : AUDIO_FORMATS.map((format) => (
                <button
                  key={format}
                  type="button"
                  onClick={() => setAudioFormat(format)}
                  className={`rounded-full px-3.5 py-1.5 font-mono text-xs font-medium uppercase transition-colors ${
                    audioFormat === format
                      ? 'bg-lime text-ink'
                      : 'bg-ink/5 text-ink/60 hover:bg-ink/10'
                  }`}
                >
                  {format}
                </button>
              ))}
        </div>

        <button
          type="submit"
          disabled={busy || !url.trim()}
          className="mt-6 w-full rounded-xl bg-ink px-5 py-3.5 font-mono text-sm font-medium text-paper transition-opacity disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:min-w-[14rem]"
        >
          {buttonLabel}
        </button>

        {phase === 'error' && (
          <p className="mt-4 font-body text-sm text-red-600">{error}</p>
        )}

        <p className="mt-5 font-body text-xs text-ink/40">
          Runs on our server and streams straight to your device — the file isn't kept afterward.
          Only links from YouTube, Instagram, TikTok, Facebook, and X are accepted.
        </p>
      </form>
    </section>
  );
}
