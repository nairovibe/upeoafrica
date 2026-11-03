export type ParsedVideo = {
  provider: "youtube" | "vimeo";
  id: string;
  embedUrl: string;
  thumbUrl: string | null;
};

export function parseVideoUrl(raw: string | null | undefined): ParsedVideo | null {
  const value = (raw ?? "").trim();
  if (!value) return null;
  let url: URL;
  try {
    url = new URL(value.startsWith("http") ? value : `https://${value}`);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\.|^m\./, "");

  let youtubeId: string | null = null;
  if (host === "youtu.be") youtubeId = url.pathname.slice(1).split("/")[0] || null;
  if (host === "youtube.com" || host === "youtube-nocookie.com" || host === "music.youtube.com") {
    if (url.pathname === "/watch") youtubeId = url.searchParams.get("v");
    const match = url.pathname.match(/^\/(?:embed|shorts|live|v)\/([^/?#]+)/);
    if (match) youtubeId = match[1];
  }
  if (youtubeId && /^[\w-]{6,}$/.test(youtubeId)) {
    return {
      provider: "youtube",
      id: youtubeId,
      embedUrl: `https://www.youtube-nocookie.com/embed/${youtubeId}`,
      thumbUrl: `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`,
    };
  }

  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const match = url.pathname.match(/\/(?:video\/)?(\d+)/);
    if (match) {
      return {
        provider: "vimeo",
        id: match[1],
        embedUrl: `https://player.vimeo.com/video/${match[1]}`,
        thumbUrl: null,
      };
    }
  }
  return null;
}
