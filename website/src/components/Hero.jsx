import { motion } from 'framer-motion';
import { useState } from 'react';
import { FaCheck, FaCopy } from 'react-icons/fa';
import TerminalDemo from './TerminalDemo';

export default function Hero() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText('npx comfyclips');
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard API unavailable
    }
  };

  return (
    <section id="top" className="mx-auto max-w-6xl px-5 pb-16 pt-14 sm:px-8 sm:pb-24 sm:pt-20">
      <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <span className="inline-flex items-center rounded-full bg-lime px-3 py-1 font-mono text-xs font-semibold text-ink">
            #NoBrowserRequired
          </span>

          <h1 className="mt-6 font-display text-[2.5rem] leading-[1.08] tracking-tight sm:text-6xl text-ink">
            Grab the clip.
            <br />
            Skip the ad maze.
          </h1>

          <p className="mt-6 max-w-md font-body text-lg leading-relaxed text-ink/70">
            ComfyClips is a fast, open-source tool that pulls video or audio straight off YouTube,
            TikTok, Instagram, Reddit, Pinterest, Vimeo, X, and more — no pop-ups, no sketchy converter sites, zero tracking.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={copy}
              className="group flex items-center justify-between gap-4 rounded-xl border-2 border-ink bg-ink px-5 py-3.5 font-mono text-sm text-paper transition-all hover:bg-ink/90 hover:scale-[1.02]"
            >
              <span className="flex items-center gap-2">
                <span className="text-lime">$</span>
                <span>npx comfyclips</span>
              </span>
              <span className="flex items-center gap-1 text-xs text-paper/60 group-hover:text-paper">
                {copied ? (
                  <>
                    <FaCheck className="h-3 w-3 text-lime" />
                    <span className="text-lime font-semibold">copied!</span>
                  </>
                ) : (
                  <>
                    <FaCopy className="h-3 w-3" />
                    <span>copy</span>
                  </>
                )}
              </span>
            </button>
            <a
              href="#install"
              className="text-center font-body text-sm font-semibold text-ink underline decoration-lime decoration-2 underline-offset-4 hover:opacity-80"
            >
              or install it globally →
            </a>
          </div>

          <p className="mt-4 font-body text-xs sm:text-sm text-ink/45">
            Runs entirely on your machine or in your browser. Nothing you download is stored or logged.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
          className="flex justify-center lg:justify-end"
        >
          <TerminalDemo />
        </motion.div>
      </div>
    </section>
  );
}
