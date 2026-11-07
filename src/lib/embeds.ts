/**
 * Turns a pasted URL or provider embed snippet into a single https iframe.
 * Hosts here are the only ones the public article sanitiser will keep.
 */

export const IFRAME_HOSTS = [
  "www.youtube.com",
  "youtube.com",
  "www.youtube-nocookie.com",
  "player.vimeo.com",
  "open.spotify.com",
  "w.soundcloud.com",
  "www.google.com",
  "maps.google.com",
  "www.loom.com",
  "codepen.io",
  "www.dailymotion.com",
  "player.twitch.tv",
  "clips.twitch.tv",
  "www.facebook.com",
  "web.facebook.com",
  "www.instagram.com",
  "www.tiktok.com",
  "embed.podcasts.apple.com",
  "calendly.com",
  "cal.com",
  "app.cal.com",
  "docs.google.com",
  "drive.google.com",
  "www.linkedin.com",
] as const;

const HOSTS = new Set<string>(IFRAME_HOSTS);

export type EmbedLayout = "video" | "tall" | "compact" | "panel";

export type EmbedSpec = {
  src: string;
  title: string;
  layout: EmbedLayout;
};

function decode(value: string) {
  return value.replace(/&amp;/g, "&").replace(/&quot;/g, '"').trim();
}

function youtube(id: string) {
  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}`;
}

function hostOf(url: URL) {
  return url.hostname.toLowerCase();
}

/** Known watch pages become player URLs. An iframe src on an allowed host is kept. */
export function toEmbedUrl(raw: string): string | null {
  let url: URL;
  try {
    url = new URL(decode(raw));
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  url.protocol = "https:";
  url.hash = "";
  url.username = "";
  url.password = "";
  const host = hostOf(url);
  const path = url.pathname;

  if (host === "youtu.be") {
    const id = path.split("/").filter(Boolean)[0];
    return id ? youtube(id) : null;
  }
  if (host === "www.youtube.com" || host === "youtube.com" || host === "m.youtube.com" || host === "www.youtube-nocookie.com" || host === "youtube-nocookie.com") {
    const fromPath = path.match(/^\/(?:embed|shorts|live)\/([\w-]{6,})/)?.[1];
    const id = fromPath || url.searchParams.get("v");
    return id ? youtube(id) : null;
  }
  if (host === "player.vimeo.com" && /^\/video\/\d+/.test(path)) return url.toString();
  if (host === "vimeo.com" || host.endsWith(".vimeo.com")) {
    const m = path.match(/\/(\d+)(?:\/([a-f0-9]+))?$/i);
    if (!m) return null;
    return `https://player.vimeo.com/video/${m[1]}${m[2] ? `?h=${m[2]}` : ""}`;
  }
  if (host === "open.spotify.com") {
    if (path.startsWith("/embed/")) return url.toString();
    const m = path.match(/^\/(track|album|playlist|episode|show)\/([A-Za-z0-9]+)/);
    return m ? `https://open.spotify.com/embed/${m[1]}/${m[2]}` : null;
  }
  if (host === "www.loom.com" || host === "loom.com") {
    const id = path.match(/^\/(?:share|embed)\/([a-f0-9]+)/i)?.[1];
    return id ? `https://www.loom.com/embed/${id}` : null;
  }
  if (host === "codepen.io") {
    const embed = path.match(/^\/([^/]+)\/embed\/([^/]+)/);
    const pen = path.match(/^\/([^/]+)\/pen\/([^/]+)/);
    const hit = embed || pen;
    return hit ? `https://codepen.io/${hit[1]}/embed/${hit[2]}?default-tab=result` : null;
  }
  if ((host === "www.google.com" || host === "maps.google.com") && path.includes("/maps")) {
    return path.includes("/embed") ? url.toString() : null;
  }
  if (host === "docs.google.com") {
    const doc = path.match(/^\/(document|presentation|spreadsheets)\/d\/([^/]+)/);
    if (!doc) return null;
    if (doc[1] === "presentation") return `https://docs.google.com/presentation/d/${doc[2]}/embed`;
    if (doc[1] === "document") return `https://docs.google.com/document/d/${doc[2]}/preview`;
    return `https://docs.google.com/spreadsheets/d/${doc[2]}/preview`;
  }
  if (host === "drive.google.com") {
    const file = path.match(/^\/file\/d\/([^/]+)/);
    return file ? `https://drive.google.com/file/d/${file[1]}/preview` : null;
  }
  if (host === "www.dailymotion.com" || host === "dailymotion.com") {
    const id = path.match(/\/video\/([a-z0-9]+)/i)?.[1];
    return id ? `https://www.dailymotion.com/embed/video/${id}` : null;
  }
  if (host === "www.tiktok.com") {
    if (path.startsWith("/embed/")) return url.toString();
    const id = path.match(/\/video\/(\d+)/)?.[1];
    return id ? `https://www.tiktok.com/embed/v2/${id}` : null;
  }
  if (host === "www.instagram.com" || host === "instagram.com") {
    if (path.includes("/embed")) return url.toString();
    const m = path.match(/^\/(p|reel|tv)\/([^/]+)/);
    return m ? `https://www.instagram.com/${m[1]}/${m[2]}/embed` : null;
  }
  if ((host === "www.facebook.com" || host === "web.facebook.com") && path.startsWith("/plugins/")) return url.toString();
  if (host === "w.soundcloud.com" && path.startsWith("/player")) return url.toString();
  if (host === "player.twitch.tv" || host === "clips.twitch.tv") return url.toString();
  if (host === "embed.podcasts.apple.com") return url.toString();
  if (host === "www.linkedin.com" && path.startsWith("/embed/")) return url.toString();
  if (host === "calendly.com" && path.split("/").filter(Boolean).length >= 1) return url.toString();
  if ((host === "cal.com" || host === "app.cal.com") && path.split("/").filter(Boolean).length >= 1) return url.toString();
  return null;
}

