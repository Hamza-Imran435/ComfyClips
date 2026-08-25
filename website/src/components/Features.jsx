const FEATURES = [
  {
    tag: 'FORMAT',
    title: 'Video, or just the audio',
    body: 'Save the full clip or pull out audio only — mp3, m4a, wav or opus — straight from the same prompt.',
  },
  {
    tag: 'QUALITY',
    title: 'Pick your resolution',
    body: 'Best available, or cap it at 1080p, 720p, 480p. No hunting through a dozen ad-wrapped quality buttons.',
  },
  {
    tag: 'SETUP',
    title: 'Sets itself up',
    body: "No yt-dlp on your PATH? ComfyClips downloads it once, automatically, into ~/.comfyclips and gets out of your way.",
  },
  {
    tag: 'CONTROL',
    title: 'Esc quits. Every time.',
    body: 'Change your mind mid-prompt? Hit esc. It exits cleanly, no half-written files, no hanging process.',
  },
];

export default function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
      <div className="mb-12 max-w-xl">
        <h2 className="font-display text-3xl tracking-tight sm:text-4xl">
          Everything the terminal needs, nothing it doesn't.
        </h2>
      </div>

      <div className="grid gap-px overflow-hidden rounded-2xl border border-ink/10 bg-ink/10 sm:grid-cols-2">
        {FEATURES.map(({ tag, title, body }) => (
          <div key={tag} className="bg-paper p-8">
            <span className="font-mono text-xs font-semibold tracking-widest text-lime-deep">
              {tag}
            </span>
            <h3 className="mt-3 font-display text-xl tracking-tight">{title}</h3>
            <p className="mt-2 font-body text-[0.95rem] leading-relaxed text-ink/65">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
