import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { FaChevronDown, FaExclamationTriangle } from 'react-icons/fa';

const ISSUES = [
  {
    tag: 'ffmpeg was not found',
    title: "Quality is capped, or the download won't merge",
    body: (
      <>
        Fixed automatically as of v1.2.0 — <code className="rounded bg-ink/5 px-1.5 py-0.5 font-mono text-xs">npm install</code>{' '}
        fetches a static ffmpeg build for your OS, no separate install needed. Seeing this on an
        older copy? Update it:
      </>
    ),
    command: 'npm install -g comfyclips@latest',
  },
  {
    tag: 'Requested format is not available',
    title: 'YouTube downloads fail with a "no JS runtime" warning',
    body: (
      <>
        YouTube requires a JS runtime (Deno) to unlock its modern formats. Fixed automatically as
        of v1.1.0 — ComfyClips downloads Deno once, on first run. If it&apos;s still failing, clear the
        cache so it re-fetches a clean copy:
      </>
    ),
    command: 'rm -rf ~/.comfyclips',
  },
  {
    tag: 'Unsupported URL',
    title: 'yt-dlp rejects the link you pasted',
    body: (
      <>
        The URL isn&apos;t a direct link to a video or post — playlist pages, channel pages, and short
        links that redirect through a landing page can trip this up. Open the video itself in
        your browser and copy that address, from YouTube, TikTok, Instagram, Reddit, Pinterest, Vimeo, Facebook, X, etc.
      </>
    ),
  },
  {
    tag: 'command not found: comfyclips',
    title: 'The CLI installed but the command isn’t recognized',
    body: (
      <>
        Your package manager&apos;s global bin folder isn&apos;t on PATH. Either run it without installing
        it globally, or check{' '}
        <code className="rounded bg-ink/5 px-1.5 py-0.5 font-mono text-xs">npm config get prefix</code> and add that
        folder&apos;s <code className="rounded bg-ink/5 px-1.5 py-0.5 font-mono text-xs">bin</code> to your PATH.
      </>
    ),
    command: 'npx comfyclips',
  },
  {
    tag: 'Download failed behind a firewall or proxy',
    title: 'ffmpeg, yt-dlp, or Deno never finish downloading',
    body: (
      <>
        These all self-install from GitHub the first time they&apos;re needed. On a locked-down
        network (corporate proxy, restricted CI runner) that traffic may be blocked — install
        ffmpeg, yt-dlp, and Deno manually instead and make sure all three are on your PATH.
      </>
    ),
  },
  {
    tag: 'Private, age-restricted, or region-locked videos',
    title: 'A specific video always fails, others work fine',
    body: (
      <>
        ComfyClips can&apos;t get past a login wall or age gate — if the video needs you to be signed
        in to view it in a browser, it can&apos;t be downloaded either.
      </>
    ),
  },
];

function Item({ issue, isOpen, onToggle }) {
  return (
    <div className="border-b border-ink/10 last:border-b-0 transition-colors">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="group flex w-full items-start justify-between gap-4 py-6 text-left"
      >
        <div>
          <span className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold tracking-wider text-lime-deep">
            {issue.tag.includes('ffmpeg') && <FaExclamationTriangle className="h-3 w-3" />}
            {issue.tag}
          </span>
          <h3 className="mt-2 font-display text-lg tracking-tight text-ink sm:text-xl transition-colors group-hover:text-lime-deep">
            {issue.title}
          </h3>
        </div>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink/5 text-ink/60 transition-colors group-hover:bg-lime group-hover:text-ink"
        >
          <FaChevronDown className="h-3 w-3" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="overflow-hidden"
          >
            <div className="pb-6 pr-4 sm:pr-10">
              <p className="max-w-2xl font-body text-[0.95rem] leading-relaxed text-ink/70">
                {issue.body}
              </p>
              {issue.command && (
                <div className="mt-4 flex max-w-md items-center gap-3 rounded-xl border border-ink/10 bg-ink/5 px-4 py-3">
                  <code className="font-mono text-sm text-ink">
                    <span className="text-lime-deep">$ </span>
                    {issue.command}
                  </code>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Troubleshoot() {
  const [openTag, setOpenTag] = useState(ISSUES[0].tag);

  return (
    <section id="troubleshooting" className="mx-auto max-w-4xl px-5 py-16 sm:px-8 sm:py-20">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.4 }}
      >
        <span className="inline-flex items-center gap-1.5 rounded-full bg-lime/20 px-3 py-1 font-mono text-xs font-semibold text-lime-deep">
          #Help & Solutions
        </span>
        <h2 className="mt-3 font-display text-3xl tracking-tight sm:text-4xl">
          Frequently Asked Questions & Errors
        </h2>
        <p className="mt-3 max-w-lg font-body text-lg text-ink/65">
          Most common issues and how ComfyClips resolves them automatically.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mt-10 rounded-2xl border border-ink/10 bg-white px-6 shadow-sm sm:px-8"
      >
        {ISSUES.map((issue) => (
          <Item
            key={issue.tag}
            issue={issue}
            isOpen={openTag === issue.tag}
            onToggle={() => setOpenTag((current) => (current === issue.tag ? null : issue.tag))}
          />
        ))}
      </motion.div>

      <p className="mt-6 font-body text-sm text-ink/55">
        Still stuck?{' '}
        <a
          href="https://github.com/Hamza-Imran435/ComfyClips/issues"
          target="_blank"
          rel="noreferrer"
          className="underline decoration-lime decoration-2 underline-offset-2 hover:text-ink font-medium"
        >
          Open an issue on GitHub
        </a>{' '}
        with the exact error message.
      </p>
    </section>
  );
}
