import { motion } from 'framer-motion';

const FEATURES = [
  {
    tag: 'FORMAT',
    title: 'Video, or just the audio',
    body: 'Save the full clip or pull out audio only — mp3, m4a, wav or opus — straight from the same prompt.',
  },
  {
    tag: 'QUALITY',
    title: 'No watermark, full HD',
    body: 'Pulled straight from the source on every supported platform, so clips come out watermark-free — best available quality, or cap it at 1080p, 720p, 480p.',
  },
  {
    tag: 'SETUP',
    title: 'Sets itself up',
    body: "No yt-dlp or ffmpeg on your PATH? ComfyClips downloads what it needs once, automatically, and gets out of your way.",
  },
  {
    tag: 'CONTROL',
    title: 'Esc quits. Every time.',
    body: 'Change your mind mid-prompt? Hit esc. It exits cleanly with no hanging processes or corrupt files.',
  },
];

export default function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.4 }}
        className="mb-12 max-w-xl"
      >
        <span className="inline-flex items-center rounded-full bg-lime px-3 py-1 font-mono text-xs font-semibold text-ink">
          #BuiltForSpeed
        </span>
        <h2 className="mt-3 font-display text-3xl tracking-tight sm:text-4xl">
          Everything you need, nothing you don&apos;t.
        </h2>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2">
        {FEATURES.map(({ tag, title, body }, idx) => (
          <motion.div
            key={tag}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            className="group rounded-2xl border border-ink/10 bg-white p-8 shadow-xs transition-all hover:border-ink/20 hover:shadow-md"
          >
            <span className="font-mono text-xs font-semibold tracking-widest text-lime-deep">
              {tag}
            </span>
            <h3 className="mt-3 font-display text-xl tracking-tight text-ink transition-colors group-hover:text-lime-deep">
              {title}
            </h3>
            <p className="mt-2 font-body text-[0.95rem] leading-relaxed text-ink/65">{body}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
