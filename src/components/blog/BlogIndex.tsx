"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LayoutGrid, List, Search } from "lucide-react";
import { PostCard, PostMeta } from "@/components/blog/PostCard";
import { PageHeader } from "@/components/site/PageHeader";
import { Container } from "@/components/ui/Container";
import type { ArticleCard } from "@/lib/blog";
import { publicMediaUrl } from "@/lib/constants";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 9;

function buildHref(params: { category?: string; q?: string; page?: number; view?: string }) {
  const p = new URLSearchParams();
  if (params.category) p.set("category", params.category);
  if (params.q) p.set("q", params.q);
  if (params.view === "list") p.set("view", "list");
  if (params.page && params.page > 1) p.set("page", String(params.page));
  const s = p.toString();
  return `/blogs${s ? `?${s}` : ""}`;
}

export function BlogIndex({
  categories,
  posts,
  category,
  q,
  page,
  view,
}: {
  categories: string[];
  posts: ArticleCard[];
  category?: string;
  q?: string;
  page: number;
  view: "grid" | "list";
}) {
  const router = useRouter();
  const term = q?.toLowerCase();
  const matched = posts.filter((post) => {
    if (category && post.category !== category) return false;
    if (term && !`${post.title} ${post.excerpt}`.toLowerCase().includes(term)) return false;
    return true;
  });
  const pages = Math.max(1, Math.ceil(matched.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const visible = matched.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const options = category && !categories.includes(category) ? [category, ...categories] : categories;

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Blog" }]}
        title={category ? `${category} articles` : "Blog"}
        intro="Practical writing on software, payments, design, and growing a business in Kenya and East Africa, from the team that builds it every day in Mombasa."
      />
      <section className="bg-white py-12 lg:py-16">
        <Container>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
            <Link
              href={buildHref({ q, view })}
              aria-current={!category ? "page" : undefined}
              className={cn(
                "inline-flex h-10 items-center rounded-[5px] px-4 text-sm font-medium transition-colors",
                !category ? "bg-brand-500 text-white" : "border border-line text-body hover:border-brand-300 hover:text-ink-900",
              )}
            >
              All
            </Link>
            <label className="sr-only" htmlFor="blog-category">
              Category
            </label>
            <select
              id="blog-category"
              value={category ?? ""}
              onChange={(event) => {
                const next = event.target.value;
                router.push(buildHref({ category: next || undefined, q, view }));
              }}
              className="h-10 max-w-full rounded-[5px] border border-line bg-white px-3 text-sm font-medium text-ink-900 outline-none focus:border-brand-500"
            >
              <option value="">Categories</option>
              {options.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <form action="/blogs" role="search" className="relative w-full sm:w-64">
              {category ? <input type="hidden" name="category" value={category} /> : null}
              {view === "list" ? <input type="hidden" name="view" value="list" /> : null}
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
              <input
                name="q"
                defaultValue={q}
                placeholder="Search articles"
                aria-label="Search articles"
                className="h-10 w-full rounded-[5px] border border-line bg-white py-2 pl-9 pr-3 text-sm text-ink-900 outline-none focus:border-brand-500"
              />
            </form>
            <div className="inline-flex h-10 overflow-hidden rounded-[5px] border border-line" role="group" aria-label="Article layout">
              <ViewLink href={buildHref({ category, q })} active={view === "grid"} label="Grid view">
                <LayoutGrid className="h-4 w-4" aria-hidden />
              </ViewLink>
              <ViewLink href={buildHref({ category, q, view: "list" })} active={view === "list"} label="List view">
                <List className="h-4 w-4" aria-hidden />
              </ViewLink>
            </div>
          </div>

          {q ? (
            <p className="mt-6 text-center text-sm text-body">
              {matched.length} {matched.length === 1 ? "result" : "results"} for "{q}".{" "}
              <Link href={buildHref({ category, view })} className="font-medium text-brand-600 hover:underline">
                Clear search
              </Link>
            </p>
          ) : null}

          {visible.length === 0 ? (
            <p className="mt-10 text-center text-lg leading-relaxed text-body">
              {q || category ? "No articles match yet. Try another search or category." : "Articles will appear here as they are published."}
            </p>
          ) : view === "list" ? (
            <ul className="mt-10 divide-y divide-line border-y border-line">
              {visible.map((post) => (
                <li key={post.id}>
                  <PostRow post={post} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}

          {pages > 1 ? (
            <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-1">
              {current > 1 ? <PageLink href={buildHref({ category, q, view, page: current - 1 })}>Previous</PageLink> : null}
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                <PageLink key={n} href={buildHref({ category, q, view, page: n })} active={n === current}>
                  {n}
                </PageLink>
              ))}
              {current < pages ? <PageLink href={buildHref({ category, q, view, page: current + 1 })}>Next</PageLink> : null}
            </nav>
          ) : null}
        </Container>
      </section>
    </>
  );
}

export function BlogIndexFromUrl(props: { categories: string[]; posts: ArticleCard[] }) {
  const sp = useSearchParams();
  const page = Math.max(1, Number.parseInt(sp.get("page") ?? "1", 10) || 1);
  const view = sp.get("view") === "list" ? "list" : "grid";
  return (
    <BlogIndex
      {...props}
      category={sp.get("category")?.trim() || undefined}
      q={sp.get("q")?.trim() || undefined}
      page={page}
      view={view}
    />
  );
}

function ViewLink({ href, active, label, children }: { href: string; active: boolean; label: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex w-10 items-center justify-center border-l border-line first:border-l-0",
        active ? "bg-brand-500 text-white" : "bg-white text-body hover:text-ink-900",
      )}
    >
      {children}
    </Link>
  );
}

function PageLink({ href, active, children }: { href: string; active?: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex h-9 min-w-9 items-center justify-center rounded-[5px] px-3 text-sm font-medium",
        active ? "bg-brand-500 text-white" : "border border-line text-body hover:border-brand-300",
      )}
    >
      {children}
    </Link>
  );
}

function PostRow({ post }: { post: ArticleCard }) {
  const cover = publicMediaUrl(post.cover_path);
  return (
    <Link href={`/blogs/${post.slug}`} className="group grid gap-4 py-6 sm:grid-cols-[11rem_minmax(0,1fr)] sm:items-center">
      <div className="relative aspect-[16/10] overflow-hidden rounded-[5px] bg-surface-3 sm:aspect-[3/2]">
        {cover ? <Image src={cover} alt="" fill unoptimized className="object-cover" sizes="180px" /> : null}
      </div>
      <div className="min-w-0">
        {post.category ? <p className="text-xs font-semibold text-brand-600">{post.category}</p> : null}
        <h2 className="mt-1 font-display text-xl font-semibold leading-snug text-ink-900 group-hover:text-brand-600">{post.title}</h2>
        {post.excerpt ? <p className="mt-2 line-clamp-2 text-[15px] leading-relaxed text-body">{post.excerpt}</p> : null}
        <div className="mt-3">
          <PostMeta post={post} />
        </div>
      </div>
    </Link>
  );
}
