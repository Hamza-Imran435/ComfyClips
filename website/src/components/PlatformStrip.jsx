import { motion } from 'framer-motion';
import { FaLinkedin } from 'react-icons/fa6';
import {
  SiDailymotion,
  SiFacebook,
  SiInstagram,
  SiPinterest,
  SiReddit,
  SiRumble,
  SiSnapchat,
  SiTiktok,
  SiVimeo,
  SiX,
  SiYoutube,
} from 'react-icons/si';

const PLATFORMS = [
  { name: 'YouTube', icon: SiYoutube },
  { name: 'Instagram', icon: SiInstagram },
  { name: 'TikTok', icon: SiTiktok },
  { name: 'Reddit', icon: SiReddit },
  { name: 'Pinterest', icon: SiPinterest },
  { name: 'X / Twitter', icon: SiX },
  { name: 'Facebook', icon: SiFacebook },
  { name: 'Vimeo', icon: SiVimeo },
  { name: 'Dailymotion', icon: SiDailymotion },
  { name: 'Rumble', icon: SiRumble },
  { name: 'LinkedIn', icon: FaLinkedin },
  { name: 'Snapchat', icon: SiSnapchat },
];

export default function PlatformStrip() {
  return (
    <section id="platforms" className="border-y border-ink/10 bg-ink py-10">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <p className="mb-6 text-center font-mono text-xs uppercase tracking-[0.2em] text-paper/40">
          Works seamlessly with
        </p>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-x-9 gap-y-6"
        >
          {PLATFORMS.map(({ name, icon: Icon }) => (
            <div
              key={name}
              className="flex items-center gap-2.5 text-paper/75 transition-all hover:text-paper hover:scale-105"
            >
              <Icon className="h-5 w-5 text-paper/90" aria-hidden="true" />
              <span className="font-body text-sm font-medium">{name}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
