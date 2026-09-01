import { useEffect, useRef, useState } from 'react';

// The exact figlet ("Small Slant") banner the real CLI prints on launch.
const HEADER_ASCII = `  _____           ___     ________
 / ___/__  __ _  / _/_ __/ ___/ (_)__  ___
/ /__/ _ \\/  ' \\/ _/ // / /__/ / / _ \\(_-<
\\___/\\___/_/_/_/_/ \\_, /\\___/_/_/ .__/___/
                  /___/        /_/`;

const PLATFORM_ROWS = [
  'YouTube',
  'Instagram',
  'TikTok',
  'Reddit',
  'Pinterest',
  'X / Twitter',
  'Facebook',
  'Vimeo',
  'Dailymotion',
  'Rumble',
  'LinkedIn',
  'Snapchat',
];

// Each step is one beat of the real ComfyClips session. `hold` is how long
// (ms) this step stays on screen before the next one is appended.
const STEPS = [
  { kind: 'command', text: 'comfyclips', hold: 700 },
  { kind: 'header', hold: 650 },
  { kind: 'select', label: 'Select a social media platform:', hold: 900 },
  { kind: 'answered', label: 'Select a social media platform:', value: 'YouTube', hold: 550 },
  {
    kind: 'answered',
    label: 'Paste the video link:',
    value: 'https://youtu.be/dQw4w9WgXcQ',
    hold: 650,
  },
  { kind: 'answered', label: 'What do you want to download?', value: 'Video', hold: 500 },
  { kind: 'answered', label: 'Select video quality:', value: 'Best available', hold: 500 },
  {
    kind: 'answered',
    label: 'Where should the file be saved?',
    value: '~/Downloads/comfyclips',
    hold: 600,
  },
  { kind: 'summary', hold: 750 },
  { kind: 'answered', label: 'Start download?', value: 'Yes', hold: 350 },
  { kind: 'progress', hold: 1700 },
  { kind: 'done', hold: 3400 },
];

const RESULT_ROWS = [
  ['File', 'never-gonna-give-you-up.mp4'],
  ['Size', '18.4 MB'],
  ['Time taken', '6.1s'],
];

const SUMMARY_ROWS = [
  ['Platform', 'YouTube'],
  ['Link', 'https://youtu.be/dQw4w9WgXcQ'],
  ['Download', 'Video'],
  ['Quality', 'Best available'],
  ['Save to', '~/Downloads/comfyclips'],
];

function Prompt({ label, value, cursor }) {
  return (
    <div className="text-white/90">
      <span className="text-blue-400">? </span>
      {label}
      {value !== undefined && <span className="text-cyan-400"> {value}</span>}
      {cursor && <span className="terminal-cursor" aria-hidden="true" />}
    </div>
  );
}

function Answered({ label, value }) {
  return (
    <div className="text-white/70">
      <span className="text-emerald-400">✔ </span>
      {label} <span className="text-cyan-400">{value}</span>
    </div>
  );
}

function Table({ rows }) {
  const labelWidth = Math.max(...rows.map(([label]) => label.length));
  return (
    <div className="text-white/60">
      {rows.map(([label, value]) => (
        <div key={label}>
          <span className="text-white/40">{label.padEnd(labelWidth, ' ')}</span>{' '}
          <span className="text-white/80">{value}</span>
        </div>
      ))}
    </div>
  );
}

function StepBlock({ step, progress }) {
  switch (step.kind) {
    case 'command':
      return (
        <div className="flex gap-2">
          <span className="text-lime">$</span>
          <span className="text-white/90">{step.text}</span>
        </div>
      );
    case 'header':
      return (
        <div className="my-1 inline-block rounded-md border border-teal/40 px-4 py-2">
          <pre className="font-mono text-teal">{HEADER_ASCII}</pre>
          <div className="mt-1 text-center text-white/50">Social Media Video Downloader</div>
          <div className="text-center text-white/30">Press esc to quit</div>
        </div>
      );
    case 'select':
      return (
        <div>
          <Prompt label={step.label} />
          <div className="mt-1 inline-block rounded border border-white/15 px-3 py-2">
            {PLATFORM_ROWS.map((name, i) => (
              <div key={name} className={i === 0 ? 'text-cyan-400' : 'text-white/40'}>
                {i === 0 ? '❯ ● ' : '  ○ '}
                {name}
              </div>
            ))}
          </div>
        </div>
      );
    case 'answered':
      return <Answered label={step.label} value={step.value} />;
    case 'summary':
      return (
        <div>
          <div className="mb-1 text-white/70">Review your selection</div>
          <Table rows={SUMMARY_ROWS} />
        </div>
      );
    case 'progress':
      return (
        <div className="flex items-center gap-3 text-white/70">
          <span>Downloading</span>
          <span className="h-2 w-32 overflow-hidden rounded-full bg-white/10">
            <span
              className="block h-full rounded-full bg-cyan-400 transition-[width] duration-[1500ms] ease-out"
              style={{ width: `${progress}%` }}
            />
          </span>
          <span className="tabular-nums">{progress}%</span>
        </div>
      );
    case 'done':
      return (
        <div>
          <div className="mb-1 flex gap-2 text-emerald-400">
            <span>✔</span>
            <span>Download complete</span>
          </div>
          <Table rows={RESULT_ROWS} />
        </div>
      );
    default:
      return null;
  }
}

export default function TerminalDemo() {
  const [visible, setVisible] = useState(1);
  const [progress, setProgress] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(query.matches);
    const handler = (e) => setReducedMotion(e.matches);
    query.addEventListener('change', handler);
    return () => query.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      setVisible(STEPS.length);
      setProgress(100);
      return;
    }

    let timeoutId;
    let cursor = 0;

    const advance = () => {
      const step = STEPS[cursor];
      timeoutId = setTimeout(() => {
        cursor += 1;
        if (cursor >= STEPS.length) {
          timeoutId = setTimeout(() => {
            setVisible(1);
            setProgress(0);
            cursor = 0;
            advance();
          }, 1400);
          return;
        }
        setVisible(cursor + 1);
        if (STEPS[cursor].kind === 'progress') {
          requestAnimationFrame(() => setProgress(100));
        }
        advance();
      }, step.hold);
    };

    advance();
    return () => clearTimeout(timeoutId);
  }, [reducedMotion]);

  useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [visible]);

  const shown = STEPS.slice(0, visible);

  return (
    <div className="w-full max-w-[30rem] rounded-2xl border border-white/10 bg-ink shadow-2xl shadow-black/40">
      <div className="flex items-center gap-2 rounded-t-2xl border-b border-white/10 bg-white/[0.03] px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
        <span className="ml-2 text-xs text-white/40">zsh — comfyclips</span>
      </div>
      <div
        ref={scrollRef}
        className="h-[22rem] overflow-y-auto p-4 font-mono text-[13px] leading-6 sm:text-sm"
      >
        <div className="flex flex-col gap-2">
          {shown.map((step, i) => (
            <StepBlock key={i} step={step} progress={progress} />
          ))}
          {!reducedMotion && <span className="terminal-cursor" aria-hidden="true" />}
        </div>
      </div>
    </div>
  );
}
