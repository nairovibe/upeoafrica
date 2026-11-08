import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { PostCard } from "@/components/blog/PostCard";
import { ShareLinks } from "@/components/blog/ShareLinks";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { countWords, extractFaq, formatBlogDate, getRelatedArticles, htmlToText, readingMinutes, renderArticleBody } from "@/lib/blog";
import { publicMediaUrl } from "@/lib/constants";
import { company } from "@/lib/content";
import type { Tables } from "@/lib/database.types";

function splitAfterParagraphs(html: string, count: number) {
  const re = /<p\b[^>]*>[\s\S]*?<\/p>/gi;
  let seen = 0;
  let end = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html))) {
    seen += 1;
    end = match.index + match[0].length;
    if (seen >= count) break;
  }
  if (!seen) return { opening: "", rest: html };
  return { opening: html.slice(0, end), rest: html.slice(end) };
}

export async function ArticleView({ article: a, preview = false }: { article: Tables<"articles">; preview?: boolean }) {
  const { html, toc } = renderArticleBody(a.body);
  const words = countWords(htmlToText(html));
  const minutes = a.reading_minutes || readingMinutes(words);
  const pageUrl = `${company.domain}/blogs/${a.slug}`;
  const cover = publicMediaUrl(a.cover_path);
  const image = publicMediaUrl(a.og_image_path) || cover;
  const author = a.author_name || company.name;
  const authorPhoto = publicMediaUrl(a.author_photo_path);
  const updated = a.published_at && new Date(a.updated_at).getTime() - new Date(a.published_at).getTime() > 86_400_000;
  const related = preview ? [] : await getRelatedArticles(a);
  const faq = extractFaq(html);
  const showToc = toc.length > 1;
  const { opening, rest } = splitAfterParagraphs(html, 2);
  const initials = author
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        headline: a.title,
        description: a.meta_description || a.excerpt,
        image: image ? [{ "@type": "ImageObject", url: image, caption: a.title }] : undefined,
        author: {
          "@type": a.author_name ? "Person" : "Organization",
          name: author,
          image: authorPhoto || undefined,
          url: `${company.domain}/about`,
        },
        publisher: {
          "@type": "Organization",
          name: company.name,
          url: company.domain,
          logo: { "@type": "ImageObject", url: `${company.domain}/icon.png`, width: 512, height: 512 },
        },
        datePublished: a.published_at,
        dateModified: a.updated_at,
        keywords: [a.focus_keyword, ...a.keywords, ...a.tags].filter(Boolean).join(", ") || undefined,
        articleSection: a.category ?? undefined,
        wordCount: words,
        inLanguage: "en-KE",
        mainEntityOfPage: { "@type": "WebPage", "@id": a.canonical_url || pageUrl },
        url: pageUrl,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: company.domain },
          { "@type": "ListItem", position: 2, name: "Blog", item: `${company.domain}/blogs` },
          { "@type": "ListItem", position: 3, name: a.title, item: pageUrl },
        ],
      },
      ...(faq.length
        ? [
            {
              "@type": "FAQPage",
              mainEntity: faq.map((item) => ({
                "@type": "Question",
                name: item.question,
                acceptedAnswer: { "@type": "Answer", text: item.answer },
              })),
            },
          ]
        : []),
    ],
  };

  return (
    <>
      {preview ? null : (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      )}

      <article className="bg-white pb-16 pt-32 md:pt-36">
        {preview ? (
          <p className="mb-8 bg-brand-50 py-2.5 text-center text-sm font-medium text-brand-700">Preview. This article is not live yet.</p>
        ) : null}

        <header className="mx-auto max-w-3xl px-5 sm:px-8">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
              <li>
                <Link href="/" className="hover:text-ink-900">Home</Link>
              </li>
              <li aria-hidden>/</li>
              <li>
                <Link href="/blogs" className="hover:text-ink-900">Blog</Link>
              </li>
              {a.category ? (
                <>
                  <li aria-hidden>/</li>
                  <li>
                    <Link href={`/blogs?category=${encodeURIComponent(a.category)}`} className="text-ink-900 hover:text-brand-600">
                      {a.category}
                    </Link>
                  </li>
                </>
              ) : null}
            </ol>
          </nav>

          {a.category ? (
            <Link
              href={`/blogs?category=${encodeURIComponent(a.category)}`}
              className="mt-6 inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-brand-700 hover:bg-brand-100"
            >
              {a.category}
            </Link>
          ) : null}

          <h1 className="mt-4 font-display text-3xl font-bold leading-[1.08] text-ink-900 sm:text-4xl md:text-[2.75rem]">{a.title}</h1>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              {authorPhoto ? (
                <Image src={authorPhoto} alt="" width={44} height={44} unoptimized className="h-11 w-11 shrink-0 rounded-full object-cover" />
              ) : (
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-500 text-sm font-semibold text-white" aria-hidden>
                  {initials || "U"}
                </span>
              )}
              <div>
                <p className="text-sm font-semibold text-ink-900">{author}</p>
                <p className="text-xs text-muted">
                  {a.published_at ? <time dateTime={a.published_at}>{formatBlogDate(a.published_at)}</time> : null}
                  {updated ? (
                    <>
                      {a.published_at ? " · " : null}
                      Updated <time dateTime={a.updated_at}>{formatBlogDate(a.updated_at)}</time>
                    </>
                  ) : null}
                  {" · "}
                  {minutes} min read
                </p>
              </div>
            </div>
            <ShareLinks url={pageUrl} title={a.title} />
          </div>
        </header>

        {cover ? (
          <div className="mx-auto mt-8 max-w-5xl px-5 sm:px-8">
            <div className="relative h-64 overflow-hidden rounded-[5px] bg-surface-3 sm:h-80 md:h-[28rem]">
              <Image src={cover} alt={a.title} fill priority unoptimized className="object-cover" sizes="(max-width: 1024px) 100vw, 1024px" />
            </div>
          </div>
        ) : null}

        <div className="mx-auto mt-10 grid max-w-6xl gap-10 px-5 sm:px-8 lg:mt-14 lg:grid-cols-[4.5rem_minmax(0,42rem)] lg:justify-center lg:gap-12">
          <aside className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
            <ShareLinks url={pageUrl} title={a.title} stacked />
          </aside>

          <div className="min-w-0">
            {a.excerpt ? <p className="mb-8 text-xl leading-relaxed text-ink-900">{a.excerpt}</p> : null}
            {showToc ? (
              <>
                {opening ? <div className="article-body" dangerouslySetInnerHTML={{ __html: opening }} /> : null}
                <TableOfContents items={toc} />
                {rest ? <div className="article-body is-rest" dangerouslySetInnerHTML={{ __html: rest }} /> : null}
              </>
            ) : (
              <div className="article-body" dangerouslySetInnerHTML={{ __html: html }} />
            )}

            {a.gallery.length ? (
              <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {a.gallery.map((path, i) => {
                  const src = publicMediaUrl(path);
                  return src ? (
                    <a key={`${path}-${i}`} href={src} target="_blank" rel="noopener noreferrer" className="relative block aspect-[4/3] overflow-hidden rounded-[5px] border border-line bg-surface-3">
                      <Image src={src} alt={`${a.title}, image ${i + 1}`} fill unoptimized className="object-cover transition-transform duration-500 hover:scale-[1.03]" sizes="(max-width: 640px) 50vw, 280px" />
                    </a>
                  ) : null;
                })}
              </div>
            ) : null}

            {a.tags.length ? (
              <div className="mt-12 border-t border-line pt-8">
                <p className="text-sm font-semibold text-ink-900">Tags</p>
                <ul className="mt-3 flex flex-wrap gap-2" aria-label="Tags">
                  {a.tags.map((tag) => (
                    <li key={tag}>
                      <Link href={`/blogs?q=${encodeURIComponent(tag)}`} className="inline-flex rounded-full bg-surface-3 px-3 py-1 text-[13px] text-body hover:text-brand-600">
                        {tag}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      </article>

      {related.length ? (
        <section className="border-t border-line bg-surface-2 py-16 lg:py-20">
          <Container>
            <div className="flex items-end justify-between gap-4">
              <h2 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">Keep reading</h2>
              <Link href="/blogs" className="text-sm font-semibold text-brand-600 hover:underline">
                All articles
              </Link>
            </div>
            <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((post) => (
                <PostCard key={post.id} post={post} heading="h3" />
              ))}
            </div>
          </Container>
        </section>
      ) : null}
    </>
  );
}
