import { useState } from 'react';

const MANAGERS = [
  { key: 'npm', label: 'npm', command: 'npm install -g comfyclips' },
  { key: 'pnpm', label: 'pnpm', command: 'pnpm add -g comfyclips' },
  { key: 'yarn', label: 'yarn', command: 'yarn global add comfyclips' },
  { key: 'npx', label: 'npx', command: 'npx comfyclips' },
];

function CopyLine({ command }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard API unavailable — the command is still selectable as plain text.
    }
  };

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-black/40 px-5 py-4">
      <code className="font-mono text-sm text-paper sm:text-base">
        <span className="text-lime">$ </span>
        {command}
      </code>
      <button
        type="button"
        onClick={copy}
        className="shrink-0 font-mono text-xs text-paper/50 transition-colors hover:text-paper"
      >
        {copied ? 'copied!' : 'copy'}
      </button>
    </div>
  );
}

export default function Install() {
  const [active, setActive] = useState('npm');
  const command = MANAGERS.find((m) => m.key === active).command;

  return (
    <section id="install" className="mx-auto max-w-4xl px-5 py-16 sm:px-8 sm:py-20">
      <h2 className="font-display text-3xl tracking-tight sm:text-4xl">Run it from your terminal</h2>
      <p className="mt-4 max-w-lg font-body text-lg text-ink/65">
        Two steps. No account, no browser extension, no dashboard to configure.
      </p>

      <div className="mt-10 rounded-2xl bg-ink p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <span className="font-display text-lime">01</span>
          <div className="flex-1">
            <p className="mb-4 font-body text-sm font-medium text-paper/70">
              Install it once, with whichever package manager you already use
            </p>
            <div className="mb-4 flex flex-wrap gap-2">
              {MANAGERS.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActive(key)}
                  className={`rounded-full px-4 py-1.5 font-mono text-xs font-medium transition-colors ${
                    active === key
                      ? 'bg-lime text-ink'
                      : 'bg-white/5 text-paper/60 hover:bg-white/10'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <CopyLine command={command} />
          </div>
        </div>

        <div className="my-6 h-px bg-white/10" />

        <div className="flex items-start gap-4">
          <span className="font-display text-lime">02</span>
          <div className="flex-1">
            <p className="mb-4 font-body text-sm font-medium text-paper/70">
              Then run it, anytime
            </p>
            <CopyLine command="comfyclips" />
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-2 font-body text-sm text-ink/55 sm:flex-row sm:gap-6">
        <span>Requires Node.js 18+</span>
        <span>
          <a
            href="https://ffmpeg.org/"
            target="_blank"
            rel="noreferrer"
            className="underline decoration-lime decoration-2 underline-offset-2"
          >
            ffmpeg
          </a>{' '}
          recommended for merging streams and audio conversion
        </span>
      </div>
    </section>
  );
}
