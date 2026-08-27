import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-paper/85 backdrop-blur-md transition-colors">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5 sm:px-8">
        {/* Brand Logo & Name */}
        <a href="#top" className="group flex items-center gap-3.5 transition-opacity hover:opacity-90">
          <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-white border border-ink/10 shadow-xs p-1 transition-transform group-hover:scale-105">
            <img
              src="/comfyclips-icon.png"
              alt="ComfyClips Logo"
              className="h-full w-full object-contain"
              width="48"
              height="48"
              loading="eager"
              fetchPriority="high"
            />
          </div>
          <span className="font-display text-xl sm:text-2xl tracking-tight text-ink">
            ComfyClips
          </span>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-7 font-body text-sm font-medium text-ink/75 lg:flex">
          <a href="#download" className="transition-colors hover:text-ink">
            Web Downloader
          </a>
          <a href="#features" className="transition-colors hover:text-ink">
            Features
          </a>
          <a href="#platforms" className="transition-colors hover:text-ink">
            Platforms
          </a>
          <a href="#install" className="transition-colors hover:text-ink">
            CLI Install
          </a>
          <a href="#troubleshooting" className="transition-colors hover:text-ink">
            Troubleshooting
          </a>
        </nav>

        {/* Action Button */}
        <div className="hidden items-center gap-3 sm:flex">
          <a
            href="#download"
            className="rounded-full bg-lime px-5 py-2 font-mono text-xs sm:text-sm font-semibold text-ink shadow-xs transition-all hover:bg-lime/90 hover:scale-[1.02]"
          >
            Download Clip →
          </a>
        </div>

        {/* Mobile Menu Hamburger Toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-ink/15 bg-white text-ink transition-colors hover:bg-ink/5 lg:hidden"
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <FaTimes className="h-4 w-4" /> : <FaBars className="h-4 w-4" />}
        </button>
      </div>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-ink/10 bg-paper px-6 py-5 lg:hidden"
          >
            <div className="flex flex-col gap-4 font-body text-base font-medium text-ink/80">
              <a
                href="#download"
                onClick={() => setOpen(false)}
                className="py-1 transition-colors hover:text-ink font-semibold text-ink"
              >
                Web Downloader
              </a>
              <a href="#features" onClick={() => setOpen(false)} className="py-1 transition-colors hover:text-ink">
                Features
              </a>
              <a href="#platforms" onClick={() => setOpen(false)} className="py-1 transition-colors hover:text-ink">
                Platforms
              </a>
              <a href="#install" onClick={() => setOpen(false)} className="py-1 transition-colors hover:text-ink">
                CLI Install
              </a>
              <a href="#troubleshooting" onClick={() => setOpen(false)} className="py-1 transition-colors hover:text-ink">
                Troubleshooting
              </a>
              <div className="pt-2">
                <a
                  href="#download"
                  onClick={() => setOpen(false)}
                  className="block w-full rounded-xl bg-lime py-3 text-center font-mono text-sm font-semibold text-ink shadow-xs"
                >
                  Download Clip Now →
                </a>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
