"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { PUBLIC_TAG } from "@/lib/public-cache";
import { createClient } from "@/lib/supabase/server";
import { getStaff } from "@/lib/cms";
import { analyzeSeo, sanitizeArticleHtml } from "@/lib/blog";
import { slugify } from "@/lib/constants";
import { company } from "@/lib/content";
import { announceToSearchEngines } from "@/lib/search-submit";

export type ArticleInput = {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  category: string;
  tags: string[];
  audience: string;
  author_name: string;
  cover_path: string;
  og_image_path: string;
  gallery: string[];
  focus_keyword: string;
  keywords: string[];
  meta_title: string;
  meta_description: string;
  canonical_url: string;
  noindex: boolean;
  featured: boolean;
  published_at: string | null;
};

export type SaveResult =
  | { ok: true; id: string; slug: string; seoScore: number; search: { indexnow: number; bing: boolean } | null }
  | { ok: false; error: string };

const blank = (v: string) => (v.trim() ? v.trim() : null);

export async function saveArticle(id: string | null, input: ArticleInput): Promise<SaveResult> {
  const staff = await getStaff();
  if (!staff || staff.role === "sales") return { ok: false, error: "You do not have access to edit articles." };

  const title = input.title.trim();
  if (!title) return { ok: false, error: "Add a title." };
  const slug = slugify(input.slug || title);
  if (!slug) return { ok: false, error: "Add a slug." };
  if (input.canonical_url.trim() && !/^https?:\/\//i.test(input.canonical_url.trim())) {
    return { ok: false, error: "Canonical URL must start with https://" };
  }

  const body = sanitizeArticleHtml(input.body);
  const report = analyzeSeo({
    title,
    slug,
    metaTitle: input.meta_title,
    metaDescription: input.meta_description,
    excerpt: input.excerpt,
    focusKeyword: input.focus_keyword,
    keywords: input.keywords,
    html: body,
    domain: company.domain,
    hasCover: Boolean(input.cover_path.trim()),
  });

  const typedName = blank(input.author_name);
  const ownName = staff.full_name.trim();
  const usesProfile = !typedName || typedName === ownName;
  const row = {
    title,
    slug,
    excerpt: input.excerpt.trim(),
    body,
    category: blank(input.category),
    tags: input.tags,
    audience: input.audience === "founders" ? "founders" : "general",
    author_name: usesProfile ? ownName || null : typedName,
    author_id: usesProfile ? staff.id : null,
    author_photo_path: usesProfile ? staff.avatar_path : null,
    cover_path: blank(input.cover_path),
    og_image_path: blank(input.og_image_path),
    gallery: input.gallery,
    focus_keyword: blank(input.focus_keyword),
    keywords: input.keywords,
    meta_title: blank(input.meta_title),
    meta_description: blank(input.meta_description),
    canonical_url: blank(input.canonical_url),
    noindex: input.noindex,
    featured: input.featured,
    published_at: input.published_at,
    seo_score: report.score,
    reading_minutes: report.minutes,
  };

  const supabase = await createClient();
  if (id) {
    const existing = await supabase.from("articles").select("deleted_at").eq("id", id).maybeSingle();
    if (existing.error) return { ok: false, error: existing.error.message };
    if (existing.data?.deleted_at) return { ok: false, error: "This article is in the trash. Restore it before saving." };
  }
  const res = id
    ? await supabase.from("articles").update(row).eq("id", id).select("id, slug").single()
    : await supabase.from("articles").insert({ ...row, created_by: staff.id }).select("id, slug").single();

  if (res.error) {
    if (res.error.code === "23505") return { ok: false, error: "Another article already uses this slug." };
    return { ok: false, error: res.error.message };
  }

  revalidateTag(PUBLIC_TAG, { expire: 0 });
  revalidatePath("/blogs");
  revalidatePath(`/blogs/${res.data.slug}`);
  revalidatePath("/sitemap.xml");
  revalidatePath("/feed.xml");
  revalidatePath("/console/insights");

  const published = input.published_at ? new Date(input.published_at).getTime() : NaN;
  const live = !input.noindex && Number.isFinite(published) && published <= Date.now();
  const search = live ? await announceToSearchEngines([`${company.domain}/blogs/${res.data.slug}`]) : null;
  return { ok: true, id: res.data.id, slug: res.data.slug, seoScore: report.score, search };
}

