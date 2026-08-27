export default function Footer() {
  return (
    <footer className="border-t border-ink/10 bg-paper px-5 py-12 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-ink/10 shadow-xs p-1">
            <img
              src="/comfyclips-icon.png"
              alt="ComfyClips Logo"
              className="h-full w-full object-contain"
              width="40"
              height="40"
              loading="lazy"
            />
          </div>
          <span className="font-display text-base tracking-tight text-ink">ComfyClips</span>
        </div>

        <p className="max-w-xl font-body text-xs leading-relaxed text-ink/50">
          Not affiliated with YouTube, Instagram, TikTok, Reddit, Pinterest, Vimeo, Facebook, X, or any other platform.
          Downloading content you don&apos;t own or don&apos;t have rights to may violate that platform&apos;s terms of service or
          copyright law — use responsibly.
        </p>

        <div className="flex items-center gap-4 font-mono text-xs text-ink/60">
          <a
            href="https://github.com/Hamza-Imran435/ComfyClips"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-ink underline decoration-lime decoration-2 underline-offset-4"
          >
            GitHub
          </a>
          <span>•</span>
          <span>ISC License</span>
        </div>
      </div>
    </footer>
  );
}
