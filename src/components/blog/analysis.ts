/*
  Pure text and SEO helpers shared by the console editor (browser) and the
  public blog (server). Regex based on purpose: no DOM, no sanitize-html, so
  the editor bundle stays small and the server needs no DOM shim.
*/

export const WORDS_PER_MINUTE = 220;

const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&#x27;": "'",
  "&nbsp;": " ",
};

export function decodeEntities(value: string) {
  return value.replace(/&(amp|lt|gt|quot|nbsp|#39|#x27);/g, (m) => ENTITIES[m] ?? m);
}

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function isHtml(body: string) {
  return /<\/?(p|h[1-6]|ul|ol|li|a|img|figure|div|blockquote|pre|br|strong|em)\b[^>]*>/i.test(body);
}

/** Plain-text bodies from the old textarea: blank lines split paragraphs. */
export function legacyToHtml(text: string) {
  return text
    .split(/\r?\n\s*\r?\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => `<p>${escapeHtml(block).replace(/\r?\n/g, "<br>")}</p>`)
    .join("");
}

export function toHtml(body: string) {
  return isHtml(body) ? body : legacyToHtml(body);
}

export function stripTags(html: string) {
  return decodeEntities(html.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
}

export function htmlToText(html: string) {
  return decodeEntities(
    html
      .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
      .replace(/<\/(p|h[1-6]|li|blockquote|pre|figcaption|div)>/gi, "\n")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s+/g, "\n")
    .trim();
}

export function countWords(text: string) {
  const words = text.trim().match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu);
  return words ? words.length : 0;
}

export function readingMinutes(words: number) {
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

export function headingId(text: string) {
  return (
    text
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "section"
  );
}

export type Heading = { level: number; text: string };

export function extractHeadings(html: string): Heading[] {
  const out: Heading[] = [];
  const re = /<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) out.push({ level: Number(m[1]), text: stripTags(m[2]) });
  return out;
}

function paragraphs(html: string) {
  const out: string[] = [];
  const re = /<p\b[^>]*>([\s\S]*?)<\/p>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const text = stripTags(m[1]);
    if (text) out.push(text);
  }
  return out;
}

function links(html: string) {
  const out: string[] = [];
  const re = /<a\b[^>]*\bhref="([^"]*)"/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) out.push(decodeEntities(m[1]));
  return out;
}

function images(html: string) {
  const out: { alt: string }[] = [];
  const re = /<img\b[^>]*>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const alt = /\balt="([^"]*)"/i.exec(m[0]);
    out.push({ alt: alt ? decodeEntities(alt[1]).trim() : "" });
  }
  return out;
}