export type ListResult = { ok: true; note?: string } | { ok: false; error: string };

export type QuickEditInput = {
  id: string;
  title: string;
  slug: string;
  category: string;
  tags: string[];
  featured: boolean;
  status: "draft" | "scheduled" | "live";
  published_at: string | null;
};

function liveAt(publishedAt: string | null) {
  return Boolean(publishedAt) && new Date(publishedAt as string).getTime() <= Date.now();
}

function publicSlug(slug: string) {
  return slug.replace(/__trashed(?:-\d+)?$/, "");
}

function claimSlug(base: string, taken: Set<string>, suffix = "") {
  const root = (slugify(base) || "article").slice(0, 60);
  const plain = `${root}${suffix}`;
  if (!taken.has(plain)) return plain;
  let n = 2;
  while (taken.has(`${root}${suffix}-${n}`)) n += 1;
  return `${root}${suffix}-${n}`;
}

async function requireEditor() {
  const staff = await getStaff();
  if (!staff || staff.role === "sales") return { ok: false as const, error: "You do not have access to edit articles." };
  return { ok: true as const, staff };
}

function refreshArticles(slugs: string[]) {
  revalidateTag(PUBLIC_TAG, { expire: 0 });
  revalidatePath("/blogs");
  revalidatePath("/sitemap.xml");
  revalidatePath("/feed.xml");
  revalidatePath("/console/insights");
  for (const slug of new Set(slugs.filter(Boolean))) revalidatePath(`/blogs/${slug}`);
}

async function loadSlugSet(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data, error } = await supabase.from("articles").select("id, slug");
  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const, rows: data ?? [] };
}

