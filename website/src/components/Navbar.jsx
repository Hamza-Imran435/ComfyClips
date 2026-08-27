import { useState } from 'react';

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <a href="#top" className="flex items-center gap-2.5">
          <img src="/comfyclips-icon.png" alt="" className="h-8 w-8" width="32" height="32" />
          <span className="font-display text-lg tracking-tight">ComfyClips</span>
        </a>

        <nav className="hidden items-center gap-8 font-body text-sm font-medium text-ink/70 md:flex">
          <a href="#features" className="transition-colors hover:text-ink">
            Features
          </a>
          <a href="#platforms" className="transition-colors hover:text-ink">
            Platforms
          </a>
          <a href="#install" className="transition-colors hover:text-ink">
            Install
          </a>
          <a href="#troubleshooting" className="transition-colors hover:text-ink">
            Troubleshooting
          </a>
        </nav>

        <a
          href="#install"
          className="hidden rounded-full bg-lime px-5 py-2 font-mono text-sm font-medium text-ink transition-transform hover:-translate-y-0.5 md:inline-block"
        >
          Download now
        </a>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 md:hidden"
          aria-expanded={open}
          aria-label="Toggle menu"
        >
          <span className="sr-only">Toggle menu</span>
          <div className="flex flex-col gap-1">
            <span className="block h-[1.5px] w-4 bg-ink" />
            <span className="block h-[1.5px] w-4 bg-ink" />
          </div>
        </button>
      </div>

      {open && (
        <nav className="flex flex-col gap-4 border-t border-ink/10 px-5 py-5 font-body text-sm font-medium md:hidden">
          <a href="#features" onClick={() => setOpen(false)}>
            Features
          </a>
          <a href="#platforms" onClick={() => setOpen(false)}>
            Platforms
          </a>
          <a href="#install" onClick={() => setOpen(false)}>
            Install
          </a>
          <a href="#troubleshooting" onClick={() => setOpen(false)}>
            Troubleshooting
          </a>
          <a
            href="#install"
            onClick={() => setOpen(false)}
            className="rounded-full bg-lime px-5 py-2 text-center font-mono text-ink"
          >
            Download now
          </a>
        </nav>
      )}
    </header>
  );
}
