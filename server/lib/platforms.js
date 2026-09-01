export const PLATFORMS = [
  {
    name: 'YouTube',
    value: 'youtube',
    hostPattern: /(^|\.)youtube\.com$|^youtu\.be$/i,
  },
  {
    name: 'Instagram',
    value: 'instagram',
    hostPattern: /(^|\.)instagram\.com$/i,
  },
  {
    name: 'TikTok',
    value: 'tiktok',
    hostPattern: /(^|\.)tiktok\.com$/i,
  },
  {
    name: 'Reddit',
    value: 'reddit',
    hostPattern: /(^|\.)reddit\.com$|^v\.redd\.it$|^redd\.it$/i,
  },
  {
    name: 'Pinterest',
    value: 'pinterest',
    hostPattern: /(^|\.)pinterest\.[a-z.]+$|^pin\.it$/i,
  },
  {
    name: 'X / Twitter',
    value: 'twitter',
    hostPattern: /(^|\.)twitter\.com$|(^|\.)x\.com$/i,
  },
  {
    name: 'Facebook',
    value: 'facebook',
    hostPattern: /(^|\.)facebook\.com$|^fb\.watch$/i,
  },
  {
    name: 'Vimeo',
    value: 'vimeo',
    hostPattern: /(^|\.)vimeo\.com$/i,
  },
  {
    name: 'Dailymotion',
    value: 'dailymotion',
    hostPattern: /(^|\.)dailymotion\.com$|^dai\.ly$/i,
  },
  {
    name: 'Rumble',
    value: 'rumble',
    hostPattern: /(^|\.)rumble\.com$/i,
  },
  {
    name: 'LinkedIn',
    value: 'linkedin',
    hostPattern: /(^|\.)linkedin\.com$|^lnkd\.in$/i,
  },
  {
    name: 'Snapchat',
    value: 'snapchat',
    hostPattern: /(^|\.)snapchat\.com$/i,
  },
];

export function hostMatchesPlatform(url, platformValue) {
  const platform = PLATFORMS.find((p) => p.value === platformValue);
  if (!platform) return true;
  try {
    const { hostname } = new URL(url);
    return platform.hostPattern.test(hostname);
  } catch {
    return false;
  }
}