export async function trashArticles(ids: string[]): Promise<ListResult> {
  const gate = await requireEditor();
  if (!gate.ok) return gate;
  const unique = [...new Set(ids)].filter(Boolean);
  if (!unique.length) return { ok: false, error: "Select at least one article." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select("id, slug, published_at, noindex, deleted_at")
    .in("id", unique);
  if (error) return { ok: false, error: error.message };

  const slugs = await loadSlugSet(supabase);
  if (!slugs.ok) return slugs;
  const taken = new Set(slugs.rows.map((row) => row.slug));
  const targets = (data ?? []).filter((row) => !row.deleted_at);
  const announce: string[] = [];
  const paths: string[] = [];

  for (const row of targets) {
    taken.delete(row.slug);
    const next = claimSlug(publicSlug(row.slug), taken, "__trashed");
    taken.add(next);
    const { error: updateError } = await supabase.from("articles").update({ deleted_at: new Date().toISOString(), slug: next }).eq("id", row.id);
    if (updateError) return { ok: false, error: updateError.message };
    paths.push(row.slug, next);
    if (liveAt(row.published_at) && !row.noindex) announce.push(`${company.domain}/blogs/${row.slug}`);
  }

  refreshArticles(paths);
  if (announce.length) await announceToSearchEngines(announce);
  const count = targets.length;
  return { ok: true, note: count === 1 ? "1 article moved to the trash." : `${count} articles moved to the trash.` };
}

export async function restoreArticles(ids: string[]): Promise<ListResult> {
  const gate = await requireEditor();
  if (!gate.ok) return gate;
  const unique = [...new Set(ids)].filter(Boolean);
  if (!unique.length) return { ok: false, error: "Select at least one article." };

  const supabase = await createClient();
  const { data, error } = await supabase.from("articles").select("id, slug, published_at, noindex, deleted_at").in("id", unique);
  if (error) return { ok: false, error: error.message };

  const slugs = await loadSlugSet(supabase);
  if (!slugs.ok) return slugs;
  const taken = new Set(slugs.rows.map((row) => row.slug));
  const targets = (data ?? []).filter((row) => row.deleted_at);
  const announce: string[] = [];
  const paths: string[] = [];
  let adjusted = false;

  for (const row of targets) {
    taken.delete(row.slug);
    const wanted = publicSlug(row.slug);
    const next = claimSlug(wanted, taken);
    if (next !== wanted) adjusted = true;
    taken.add(next);
    const { error: updateError } = await supabase.from("articles").update({ deleted_at: null, slug: next }).eq("id", row.id);
    if (updateError) return { ok: false, error: updateError.message };
    paths.push(row.slug, next);
    if (liveAt(row.published_at) && !row.noindex) announce.push(`${company.domain}/blogs/${next}`);
  }

  refreshArticles(paths);
  if (announce.length) await announceToSearchEngines(announce);
  const count = targets.length;
  const note = count === 1 ? "1 article restored." : `${count} articles restored.`;
  return { ok: true, note: adjusted ? `${note} A slug was already in use, so the restored one was adjusted.` : note };
}

export async function deleteArticles(ids: string[]): Promise<ListResult> {
  const gate = await requireEditor();
  if (!gate.ok) return gate;
  const unique = [...new Set(ids)].filter(Boolean);
  if (!unique.length) return { ok: false, error: "Select at least one article." };

  const supabase = await createClient();
  const { data, error } = await supabase.from("articles").select("id, slug, deleted_at").in("id", unique);
  if (error) return { ok: false, error: error.message };
  const targets = (data ?? []).filter((row) => row.deleted_at);
  if (!targets.length) return { ok: false, error: "Only articles already in the trash can be deleted." };

  const { error: deleteError } = await supabase.from("articles").delete().in("id", targets.map((row) => row.id));
  if (deleteError) return { ok: false, error: deleteError.message };
  refreshArticles(targets.flatMap((row) => [row.slug, publicSlug(row.slug)]));
  const count = targets.length;
  return { ok: true, note: count === 1 ? "1 article deleted." : `${count} articles deleted.` };
}

export async function emptyTrash(): Promise<ListResult> {
  const gate = await requireEditor();
  if (!gate.ok) return gate;
  const supabase = await createClient();
  const { data, error } = await supabase.from("articles").select("id, slug").not("deleted_at", "is", null);
  if (error) return { ok: false, error: error.message };
  const rows = data ?? [];
  if (!rows.length) return { ok: true, note: "Trash is already empty." };
  const { error: deleteError } = await supabase.from("articles").delete().in("id", rows.map((row) => row.id));
  if (deleteError) return { ok: false, error: deleteError.message };
  refreshArticles(rows.flatMap((row) => [row.slug, publicSlug(row.slug)]));
  return { ok: true, note: rows.length === 1 ? "Trash emptied. 1 article deleted." : `Trash emptied. ${rows.length} articles deleted.` };
}

export async function setArticlesStatus(ids: string[], status: "live" | "draft"): Promise<ListResult> {
  const gate = await requireEditor();
  if (!gate.ok) return gate;
  const unique = [...new Set(ids)].filter(Boolean);
  if (!unique.length) return { ok: false, error: "Select at least one article." };

  const supabase = await createClient();
  const { data, error } = await supabase.from("articles").select("id, slug, published_at, noindex, deleted_at").in("id", unique);
  if (error) return { ok: false, error: error.message };
  const targets = (data ?? []).filter((row) => !row.deleted_at);
  if (!targets.length) return { ok: false, error: "Restore an article before changing its status." };

  const now = new Date().toISOString();
  const announce: string[] = [];
  for (const row of targets) {
    const wasLive = liveAt(row.published_at);
    const published_at = status === "draft" ? null : wasLive ? row.published_at : now;
    const { error: updateError } = await supabase.from("articles").update({ published_at }).eq("id", row.id);
    if (updateError) return { ok: false, error: updateError.message };
    const nowLive = status === "live";
    if (nowLive !== wasLive && !row.noindex) announce.push(`${company.domain}/blogs/${row.slug}`);
  }

  refreshArticles(targets.map((row) => row.slug));
  if (announce.length) await announceToSearchEngines(announce);
  const count = targets.length;
  const note =
    status === "live"
      ? count === 1
        ? "1 article published."
        : `${count} articles published.`
      : count === 1
        ? "1 article moved to draft."
        : `${count} articles moved to drafts.`;
  return { ok: true, note };
}

export async function quickEditArticle(input: QuickEditInput): Promise<ListResult> {
  const gate = await requireEditor();
  if (!gate.ok) return gate;

  const title = input.title.trim();
  if (!title) return { ok: false, error: "Add a title." };
  const slug = slugify(input.slug || title);
  if (!slug) return { ok: false, error: "Add a slug." };

  const supabase = await createClient();
  const { data: current, error } = await supabase
    .from("articles")
    .select("id, slug, body, excerpt, meta_title, meta_description, focus_keyword, keywords, cover_path, noindex, published_at, deleted_at")
    .eq("id", input.id)
    .maybeSingle();
  if (error) return { ok: false, error: error.message };
  if (!current) return { ok: false, error: "That article is no longer here." };
  if (current.deleted_at) return { ok: false, error: "Restore this article before editing it." };

  const clash = await supabase.from("articles").select("id").eq("slug", slug).neq("id", input.id).limit(1);
  if (clash.error) return { ok: false, error: clash.error.message };
  if (clash.data?.length) return { ok: false, error: "Another article already uses this slug." };

  let published_at: string | null = null;
  if (input.status === "scheduled") {
    if (!input.published_at) return { ok: false, error: "Choose the date this article should go live." };
    if (new Date(input.published_at).getTime() <= Date.now()) return { ok: false, error: "A scheduled article needs a future date." };
    published_at = input.published_at;
  } else if (input.status === "live") {
    if (input.published_at && new Date(input.published_at).getTime() > Date.now()) {
      return { ok: false, error: "A live article needs a date that has already passed, or set it to scheduled." };
    }
    published_at = input.published_at || (liveAt(current.published_at) ? current.published_at : new Date().toISOString());
  }

  const tags = [...new Set(input.tags.map((tag) => tag.trim()).filter(Boolean))].slice(0, 20);
  const report = analyzeSeo({
    title,
    slug,
    metaTitle: current.meta_title ?? "",
    metaDescription: current.meta_description ?? "",
    excerpt: current.excerpt,
    focusKeyword: current.focus_keyword ?? "",
    keywords: current.keywords,
    html: current.body,
    domain: company.domain,
    hasCover: Boolean(current.cover_path),
  });

  const { error: updateError } = await supabase
    .from("articles")
    .update({
      title,
      slug,
      category: input.category.trim() || null,
      tags,
      featured: input.featured,
      published_at,
      seo_score: report.score,
      reading_minutes: report.minutes,
    })
    .eq("id", input.id);
  if (updateError) {
    if (updateError.code === "23505") return { ok: false, error: "Another article already uses this slug." };
    return { ok: false, error: updateError.message };
  }

  refreshArticles([current.slug, slug]);
  const wasLive = liveAt(current.published_at) && !current.noindex;
  const nowLive = liveAt(published_at) && !current.noindex;
  if (wasLive || nowLive) {
    const urls = [nowLive ? `${company.domain}/blogs/${slug}` : "", wasLive && current.slug !== slug ? `${company.domain}/blogs/${current.slug}` : ""].filter(Boolean);
    if (urls.length) await announceToSearchEngines(urls);
  }
  return { ok: true, note: "Article updated." };
}
