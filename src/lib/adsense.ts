/** Public AdSense publisher id. Safe to ship. It is not a secret. */
export const ADSENSE_CLIENT = "ca-pub-5107827332735434";

export function adsensePublisherId(client = ADSENSE_CLIENT) {
  return client.replace(/^ca-/, "");
}

/** Auto ads run on these public sections only. Checkout and previews stay clear. */
export function adsenseAllowed(path: string) {
  if (path === "/products" || path === "/blogs" || path === "/events") return true;
  if (path === "/privacy" || path === "/terms" || path === "/cookies" || path === "/sla") return true;
  if (/^\/products\/(?!checkout$)[^/]+$/.test(path)) return true;
  if (/^\/blogs\/[^/]+$/.test(path)) return true;
  if (/^\/events\/[^/]+$/.test(path)) return true;
  return false;
}
