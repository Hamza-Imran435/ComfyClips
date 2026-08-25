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
    name: 'Facebook',
    value: 'facebook',
    hostPattern: /(^|\.)facebook\.com$|^fb\.watch$/i,
  },
  {
    name: 'X / Twitter',
    value: 'twitter',
    hostPattern: /(^|\.)twitter\.com$|(^|\.)x\.com$/i,
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
