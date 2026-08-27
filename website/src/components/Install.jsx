import { motion } from 'framer-motion';
import { useState } from 'react';
import { FaCheck, FaCopy } from 'react-icons/fa';

const MANAGERS = [
  { key: 'npm', label: 'npm', command: 'npm install -g comfyclips' },
  { key: 'pnpm', label: 'pnpm', command: 'pnpm add -g comfyclips' },
  { key: 'yarn', label: 'yarn', command: 'yarn global add comfyclips' },
  { key: 'npx', label: 'npx', command: 'npx comfyclips' },
];

const NODE_INSTALL = [
  { key: 'mac', label: 'macOS', command: 'brew install node' },
  { key: 'win', label: 'Windows', command: 'winget install OpenJS.NodeJS.LTS' },
  { key: 'linux', label: 'Linux', command: 'sudo apt install nodejs npm' },
];

function CopyLine({ command }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard API unavailable
    }
  };

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-black/50 px-5 py-4 transition-colors hover:border-white/20">
      <code className="font-mono text-sm text-paper sm:text-base break-all">
        <span className="text-lime">$ </span>
        {command}
      </code>
      <button
        type="button"
        onClick={copy}
        className="flex items-center gap-1.5 shrink-0 rounded-lg bg-white/5 px-2.5 py-1.5 font-mono text-xs text-paper/70 transition-all hover:bg-white/15 hover:text-paper"
      >
        {copied ? (
          <>
            <FaCheck className="h-3 w-3 text-lime" />
            <span className="text-lime font-semibold">copied!</span>
          </>
        ) : (
          <>
            <FaCopy className="h-3 w-3 text-paper/50" />
            <span>copy</span>
          </>
        )}
      </button>
    </div>
  );
}

export default function Install() {
  const [active, setActive] = useState('npm');
  const [activeNode, setActiveNode] = useState('mac');
  const command = MANAGERS.find((m) => m.key === active).command;
  const nodeCommand = NODE_INSTALL.find((m) => m.key === activeNode).command;

  return (
    <section id="install" className="mx-auto max-w-4xl px-5 py-16 sm:px-8 sm:py-20">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.4 }}
      >
        <span className="inline-flex items-center gap-1.5 rounded-full bg-lime/20 px-3 py-1 font-mono text-xs font-semibold text-lime-deep">
          #CommandLine
        </span>
        <h2 className="mt-3 font-display text-3xl tracking-tight sm:text-4xl">
          Run it from your terminal
        </h2>
        <p className="mt-3 max-w-lg font-body text-lg text-ink/65">
          No account, no browser extension, zero setup headaches.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mt-10 rounded-2xl bg-ink p-6 shadow-xl sm:p-8"
      >
        <div className="flex items-start gap-4">
          <span className="font-display text-lg text-lime">01</span>
          <div className="flex-1">
            <p className="mb-4 font-body text-sm font-medium text-paper/80">
              Don&apos;t have Node.js yet? Install it first (skip this if{' '}
              <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-paper">node -v</code> is 18+)
            </p>
            <div className="mb-4 flex flex-wrap gap-2">
              {NODE_INSTALL.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveNode(key)}
                  className={`rounded-full px-4 py-1.5 font-mono text-xs font-medium transition-all ${
                    activeNode === key
                      ? 'bg-lime text-ink font-semibold'
                      : 'bg-white/5 text-paper/60 hover:bg-white/10'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <CopyLine command={nodeCommand} />
            <p className="mt-3 font-body text-xs text-paper/45">
              Or{' '}
              <a
                href="https://nodejs.org/en/download"
                target="_blank"
                rel="noreferrer"
                className="underline decoration-lime decoration-2 underline-offset-2 hover:text-paper"
              >
                download the installer from nodejs.org
              </a>{' '}
              (LTS version).
            </p>
          </div>
        </div>

        <div className="my-6 h-px bg-white/10" />

        <div className="flex items-start gap-4">
          <span className="font-display text-lg text-lime">02</span>
          <div className="flex-1">
            <p className="mb-4 font-body text-sm font-medium text-paper/80">
              Install ComfyClips globally with your favorite package manager
            </p>
            <div className="mb-4 flex flex-wrap gap-2">
              {MANAGERS.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActive(key)}
                  className={`rounded-full px-4 py-1.5 font-mono text-xs font-medium transition-all ${
                    active === key
                      ? 'bg-lime text-ink font-semibold'
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
          <span className="font-display text-lg text-lime">03</span>
          <div className="flex-1">
            <p className="mb-4 font-body text-sm font-medium text-paper/80">
              Launch the interactive CLI anytime
            </p>
            <CopyLine command="comfyclips" />
          </div>
        </div>
      </motion.div>

      <div className="mt-8 flex flex-col gap-2 font-body text-sm text-ink/55 sm:flex-row sm:gap-6">
        <span>
          Requires{' '}
          <a
            href="https://nodejs.org/en/download"
            target="_blank"
            rel="noreferrer"
            className="underline decoration-lime decoration-2 underline-offset-2 hover:text-ink font-medium"
          >
            Node.js 18+
          </a>
        </span>
        <span>•</span>
        <span>
          Everything else (ffmpeg, yt-dlp, JS runtime) self-installs on first run
        </span>
      </div>
    </section>
  );
}
