import { NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/server";
import { company } from "@/lib/content";
import { submitToIndexNow } from "@/lib/indexnow";

/**
 * Daily Vercel cron (vercel.json). Supabase pauses free projects after a week
 * without activity; one tiny query a day keeps the database awake.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = createPublicClient();
  const { error } = await db.from("site_settings").select("id").eq("id", 1).maybeSingle();
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 502 });

  const since = new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString();
  const now = new Date().toISOString();
  const [articles, work, products, events] = await Promise.all([
    db.from("articles").select("slug").is("deleted_at", null).gte("published_at", since).lte("published_at", now).eq("noindex", false),
    db.from("case_studies").select("slug").is("deleted_at", null).gte("published_at", since).lte("published_at", now),
    db.from("products").select("slug").eq("published", true).is("deleted_at", null).gte("updated_at", since),
    db.from("events").select("slug").is("deleted_at", null).gte("published_at", since).lte("published_at", now),
  ]);
  const urls = [
    `${company.domain}/sitemap.xml`,
    `${company.domain}/blogs`,
    `${company.domain}/feed.xml`,
    ...(articles.data ?? []).map((row) => `${company.domain}/blogs/${row.slug}`),
    ...(work.data ?? []).map((row) => `${company.domain}/work/${row.slug}`),
    ...(products.data ?? []).map((row) => `${company.domain}/products/${row.slug}`),
    ...(events.data ?? []).map((row) => `${company.domain}/events/${row.slug}`),
  ];
  const indexnow = await submitToIndexNow(urls);
  return NextResponse.json({ ok: true, at: now, indexnow });
}
