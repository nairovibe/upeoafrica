import { stripTags } from "@/components/blog/analysis";

/** Plain excerpt for a card. Drops a leading repeat of the product name. */
export function productBlurb(title: string, html: string, max = 140) {
  const text = stripTags(html).replace(/\s+/g, " ").trim();
  const name = title.trim();
  const rest = name && text.toLowerCase().startsWith(name.toLowerCase())
    ? text.slice(name.length).replace(/^[\s.,:;]+/, "")
    : text;
  const source = rest || text;
  if (source.length <= max) return source;
  const cut = source.slice(0, max);
  const word = cut.replace(/\s+\S*$/, "");
  return word || cut;
}
