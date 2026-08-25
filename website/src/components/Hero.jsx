import { useState } from 'react';
import TerminalDemo from './TerminalDemo';

export default function Hero() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText('npx comfyclips');
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard API unavailable — the command is still selectable as plain text.
    }
  };

  return (
    <section id="top" className="mx-auto max-w-6xl px-5 pb-16 pt-14 sm:px-8 sm:pb-24 sm:pt-20">
      <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
        <div>
          <span className="inline-flex items-center rounded-full bg-lime px-3 py-1 font-mono text-xs font-semibold text-ink">
            #NoBrowserRequired
          </span>

          <h1 className="mt-6 font-display text-[2.6rem] leading-[1.05] tracking-tight sm:text-6xl">
            Grab the clip.
            <br />
            Skip the ad maze.
          </h1>

          <p className="mt-6 max-w-md font-body text-lg leading-relaxed text-ink/70">
            ComfyClips is a terminal tool that pulls video or audio straight off YouTube,
            Instagram, TikTok, Facebook and X — no pop-ups, no sketchy converter sites, no
            account.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href="#download"
              className="rounded-xl bg-lime px-6 py-3.5 text-center font-mono text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5"
            >
              Paste a link ↓
            </a>
            <button
              type="button"
              onClick={copy}
              className="group flex items-center justify-between gap-4 rounded-xl border-2 border-ink bg-ink px-5 py-3.5 font-mono text-sm text-paper transition-colors hover:bg-ink/90"
            >
              <span className="flex items-center gap-2">
                <span className="text-lime">$</span>
                npx comfyclips
              </span>
              <span className="text-xs text-paper/50 group-hover:text-paper/80">
                {copied ? 'copied!' : 'copy'}
              </span>
            </button>
          </div>

          <p className="mt-4 font-body text-sm text-ink/45">
            Prefer the terminal? Install it globally — see{' '}
            <a href="#install" className="underline decoration-lime decoration-2 underline-offset-2">
              below
            </a>
            .
          </p>
        </div>

        <div className="flex justify-center lg:justify-end">
          <TerminalDemo />
        </div>
      </div>
    </section>
  );
}
