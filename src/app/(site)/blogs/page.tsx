import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/site/PageHeader";
import { Container } from "@/components/ui/Container";
import { CTA } from "@/components/sections/CTA";
import { PostCard, PostMeta } from "@/components/blog/PostCard";
import { getBlogCategories, getFeaturedArticle, getLiveArticles, type ArticleCard } from "@/lib/blog";
import { publicMediaUrl } from "@/lib/constants";
import { cn } from "@/lib/utils";

const intro =
  "Practical writing on software, payments, design, and growing a business in Kenya and East Africa, from the team that builds it every day in Mombasa.";

type SP = { category?: string; q?: string; page?: string };

export async function generateMetadata({ searchParams }: { searchParams: Promise<SP> }): Promise<Metadata> {
  const sp = await searchParams;
  const filtered = Boolean(sp.q || (sp.page && sp.page !== "1"));
  return {
    title: sp.category ? `${sp.category} articles` : "Blog",
    description: intro,
    alternates: { canonical: sp.category ? `/blogs?category=${encodeURIComponent(sp.category)}` : "/blogs" },
    robots: filtered ? { index: false, follow: true } : undefined,
  };
}

function buildHref(params: { category?: string; q?: string; page?: number }) {
  const p = new URLSearchParams();
  if (params.category) p.set("category", params.category);
  if (params.q) p.set("q", params.q);
  if (params.page && params.page > 1) p.set("page", String(params.page));
  const s = p.toString();
  return `/blogs${s ? `?${s}` : ""}`;
}

export default async function BlogsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const category = sp.category?.trim() || undefined;
  const q = sp.q?.trim() || undefined;
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);
  const showFeatured = !category && !q && page === 1;

  const [featured, categories] = await Promise.all([showFeatured ? getFeaturedArticle() : null, getBlogCategories()]);
  const { posts, pages, total } = await getLiveArticles({ category, q, page, excludeId: featured?.id });

  return (
    <>
      <PageHeader breadcrumb={[{ label: "Home", href: "/" }, { label: "Blog" }]} title="Blog" intro={intro} />

      <section className="bg-white py-16 lg:py-24">
        <Container>
          {featured ? <FeaturedPost post={featured} /> : null}

          <div className={cn("flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between", featured && "mt-16")}>
            <nav aria-label="Categories" className="flex flex-wrap gap-2">
              <CategoryLink href={buildHref({ q })} active={!category}>All</CategoryLink>
              {categories.map((c) => (
                <CategoryLink key={c} href={buildHref({ category: c, q })} active={category === c}>
                  {c}
                </CategoryLink>
              ))}
            </nav>
            <form action="/blogs" role="search" className="relative w-full lg:max-w-xs">
              {category ? <input type="hidden" name="category" value={category} /> : null}
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
              <input
                name="q"
                defaultValue={q}
                placeholder="Search articles"
                aria-label="Search articles"
                className="w-full rounded-[5px] border border-line bg-white py-2.5 pl-9 pr-3 text-sm text-ink-900 outline-none focus:border-brand-500"
              />
            </form>
          </div>

          {q ? (
            <p className="mt-6 text-sm text-body">
              {total} {total === 1 ? "result" : "results"} for “{q}”.{" "}
              <Link href={buildHref({ category })} className="font-medium text-brand-600 hover:underline">
                Clear search
              </Link>
            </p>
          ) : null}

          {posts.length === 0 ? (
            <p className="mt-10 max-w-2xl text-lg leading-relaxed text-body">
              {q || category ? "No articles match yet. Try another search or category." : featured ? "More articles are on the way." : "Articles will appear here as they are published."}
            </p>
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}

          {pages > 1 ? (
            <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-1">
              {page > 1 ? <PageLink href={buildHref({ category, q, page: page - 1 })}>Previous</PageLink> : null}
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                <PageLink key={n} href={buildHref({ category, q, page: n })} active={n === page}>
                  {n}
                </PageLink>
              ))}
              {page < pages ? <PageLink href={buildHref({ category, q, page: page + 1 })}>Next</PageLink> : null}
            </nav>
          ) : null}
        </Container>
      </section>

      <CTA
        title="Ready to talk about a project?"
        intro="If a piece here matches work you have in mind, tell us the initiative. We scope it, price it, and stay with it through launch."
      />
    </>
  );
}

function CategoryLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "rounded-[5px] px-3.5 py-1.5 text-sm font-medium transition-colors",
        active ? "bg-brand-500 text-white" : "border border-line text-body hover:border-brand-300 hover:text-ink-900",
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

function FeaturedPost({ post }: { post: ArticleCard }) {
  const cover = publicMediaUrl(post.cover_path);
  return (
    <Link
      href={`/blogs/${post.slug}`}
      className="group grid overflow-hidden rounded-[5px] border border-line bg-white transition-colors hover:border-brand-300 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]"
    >
      <div className="relative aspect-[16/10] bg-surface-3 lg:aspect-auto lg:min-h-[22rem]">
        {cover ? <Image src={cover} alt="" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 60vw" priority /> : null}
      </div>
      <div className="flex flex-col justify-center p-6 sm:p-10">
        {post.category ? <p className="text-xs font-semibold text-brand-600">{post.category}</p> : null}
        <h2 className="mt-2 text-2xl font-bold leading-tight text-ink-900 group-hover:text-brand-600 sm:text-3xl">{post.title}</h2>
        {post.excerpt ? <p className="mt-3 text-lg leading-relaxed text-body">{post.excerpt}</p> : null}
        <div className="mt-6">
          <PostMeta post={post} />
        </div>
      </div>
    </Link>
  );
}
