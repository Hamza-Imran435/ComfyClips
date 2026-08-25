export default function Footer() {
  return (
    <footer className="border-t border-ink/10 px-5 py-10 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <img src="/comfyclips-icon.png" alt="" className="h-6 w-6" width="24" height="24" />
          <span className="font-display text-sm tracking-tight">ComfyClips</span>
        </div>

        <p className="max-w-lg font-body text-xs leading-relaxed text-ink/45">
          Not affiliated with YouTube, Instagram, TikTok, Facebook, or X. Downloading content you
          don't own or don't have rights to may violate that platform's terms of service or
          copyright law — use responsibly.
        </p>

        <p className="font-mono text-xs text-ink/40">ISC License</p>
      </div>
    </footer>
  );
}
