const FORBIDDEN_CHARS = /[\u0000-\u001F\u007F]/g;
const MULTI_WHITESPACE = /\s+/g;
const DANGEROUS_PROTOCOLS = /^(?:javascript:|data:|vbscript:)/i;
const HTML_TAG = /<[^>]*>/g;

export function sanitizePlainText(input: unknown, maxLen: number): string {
  const raw = String(input ?? '')
    .replaceAll('\u0000', '')
    .slice(0, maxLen * 4);
  const withoutCtrl = raw.replace(FORBIDDEN_CHARS, ' ');
  const withoutTags = withoutCtrl.replace(HTML_TAG, ' ');
  const collapsed = withoutTags.replace(MULTI_WHITESPACE, ' ').trim();
  return collapsed.slice(0, maxLen);
}

export function preventUrlInjection(s: string): string {
  const trimmed = s.trim();
  if (DANGEROUS_PROTOCOLS.test(trimmed)) return '';
  return trimmed;
}

export function generateNickname(seed?: string): string {
  const adjectives = [
    'Swift',
    'Crafty',
    'Brave',
    'Nimble',
    'Zen',
    'Mighty',
    'Witty',
    'Cosmic',
  ];
  const nouns = [
    'Yak',
    'Fox',
    'Hawk',
    'Otter',
    'Panda',
    'Falcon',
    'Tiger',
    'Lynx',
  ];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const suffix = Math.floor(100 + Math.random() * 900);
  const base = `${adj}${noun}${suffix}`;
  const combined = seed ? `${seed}-${base}` : base;
  return sanitizePlainText(combined, 24);
}
