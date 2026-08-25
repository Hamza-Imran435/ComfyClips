import { SiFacebook, SiInstagram, SiTiktok, SiX, SiYoutube } from 'react-icons/si';

const PLATFORMS = [
  { name: 'YouTube', icon: SiYoutube },
  { name: 'Instagram', icon: SiInstagram },
  { name: 'TikTok', icon: SiTiktok },
  { name: 'Facebook', icon: SiFacebook },
  { name: 'X / Twitter', icon: SiX },
];

export default function PlatformStrip() {
  return (
    <section id="platforms" className="border-y border-ink/10 bg-ink py-10">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <p className="mb-6 text-center font-mono text-xs uppercase tracking-[0.2em] text-paper/40">
          Works with
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
          {PLATFORMS.map(({ name, icon: Icon }) => (
            <div key={name} className="flex items-center gap-2.5 text-paper/80">
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span className="font-body text-sm font-medium">{name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
