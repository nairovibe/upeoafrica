/** The token already published in the site head. Kept so the tag stays up if the setting is empty. */
export const GOOGLE_VERIFICATION_FALLBACK = "WvISEi4b4smIm2spDJfIUWGCecyCqRq-WS5bdXAyj_M";

export const VERIFY = {
  google: /^[A-Za-z0-9_-]{20,120}$/,
  bing: /^[A-Za-z0-9]{10,80}$/,
  baidu: /^[A-Za-z0-9]{8,80}$/,
  yandex: /^[A-Za-z0-9]{8,80}$/,
  facebook: /^[A-Za-z0-9]{8,80}$/,
  pixel: /^\d{8,20}$/,
  ads: /^AW-\d{5,20}(?:\/[A-Za-z0-9_-]{1,40})?$/i,
} as const;

/** Accepts a bare token or a pasted meta tag, and returns the content value. */
export function metaContent(raw: string | null | undefined) {
  if (!raw) return "";
  const pasted = raw.match(/content\s*=\s*["']([^"']+)["']/i);
  return (pasted?.[1] ?? raw).trim();
}

export function matchToken(raw: string | null | undefined, pattern: RegExp) {
  const value = metaContent(raw);
  return pattern.test(value) ? value : "";
}
