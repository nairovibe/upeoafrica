export type PluginCard = { title: string; html: string };
export type PluginGroup = { title: string | null; html: string; cards: PluginCard[] };

function textOf(html: string) {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

/** Split sanitized product HTML into a short intro and feature groups. */
export function pluginSheet(html: string): { intro: string; groups: PluginGroup[] } {
  const chunks = html
    .split(/(?=<h[23]\b)/i)
    .map((part) => part.trim())
    .filter(Boolean);
  let intro = "";
  const groups: PluginGroup[] = [];
  let current: PluginGroup | null = null;

  for (const chunk of chunks) {
    const match = chunk.match(/^<h([23])\b[^>]*>([\s\S]*?)<\/h\1>([\s\S]*)$/i);
    if (!match) {
      intro += chunk;
      continue;
    }
    const level = match[1];
    const title = textOf(match[2]);
    const body = match[3].trim();
    if (level === "2") {
      current = { title, html: body, cards: [] };
      groups.push(current);
      continue;
    }
    if (!current) {
      current = { title: null, html: "", cards: [] };
      groups.push(current);
    }
    current.cards.push({ title, html: body });
  }

  return { intro, groups };
}
