import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useId, useMemo, useState } from 'react';
import {
  FaBolt,
  FaCheckCircle,
  FaClock,
  FaDownload,
  FaExclamationTriangle,
  FaFileAudio,
  FaFileVideo,
  FaLightbulb,
  FaLinkedin,
  FaMagic,
  FaMusic,
  FaPlay,
  FaRedo,
  FaShieldAlt,
  FaSpinner,
} from 'react-icons/fa';
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

const QUALITIES = [
  { key: 'best', label: 'Best Quality' },
  { key: '1080p', label: '1080p' },
  { key: '720p', label: '720p' },
  { key: '480p', label: '480p' },
];

const AUDIO_FORMATS = ['mp3', 'm4a', 'wav', 'opus'];

const PLATFORM_INFO = [
  { name: 'YouTube', icon: SiYoutube, pattern: /(^|\.)youtube\.com$|^youtu\.be$/i },
  { name: 'Instagram', icon: SiInstagram, pattern: /(^|\.)instagram\.com$/i },
  { name: 'TikTok', icon: SiTiktok, pattern: /(^|\.)tiktok\.com$/i },
  { name: 'Reddit', icon: SiReddit, pattern: /(^|\.)reddit\.com$|^v\.redd\.it$|^redd\.it$/i },
  { name: 'Pinterest', icon: SiPinterest, pattern: /(^|\.)pinterest\.[a-z.]+$|^pin\.it$/i },
  { name: 'X / Twitter', icon: SiX, pattern: /(^|\.)twitter\.com$|(^|\.)x\.com$/i },
  { name: 'Facebook', icon: SiFacebook, pattern: /(^|\.)facebook\.com$|^fb\.watch$/i },
  { name: 'Vimeo', icon: SiVimeo, pattern: /(^|\.)vimeo\.com$/i },
  { name: 'Dailymotion', icon: SiDailymotion, pattern: /(^|\.)dailymotion\.com$|^dai\.ly$/i },
  { name: 'Rumble', icon: SiRumble, pattern: /(^|\.)rumble\.com$/i },
  { name: 'LinkedIn', icon: FaLinkedin, pattern: /(^|\.)linkedin\.com$|^lnkd\.in$/i },
  { name: 'Snapchat', icon: SiSnapchat, pattern: /(^|\.)snapchat\.com$/i },
];

const FUN_TIPS = [
  {
    icon: FaMagic,
    text: 'Auto-optimizing streams to standard H.264 & AAC for 100% QuickTime & mobile playback.',
  },
  {
    icon: FaShieldAlt,
    text: '100% Private: Ephemeral server processing, zero analytics, zero logs saved.',
  },
  {
    icon: FaBolt,
    text: 'Merging best available audio & video tracks cleanly via static ffmpeg build.',
  },
  {
    icon: FaLightbulb,
    text: 'Pro-tip: You can also use comfyclips directly in your terminal for ultra-fast downloads.',
  },
];

const STAGES = [
  { id: 1, label: 'Connecting', desc: 'Fetching metadata & stream URLs' },
  { id: 2, label: 'Extracting', desc: 'Downloading highest quality streams' },
  { id: 3, label: 'Optimizing', desc: 'Encoding H.264 & AAC with faststart' },
  { id: 4, label: 'Readying Player', desc: 'Preparing live preview player' },
];

const REQUEST_TIMEOUT_MS = 3 * 60 * 1000 + 10_000;

function parseFilename(disposition) {
  const match = disposition?.match(/filename="([^"]+)"/);
  return match ? decodeURIComponent(match[1]) : 'comfyclips-media.mp4';
}

function formatBytes(bytes) {
  if (!bytes || Number.isNaN(bytes)) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  let val = bytes;
  let idx = 0;
  while (val >= 1024 && idx < units.length - 1) {
    val /= 1024;
    idx += 1;
  }
  return `${val.toFixed(1)} ${units[idx]}`;
}

