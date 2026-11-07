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

  const row = {
    title,
    slug,
    excerpt: input.excerpt.trim(),
    body,
    category: blank(input.category),
    tags: input.tags,
    audience: input.audience === "founders" ? "founders" : "general",
    author_name: blank(input.author_name),
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
