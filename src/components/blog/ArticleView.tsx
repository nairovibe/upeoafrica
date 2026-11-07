import Image from "next/image";
import Link from "next/link";
import { PageHeader } from "@/components/site/PageHeader";
import { Container } from "@/components/ui/Container";
import { CTA } from "@/components/sections/CTA";
import { PostCard } from "@/components/blog/PostCard";
import { ShareLinks } from "@/components/blog/ShareLinks";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { countWords, extractFaq, formatBlogDate, getRelatedArticles, htmlToText, readingMinutes, renderArticleBody } from "@/lib/blog";
import { publicMediaUrl } from "@/lib/constants";
import { company } from "@/lib/content";
import type { Tables } from "@/lib/database.types";

export async function ArticleView({ article: a, preview = false }: { article: Tables<"articles">; preview?: boolean }) {
  const { html, toc } = renderArticleBody(a.body);
  const words = countWords(htmlToText(html));
  const minutes = a.reading_minutes || readingMinutes(words);
  const pageUrl = `${company.domain}/blogs/${a.slug}`;
  const cover = publicMediaUrl(a.cover_path);
  const image = publicMediaUrl(a.og_image_path) || cover;
  const author = a.author_name || company.name;
  const updated = a.published_at && new Date(a.updated_at).getTime() - new Date(a.published_at).getTime() > 86_400_000;
  const related = preview ? [] : await getRelatedArticles(a);
  const faq = extractFaq(html);

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
      <PageHeader
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Blog", href: "/blogs" },
          ...(a.category ? [{ label: a.category, href: `/blogs?category=${encodeURIComponent(a.category)}` }] : []),
          { label: a.title },
        ]}
        title={a.title}
        intro={a.excerpt || undefined}
        image={cover || undefined}
        imageAlt={cover ? a.title : undefined}
        meta={
          <>
            By {author}
            {a.published_at ? <> · <time dateTime={a.published_at}>{formatBlogDate(a.published_at)}</time></> : null}
            {updated ? <> · Updated <time dateTime={a.updated_at}>{formatBlogDate(a.updated_at)}</time></> : null}
            {" "}· {minutes} min read
          </>
        }
      />

      {preview ? (
        <div className="bg-brand-50 py-3 text-center text-sm font-medium text-brand-700">
          Preview. This article is not live yet.
        </div>
      ) : null}

      <section className="bg-white py-14 lg:py-20">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_15rem] lg:gap-16">
            <article className="min-w-0">
              <div className="article-body" dangerouslySetInnerHTML={{ __html: html }} />

              {a.gallery.length ? (
                <div className="mt-12 grid max-w-[68ch] grid-cols-2 gap-3 sm:grid-cols-3">
                  {a.gallery.map((path, i) => {
                    const src = publicMediaUrl(path);
                    return src ? (
                      <a key={`${path}-${i}`} href={src} target="_blank" rel="noopener noreferrer" className="relative block aspect-[4/3] overflow-hidden rounded-[5px] border border-line bg-surface-3">
                        <Image src={src} alt={`${a.title}, image ${i + 1}`} fill className="object-cover transition-transform duration-500 hover:scale-[1.03]" sizes="(max-width: 640px) 50vw, 300px" />
                      </a>
                    ) : null;
                  })}
                </div>
              ) : null}

              <div className="mt-12 max-w-[68ch] space-y-6 border-t border-line pt-8">
                {a.tags.length ? (
                  <ul className="flex flex-wrap gap-2" aria-label="Tags">
                    {a.tags.map((tag) => (
                      <li key={tag}>
                        <Link
                          href={`/blogs?q=${encodeURIComponent(tag)}`}
                          className="inline-flex rounded-[5px] bg-surface-3 px-2.5 py-1 text-[13px] text-body hover:text-brand-600"
                        >
                          {tag}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
                <ShareLinks url={pageUrl} title={a.title} />
              </div>
            </article>

            {toc.length > 1 ? (
              <aside className="hidden lg:block">
                <div className="sticky top-28">
                  <TableOfContents items={toc} />
                </div>
              </aside>
            ) : null}
          </div>
        </Container>
      </section>

      {related.length ? (
        <section className="border-t border-line bg-surface-2 py-16 lg:py-20">
          <Container>
            <h2 className="text-2xl font-bold text-ink-900 sm:text-3xl">Keep reading</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      <CTA />
    </>
  );
}