export function isInternalHref(href: string, domain: string) {
  if (href.startsWith("#")) return false;
  if (href.startsWith("/") && !href.startsWith("//")) return true;
  const host = domain.replace(/^https?:\/\//, "").replace(/\/$/, "");
  return new RegExp(`^https?://(www\\.)?${host.replace(/\./g, "\\.")}(/|$)`, "i").test(href);
}

function norm(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function countPhrase(haystack: string, phrase: string) {
  if (!phrase) return 0;
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const matches = haystack.match(new RegExp(`(^|[^\\p{L}\\p{N}])${escaped}(?=$|[^\\p{L}\\p{N}])`, "gu"));
  return matches ? matches.length : 0;
}

export type SeoInput = {
  title: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  excerpt: string;
  focusKeyword: string;
  keywords: string[];
  html: string;
  domain: string;
  hasCover?: boolean;
};

export type SeoCheck = {
  id: string;
  label: string;
  state: "pass" | "warn" | "fail";
  detail?: string;
  points: number;
  max: number;
};

export type SeoReport = {
  score: number;
  checks: SeoCheck[];
  words: number;
  minutes: number;
};

export function analyzeSeo(input: SeoInput): SeoReport {
  const html = toHtml(input.html || "");
  const text = htmlToText(html);
  const words = countWords(text);
  const lowerText = norm(text);
  const kw = norm(input.focusKeyword || "");
  const effectiveTitle = (input.metaTitle || input.title).trim();
  const effectiveDescription = (input.metaDescription || input.excerpt).trim();
  const headings = extractHeadings(html);
  const paras = paragraphs(html);
  const hrefs = links(html);
  const imgs = images(html);
  const checks: SeoCheck[] = [];

  const add = (id: string, label: string, max: number, state: SeoCheck["state"], detail?: string) => {
    const points = state === "pass" ? max : state === "warn" ? Math.round(max / 2) : 0;
    checks.push({ id, label, max, state, detail, points });
  };
  const yes = (ok: boolean) => (ok ? "pass" : "fail");

  if (!kw) {
    add("kw-title", "Focus keyword in title", 7, "fail", "Set a focus keyword");
    add("kw-slug", "Focus keyword in slug", 5, "fail", "Set a focus keyword");
    add("kw-desc", "Focus keyword in meta description", 6, "fail", "Set a focus keyword");
    add("kw-intro", "Focus keyword in first paragraph", 6, "fail", "Set a focus keyword");
    add("kw-density", "Keyword density 0.5% to 2.5%", 6, "fail", "Set a focus keyword");
  } else {
    add("kw-title", "Focus keyword in title", 7, yes(norm(effectiveTitle).includes(kw) || norm(input.title).includes(kw)));
    add("kw-slug", "Focus keyword in slug", 5, yes(input.slug.includes(headingId(kw))));
    add("kw-desc", "Focus keyword in meta description", 6, yes(norm(effectiveDescription).includes(kw)));
    add("kw-intro", "Focus keyword in first paragraph", 6, yes(paras.length > 0 && norm(paras[0]).includes(kw)));
    const density = words ? (countPhrase(lowerText, kw) / words) * 100 : 0;
    const dState = density >= 0.5 && density <= 2.5 ? "pass" : density > 0 ? "warn" : "fail";
    add("kw-density", "Keyword density 0.5% to 2.5%", 6, dState, `${density.toFixed(1)}%`);
  }

  add("h2", "At least one H2 heading", 6, yes(headings.some((h) => h.level === 2)));

  const extra = input.keywords.map(norm).filter(Boolean);
  if (extra.length === 0) {
    add("kw-extra", "Additional keywords used", 5, "fail", "Add related keywords");
  } else {
    const used = extra.filter((k) => lowerText.includes(k)).length;
    add(
      "kw-extra",
      "Additional keywords used",
      5,
      used === extra.length ? "pass" : used > 0 ? "warn" : "fail",
      `${used} of ${extra.length}`,
    );
  }

  add(
    "length",
    "Content length (900+ words ideal)",
    10,
    words >= 900 ? "pass" : words >= 300 ? "warn" : "fail",
    `${words} words`,
  );

  const internal = hrefs.filter((h) => isInternalHref(h, input.domain)).length;
  const external = hrefs.filter((h) => /^https?:\/\//i.test(h) && !isInternalHref(h, input.domain)).length;
  add("links-int", "At least 2 internal links", 7, internal >= 2 ? "pass" : internal === 1 ? "warn" : "fail", `${internal} found`);
  add("links-ext", "At least 1 external link", 5, yes(external >= 1), `${external} found`);

  const missingAlt = imgs.filter((i) => !i.alt).length;
  const pictured = imgs.length + (input.hasCover ? 1 : 0);
  add(
    "alt",
    "Image alt text",
    6,
    pictured === 0 ? "fail" : yes(missingAlt === 0),
    pictured === 0 ? "Add a cover or an image in the article" : missingAlt ? `${missingAlt} missing` : `${pictured} described`,
  );

  const questions = headings.filter((h) => (h.level === 2 || h.level === 3) && h.text.trim().endsWith("?"));
  add(
    "aeo-question",
    "A question people would ask",
    5,
    questions.length >= 1 ? "pass" : "fail",
    questions.length ? `${questions.length} found` : "Add an H2 that ends with a question mark",
  );
  const opener = paras[0] ? countWords(paras[0]) : 0;
  add(
    "aeo-answer",
    "A direct answer in the opening",
    5,
    opener >= 40 ? "pass" : opener >= 20 ? "warn" : "fail",
    opener ? `${opener} words in the first paragraph` : "Open with the answer, then explain it",
  );

  const tLen = effectiveTitle.length;
  add("meta-title", "Meta title 30 to 60 characters", 7, tLen >= 30 && tLen <= 60 ? "pass" : tLen ? "warn" : "fail", `${tLen} chars`);
  const dLen = effectiveDescription.length;
  add(
    "meta-desc",
    "Meta description 70 to 160 characters",
    7,
    dLen >= 70 && dLen <= 160 ? "pass" : dLen ? "warn" : "fail",
    `${dLen} chars`,
  );

  let ordered = true;
  let prev = 1;
  for (const h of headings) {
    if (h.level > prev + 1) ordered = false;
    prev = h.level;
  }
  add("order", "Headings in order", 4, yes(ordered));

  const sentences = text.split(/(?<=[.!?])\s+|\n+/).map((s) => s.trim()).filter((s) => countWords(s) > 0);
  const avg = sentences.length ? words / sentences.length : 0;
  add("sentences", "Average sentence under 22 words", 4, words === 0 ? "fail" : yes(avg < 22), avg ? `${avg.toFixed(1)} words` : undefined);

  const longParas = paras.filter((p) => countWords(p) > 150).length;
  add("paragraphs", "Paragraphs under 150 words", 4, words === 0 ? "fail" : yes(longParas === 0), longParas ? `${longParas} too long` : undefined);

  const score = Math.min(100, checks.reduce((sum, c) => sum + c.points, 0));
  return { score, checks, words, minutes: readingMinutes(words) };
}

/** Question headings and the copy under them, for FAQ markup that answer engines can cite. */
export function extractFaq(html: string) {
  const out: { question: string; answer: string }[] = [];
  const re = /<h([23])\b[^>]*>([\s\S]*?)<\/h\1>([\s\S]*?)(?=<h[1-6]\b|$)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const question = stripTags(m[2]).trim();
    if (!question.endsWith("?")) continue;
    const answer = stripTags(m[3]).replace(/\s+/g, " ").trim();
    if (answer) out.push({ question, answer: answer.slice(0, 600) });
  }
  return out;
}

export function seoTone(score: number | null | undefined) {
  if (score == null) return "neutral" as const;
  if (score >= 80) return "success" as const;
  if (score >= 50) return "warning" as const;
  return "danger" as const;
}

export type ArticleStatus = "draft" | "scheduled" | "live";

export function articleStatus(publishedAt: string | null | undefined, now = Date.now()): ArticleStatus {
  if (!publishedAt) return "draft";
  return new Date(publishedAt).getTime() > now ? "scheduled" : "live";
}
