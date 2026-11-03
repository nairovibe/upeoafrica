import sanitizeHtml from "sanitize-html";
import { createClient, createPublicClient } from "@/lib/supabase/server";
import { publicRead } from "@/lib/public-cache";
import { getStaff } from "@/lib/cms";
import { headingId, stripTags, toHtml } from "@/components/blog/analysis";

export * from "@/components/blog/analysis";

export const BLOG_PAGE_SIZE = 9;

const IFRAME_HOSTS = [
  "www.youtube.com",
  "youtube.com",
  "www.youtube-nocookie.com",
  "youtube-nocookie.com",
  "player.vimeo.com",
];

const SANITIZE: sanitizeHtml.IOptions = {
  allowedTags: [
    "h2", "h3", "h4", "h5", "h6", "p", "br", "ul", "ol", "li", "a", "img", "figure", "figcaption",
    "blockquote", "pre", "code", "hr", "strong", "b", "em", "i", "u", "s", "del", "div", "iframe",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel", "title"],
    img: ["src", "alt", "loading", "width", "height", "title"],
    figure: ["data-gallery", "data-figure", "data-count"],
    div: ["data-youtube-video", "data-vimeo-video"],
    iframe: ["src", "width", "height", "allow", "allowfullscreen", "frameborder", "title", "loading"],
    h2: ["id"],
    h3: ["id"],
    h4: ["id"],
    code: ["class"],
  },
  allowedClasses: { code: ["language-*"] },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesByTag: { img: ["http", "https"], iframe: ["https"] },
  allowedIframeHostnames: IFRAME_HOSTS,
  allowIframeRelativeUrls: false,
  transformTags: {
    h1: "h2",
    a: (tagName, attribs) => {
      const rel = new Set((attribs.rel || "").split(/\s+/).filter(Boolean));
      if (attribs.target === "_blank") {
        rel.add("noopener");
        rel.add("noreferrer");
      } else {
        delete attribs.target;
      }
      const next = { ...attribs };
      if (rel.size) next.rel = [...rel].join(" ");
      else delete next.rel;
      return { tagName, attribs: next };
    },
    img: (tagName, attribs) => ({ tagName, attribs: { ...attribs, loading: "lazy" } }),
  },
  exclusiveFilter: (frame) => frame.tag === "iframe" && !frame.attribs.src,
};

export function sanitizeArticleHtml(html: string) {
  return sanitizeHtml(html, SANITIZE);
}

export type TocItem = { id: string; text: string; level: 2 | 3 };

/** Sanitised HTML with ids on H2 to H4, plus the H2/H3 outline for the table of contents. */
export function renderArticleBody(body: string) {
  const clean = sanitizeArticleHtml(toHtml(body || ""));
  const toc: TocItem[] = [];
  const used = new Map<string, number>();
  const html = clean.replace(/<h([234])(?:\s[^>]*)?>([\s\S]*?)<\/h\1>/gi, (_, level: string, inner: string) => {
    const text = stripTags(inner);
    const base = headingId(text);
    const n = used.get(base) ?? 0;
    used.set(base, n + 1);
    const id = n ? `${base}-${n + 1}` : base;
    if (level === "2" || level === "3") toc.push({ id, text, level: Number(level) as 2 | 3 });
    return `<h${level} id="${id}">${inner}</h${level}>`;
  });
  return { html, toc };
}

const CARD_COLUMNS =
  "id, title, slug, excerpt, cover_path, category, tags, published_at, updated_at, reading_minutes, featured, author_name";

export type ArticleCard = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  cover_path: string | null;
  category: string | null;
  tags: string[];
  published_at: string | null;
  updated_at: string;
  reading_minutes: number | null;
  featured: boolean;
  author_name: string | null;
};

function cleanQuery(q: string) {
  return q.replace(/[,()%*\\]/g, " ").replace(/\s+/g, " ").trim().slice(0, 80);
}

async function _getLiveArticles(opts: { category?: string; q?: string; page?: number; excludeId?: string } = {}) {
  const supabase = createPublicClient();
  const page = Math.max(1, opts.page ?? 1);
  const from = (page - 1) * BLOG_PAGE_SIZE;
  let q = supabase
    .from("articles")
    .select(CARD_COLUMNS, { count: "exact" })
    .not("published_at", "is", null)
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false })
    .range(from, from + BLOG_PAGE_SIZE - 1);
  if (opts.category) q = q.eq("category", opts.category);
  if (opts.excludeId) q = q.neq("id", opts.excludeId);
  const term = opts.q ? cleanQuery(opts.q) : "";
  if (term) q = q.or(`title.ilike.%${term}%,excerpt.ilike.%${term}%`);
  const { data, count } = await q;
  return { posts: (data ?? []) as ArticleCard[], total: count ?? 0, page, pages: Math.max(1, Math.ceil((count ?? 0) / BLOG_PAGE_SIZE)) };
}

async function _getFeaturedArticle() {
  const supabase = createPublicClient();
  const now = new Date().toISOString();
  const { data } = await supabase
    .from("articles")
    .select(CARD_COLUMNS)
    .not("published_at", "is", null)
    .lte("published_at", now)
    .order("featured", { ascending: false })
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as ArticleCard | null) ?? null;
}

async function _getBlogCategories() {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("articles")
    .select("category")
    .not("published_at", "is", null)
    .lte("published_at", new Date().toISOString())
    .not("category", "is", null);
  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    const c = row.category?.trim();
    if (c) counts.set(c, (counts.get(c) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([name]) => name);
}

async function _getLiveArticleBySlug(slug: string) {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .not("published_at", "is", null)
    .lte("published_at", new Date().toISOString())
    .maybeSingle();
  return data;
}

/** Drafts and scheduled posts, only for signed-in staff. */
export async function getPreviewArticleBySlug(slug: string) {
  const staff = await getStaff();
  if (!staff) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("articles").select("*").eq("slug", slug).maybeSingle();
  return data;
}

async function _getRelatedArticles(article: { id: string; category: string | null; tags: string[] }, limit = 3) {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("articles")
    .select(CARD_COLUMNS)
    .not("published_at", "is", null)
    .lte("published_at", new Date().toISOString())
    .neq("id", article.id)
    .order("published_at", { ascending: false })
    .limit(40);
  const tags = new Set(article.tags.map((t) => t.toLowerCase()));
  return ((data ?? []) as ArticleCard[])
    .map((post, i) => ({
      post,
      rank:
        (article.category && post.category === article.category ? 3 : 0) +
        post.tags.filter((t) => tags.has(t.toLowerCase())).length * 2 -
        i / 100,
    }))
    .sort((a, b) => b.rank - a.rank)
    .slice(0, limit)
    .map((r) => r.post);
}

async function _getSitemapArticles() {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("articles")
    .select("slug, title, updated_at, published_at")
    .not("published_at", "is", null)
    .lte("published_at", new Date().toISOString())
    .eq("noindex", false)
    .order("published_at", { ascending: false });
  return data ?? [];
}

export function formatBlogDate(iso: string | null | undefined) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export const getLiveArticles = publicRead("blog:getLiveArticles", _getLiveArticles);
export const getFeaturedArticle = publicRead("blog:getFeaturedArticle", _getFeaturedArticle);
export const getBlogCategories = publicRead("blog:getBlogCategories", _getBlogCategories);
export const getLiveArticleBySlug = publicRead("blog:getLiveArticleBySlug", _getLiveArticleBySlug);
export const getRelatedArticles = publicRead("blog:getRelatedArticles", _getRelatedArticles);
export const getSitemapArticles = publicRead("blog:getSitemapArticles", _getSitemapArticles);