function layoutFor(src: string, width: number, height: number): EmbedLayout {
  const host = new URL(src).hostname;
  const path = new URL(src).pathname;
  if (host.includes("spotify") && /\/(album|playlist|show)\//.test(path)) return "panel";
  if (/spotify|soundcloud|podcasts\.apple/.test(host)) return "compact";
  if (height > 0 && height <= 200) return "compact";
  if (host.includes("google") && src.includes("maps")) return "tall";
  if (width > 0 && height > 0 && width / height < 1.45) return "tall";
  return "video";
}

function titleFor(src: string, given: string) {
  const title = given.trim();
  if (title) return title.slice(0, 140);
  const host = new URL(src).hostname;
  if (host.includes("youtube")) return "YouTube video";
  if (host.includes("vimeo")) return "Vimeo video";
  if (host.includes("spotify")) return "Spotify";
  if (host.includes("loom")) return "Loom video";
  if (host.includes("google") && src.includes("maps")) return "Google Maps";
  if (host.includes("codepen")) return "CodePen";
  return "Embedded content";
}

function accept(src: string, title: string, width = 0, height = 0): EmbedSpec | null {
  if (!HOSTS.has(new URL(src).hostname)) return null;
  return { src, title: titleFor(src, title), layout: layoutFor(src, width, height) };
}

function fromIframe(raw: string): EmbedSpec | null {
  const cleaned = raw.replace(/<script[\s\S]*?<\/script>/gi, "");
  const match = /<iframe\b([^>]*)>/i.exec(cleaned);
  if (!match) return null;
  const attrs = match[1];
  const src = /src\s*=\s*["']([^"']+)["']/i.exec(attrs)?.[1];
  if (!src) return null;
  const leftover = cleaned
    .replace(match[0], "")
    .replace(/<\/iframe>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .trim();
  if (leftover.length > 160) return null;
  const embed = toEmbedUrl(src);
  if (!embed) return null;
  const title = /title\s*=\s*["']([^"']*)["']/i.exec(attrs)?.[1] ?? "";
  const width = Number(/width\s*=\s*["'](\d+)["']/i.exec(attrs)?.[1] ?? 0);
  const height = Number(/height\s*=\s*["'](\d+)["']/i.exec(attrs)?.[1] ?? 0);
  return accept(embed, title, width, height);
}

/** A bare URL, or embed code that is essentially one iframe. Anything else is left as writing. */
export function parseEmbed(input: string): EmbedSpec | null {
  const raw = input.trim();
  if (!raw || raw.length > 8000) return null;
  if (/<iframe\b/i.test(raw)) return fromIframe(raw);
  if (!/^https?:\/\/\S+$/i.test(raw)) return null;
  const src = toEmbedUrl(raw);
  return src ? accept(src, "") : null;
}