export default function DownloadTool() {
  const inputId = useId();
  const [url, setUrl] = useState('');
  const [mode, setMode] = useState('video');
  const [quality, setQuality] = useState('best');
  const [audioFormat, setAudioFormat] = useState('mp3');

  // Phases: idle | downloading | ready | error
  const [phase, setPhase] = useState('idle');
  const [activeStage, setActiveStage] = useState(1);
  const [progressPercent, setProgressPercent] = useState(0);
  const [receivedBytes, setReceivedBytes] = useState(0);
  const [totalBytes, setTotalBytes] = useState(0);
  const [downloadedFileName, setDownloadedFileName] = useState('');
  const [mediaBlobUrl, setMediaBlobUrl] = useState('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const [error, setError] = useState('');
  const [savedLocally, setSavedLocally] = useState(false);

  // Detect platform in real-time
  const detectedPlatform = useMemo(() => {
    if (!url.trim()) return null;
    try {
      const hostname = new URL(url.trim()).hostname;
      return PLATFORM_INFO.find((p) => p.pattern.test(hostname)) ?? null;
    } catch {
      return null;
    }
  }, [url]);

  // Elapsed timer & tips rotator while downloading
  useEffect(() => {
    let timer;
    let tipTimer;
    let stageTimer;

    if (phase === 'downloading') {
      const startTime = Date.now();
      timer = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);

      tipTimer = setInterval(() => {
        setTipIndex((prev) => (prev + 1) % FUN_TIPS.length);
      }, 4000);

      // Advance through initial stages 1 to 3
      stageTimer = setInterval(() => {
        setActiveStage((curr) => {
          if (curr === 1) return 2;
          if (curr === 2) return 3;
          return curr;
        });
        setProgressPercent((curr) => {
          if (curr < 65) {
            return curr + Math.floor(Math.random() * 8) + 4;
          }
          return curr;
        });
      }, 2200);
    }

    return () => {
      clearInterval(timer);
      clearInterval(tipTimer);
      clearInterval(stageTimer);
    };
  }, [phase]);

  // Clean up blob URL on unmount
  useEffect(() => {
    return () => {
      if (mediaBlobUrl) {
        URL.revokeObjectURL(mediaBlobUrl);
      }
    };
  }, [mediaBlobUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (phase === 'downloading' || !url.trim()) return;

    if (mediaBlobUrl) {
      URL.revokeObjectURL(mediaBlobUrl);
      setMediaBlobUrl('');
    }

    setError('');
    setSavedLocally(false);
    setPhase('downloading');
    setActiveStage(1);
    setProgressPercent(5);
    setReceivedBytes(0);
    setTotalBytes(0);
    setElapsedSeconds(0);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const res = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), mode, quality, audioFormat }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Download failed. Check the link and try again.');
      }

      const contentLength = Number(res.headers.get('Content-Length')) || 0;
      setTotalBytes(contentLength);
      const filename = parseFilename(res.headers.get('Content-Disposition'));
      setDownloadedFileName(filename);

      // Transition to Stage 4: Preparing preview
      setActiveStage(4);
      const reader = res.body.getReader();
      const chunks = [];
      let received = 0;

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        received += value.length;
        setReceivedBytes(received);

        if (contentLength > 0) {
          const ratio = received / contentLength;
          setProgressPercent(Math.max(65, Math.min(100, Math.round(65 + ratio * 35))));
        } else {
          setProgressPercent((prev) => Math.min(95, prev + 2));
        }
      }

      setProgressPercent(100);

      // Create preview object URL (no automatic forced download)
      const mimeType = mode === 'audio' ? 'audio/mpeg' : 'video/mp4';
      const blob = new Blob(chunks, { type: mimeType });
      const objectUrl = URL.createObjectURL(blob);
      setMediaBlobUrl(objectUrl);
      setPhase('ready');
    } catch (err) {
      setPhase('error');
      setError(
        err.name === 'AbortError'
          ? 'Download took too long. Try a shorter clip or lower quality setting.'
          : err.message
      );
    } finally {
      clearTimeout(timeoutId);
    }
  };

  const handleDownloadFile = () => {
    if (!mediaBlobUrl) return;
    const link = document.createElement('a');
    link.href = mediaBlobUrl;
    link.download = downloadedFileName || (mode === 'video' ? 'clip.mp4' : `audio.${audioFormat}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    setSavedLocally(true);
  };

  const handleReset = () => {
    if (mediaBlobUrl) {
      URL.revokeObjectURL(mediaBlobUrl);
      setMediaBlobUrl('');
    }
    setPhase('idle');
    setProgressPercent(0);
    setSavedLocally(false);
    setError('');
  };

  const currentTip = FUN_TIPS[tipIndex];
  const TipIcon = currentTip.icon;

  return (
    <section id="download" className="mx-auto max-w-4xl px-5 py-16 sm:px-8 sm:py-20">
      <div className="text-center sm:text-left">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-lime px-3 py-1 font-mono text-xs font-semibold text-ink">
          #InBrowserTool
        </span>
        <h2 className="mt-4 font-display text-3xl tracking-tight sm:text-4xl">
          Or just paste a link
        </h2>
        <p className="mt-3 max-w-2xl font-body text-lg text-ink/70">
          Same tool, no install. This form runs the identical downloader on our server, generates
          a live preview, and lets you download straight to your device.
        </p>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-ink/10 bg-white p-6 shadow-sm sm:p-8">
        {/* URL Input & Platform Indicator */}
        <form onSubmit={handleSubmit}>
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor={inputId} className="font-body text-sm font-medium text-ink/70">
                Video link
              </label>
              {detectedPlatform && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-ink/5 border border-ink/10 px-3 py-1 font-mono text-xs font-medium text-ink"
                >
                  <detectedPlatform.icon className="h-3.5 w-3.5 text-lime-deep" />
                  <span>{detectedPlatform.name} detected</span>
                </motion.span>
              )}
            </div>

            <div className="relative mt-2">
              <input
                id={inputId}
                type="url"
                required
                disabled={phase === 'downloading'}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=... or https://instagram.com/reel/..."
                className="w-full rounded-xl border border-ink/15 bg-paper px-4 py-3 font-mono text-sm text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-ink disabled:opacity-50"
              />
            </div>
          </div>

          {/* Mode & Format Selection */}
          <div className="mt-5 flex flex-wrap gap-2">
            {['video', 'audio'].map((m) => (
              <button
                key={m}
                type="button"
                disabled={phase === 'downloading'}
                onClick={() => setMode(m)}
                className={`rounded-full px-4 py-1.5 font-mono text-xs font-medium capitalize transition-colors ${
                  mode === m
                    ? 'bg-ink text-paper'
                    : 'bg-ink/5 text-ink/60 hover:bg-ink/10'
                }`}
              >
                {m === 'video' ? 'Video' : 'Audio only'}
              </button>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {mode === 'video'
              ? QUALITIES.map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    disabled={phase === 'downloading'}
                    onClick={() => setQuality(key)}
                    className={`rounded-full px-3.5 py-1.5 font-mono text-xs font-medium transition-colors ${
                      quality === key
                        ? 'bg-lime text-ink'
                        : 'bg-ink/5 text-ink/60 hover:bg-ink/10'
                    }`}
                  >
                    {label}
                  </button>
                ))
              : AUDIO_FORMATS.map((format) => (
                  <button
                    key={format}
                    type="button"
                    disabled={phase === 'downloading'}
                    onClick={() => setAudioFormat(format)}
                    className={`rounded-full px-3.5 py-1.5 font-mono text-xs font-medium uppercase transition-colors ${
                      audioFormat === format
                        ? 'bg-lime text-ink'
                        : 'bg-ink/5 text-ink/60 hover:bg-ink/10'
                    }`}
                  >
                    {format}
                  </button>
                ))}
          </div>

          {/* Submit Action (Only in idle mode) */}
          {phase === 'idle' && (
            <div className="mt-6">
              <button
                type="submit"
                disabled={!url.trim()}
                className="w-full rounded-xl bg-ink px-6 py-3.5 font-mono text-sm font-medium text-paper transition-opacity disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:min-w-[14rem]"
              >
                Fetch & Preview {mode === 'video' ? 'Video' : 'Audio'} →
              </button>
            </div>
          )}
        </form>

        {/* Dynamic States: Processing Pipeline or Live Preview */}
        <div className="mt-6">
          <AnimatePresence mode="wait">
            {phase === 'downloading' && (
              <motion.div
                key="downloading"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="rounded-xl border border-ink/10 bg-paper p-5 sm:p-6"
              >
                {/* Header with timer */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <FaSpinner className="h-4 w-4 animate-spin text-ink" />
                    <span className="font-display text-sm uppercase tracking-wider text-ink">
                      Extracting Media Stream...
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-xs text-ink/50">
                    <FaClock className="h-3 w-3 text-ink/40" />
                    <span>{elapsedSeconds}s elapsed</span>
                  </div>
                </div>

                {/* Progress Bar styled strictly with theme */}
                <div className="mt-4">
                  <div className="flex justify-between font-mono text-xs font-medium text-ink/70">
                    <span>{STAGES[activeStage - 1]?.label}</span>
                    <span className="font-bold text-ink">{progressPercent}%</span>
                  </div>
                  <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-ink/10">
                    <motion.div
                      className="h-full rounded-full bg-lime"
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ ease: 'easeOut', duration: 0.2 }}
                    />
                  </div>
                  {totalBytes > 0 && (
                    <div className="mt-1 text-right font-mono text-[11px] text-ink/45">
                      {formatBytes(receivedBytes)} / {formatBytes(totalBytes)}
                    </div>
                  )}
                </div>

                {/* 4-Step Interactive Pipeline with Theme Colors */}
                <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {STAGES.map((s) => {
                    const isComplete = activeStage > s.id;
                    const isCurrent = activeStage === s.id;
                    return (
                      <div
                        key={s.id}
                        className={`rounded-xl border p-3 transition-colors ${
                          isCurrent
                            ? 'border-ink bg-white shadow-sm'
                            : isComplete
                            ? 'border-ink/10 bg-ink/5 text-ink'
                            : 'border-ink/5 bg-transparent opacity-40'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-lime-deep">
                          <span>0{s.id}.</span>
                          <span>{s.label}</span>
                        </div>
                        <p className="mt-1 font-body text-xs text-ink/60 leading-snug">
                          {s.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Dynamic Rotating Tip with clean React Icon */}
                <div className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-ink/5 bg-white px-4 py-2.5 text-center">
                  <TipIcon className="h-3.5 w-3.5 text-lime-deep shrink-0" />
                  <p className="font-body text-xs text-ink/65">
                    {currentTip.text}
                  </p>
                </div>
              </motion.div>
            )}

            {phase === 'ready' && mediaBlobUrl && (
              <motion.div
                key="ready"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-xl border border-ink/10 bg-paper p-5 sm:p-6"
              >
                <div className="flex items-center justify-between border-b border-ink/10 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-lime" />
                    <span className="font-display text-sm uppercase tracking-wider text-ink">
                      Live Preview Ready
                    </span>
                  </div>
                  {totalBytes > 0 && (
                    <span className="font-mono text-xs text-ink/60">
                      {formatBytes(totalBytes)}
                    </span>
                  )}
                </div>

                {/* Live Embedded Media Player */}
                <div className="mt-4">
                  {mode === 'video' ? (
                    <div className="relative overflow-hidden rounded-xl bg-ink shadow-sm">
                      <video
                        src={mediaBlobUrl}
                        controls
                        playsInline
                        autoPlay
                        className="max-h-[26rem] w-full rounded-xl object-contain bg-ink"
                      />
                    </div>
                  ) : (
                    <div className="rounded-xl border border-ink/10 bg-white p-6 text-center">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-lime text-ink">
                        <FaMusic className="h-6 w-6" />
                      </div>
                      <p className="mt-3 font-display text-base tracking-tight text-ink truncate">
                        {downloadedFileName}
                      </p>
                      <div className="mt-4">
                        <audio src={mediaBlobUrl} controls autoPlay className="w-full" />
                      </div>
                    </div>
                  )}
                </div>

                {/* File Metadata Info with vector icons */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-ink/10 bg-white p-3 font-mono text-xs">
                  <div className="flex items-center gap-2 truncate max-w-sm text-ink font-medium">
                    {mode === 'video' ? (
                      <FaFileVideo className="h-3.5 w-3.5 text-ink/60 shrink-0" />
                    ) : (
                      <FaFileAudio className="h-3.5 w-3.5 text-ink/60 shrink-0" />
                    )}
                    <span className="truncate">{downloadedFileName}</span>
                  </div>
                  <span className="rounded bg-lime/20 px-2 py-0.5 font-semibold text-ink">
                    {mode === 'video' ? 'H.264/AAC MP4' : `${audioFormat.toUpperCase()}`}
                  </span>
                </div>

                {/* Action Buttons with vector icons */}
                <div className="mt-5 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={handleDownloadFile}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-ink px-6 py-3.5 font-mono text-sm font-medium text-paper transition-all hover:bg-ink/90"
                  >
                    {savedLocally ? (
                      <FaCheckCircle className="h-3.5 w-3.5 text-lime" />
                    ) : (
                      <FaDownload className="h-3.5 w-3.5 text-lime" />
                    )}
                    <span>{savedLocally ? 'Downloaded — Save Again?' : `Download ${mode === 'video' ? 'Video (.mp4)' : 'Audio'}`}</span>
                    {totalBytes > 0 && <span className="text-paper/50 font-normal">({formatBytes(totalBytes)})</span>}
                  </button>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="flex items-center justify-center gap-2 rounded-xl border border-ink/15 bg-white px-5 py-3.5 font-mono text-sm font-medium text-ink transition-colors hover:bg-ink/5"
                  >
                    <FaRedo className="h-3 w-3 text-ink/60" />
                    <span>Download Another</span>
                  </button>
                </div>
              </motion.div>
            )}

            {phase === 'error' && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-xl border border-red-200 bg-red-50/70 p-5 text-center"
              >
                <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-red-100 text-red-600">
                  <FaExclamationTriangle className="h-4 w-4" />
                </div>
                <h4 className="mt-2 font-display text-base text-red-950">
                  Download Failed
                </h4>
                <p className="mt-1 font-body text-sm text-red-700">{error}</p>
                <button
                  type="button"
                  onClick={handleReset}
                  className="mt-3 rounded-lg bg-ink px-4 py-2 font-mono text-xs font-medium text-paper hover:bg-ink/90"
                >
                  Try Again
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="mt-5 font-body text-xs text-ink/40">
          Runs on our server and streams straight to your device — the file isn't kept afterward.
          Supports YouTube, TikTok, Instagram, Reddit, Pinterest, Vimeo, Facebook, X, and more.
        </p>
      </div>
    </section>
  );
}
