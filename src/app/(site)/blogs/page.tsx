import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHeader } from "@/components/site/PageHeader";
import { Container } from "@/components/ui/Container";
import { CTA } from "@/components/sections/CTA";
import { getPublishedArticles } from "@/lib/cms";
import { publicMediaUrl } from "@/lib/constants";

const intro =
  "Read articles on software, payments, design, and growing a business across Africa and abroad. New pieces are added here as they are published.";

export const metadata: Metadata = {
  title: "Blogs",
  description: intro,
};

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function BlogsPage() {
  const articles = await getPublishedArticles();
  const [lead, ...rest] = articles;

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Blogs" }]}
        title="Blogs"
        intro={intro}
      />

      <section className="bg-white py-20 lg:py-28">
        <Container>
          {!lead ? (
            <p className="max-w-2xl text-lg leading-relaxed text-body">
              Articles will appear here as they are published.
            </p>
          ) : (
            <div>
              <LeadArticle article={lead} />
              {rest.length > 0 && (
                <ol className="mt-6 divide-y divide-[#ececec] border-t border-[#ececec]">
                  {rest.map((article) => {
                    const cover = publicMediaUrl(article.cover_path);
                    return (
                      <li key={article.id}>
                        <Link href={`/blogs/${article.slug}`} className="group grid gap-6 py-8 sm:grid-cols-[9.5rem_minmax(0,1fr)] sm:items-center">
                          <div className="relative aspect-[16/10] overflow-hidden rounded-[7px] bg-[#edf3f8] sm:aspect-[3/2]">
                            {cover ? (
                              <Image src={cover} alt="" fill className="object-cover" sizes="160px" />
                            ) : null}
                          </div>
                          <div>
                            <time dateTime={article.published_at ?? undefined} className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">
                              {formatDate(article.published_at)}
                            </time>
                            <h2 className="mt-2 text-2xl font-semibold text-ink-900 group-hover:text-brand-600">
                              {article.title}
                            </h2>
                            {article.excerpt ? (
                              <p className="mt-2 max-w-2xl text-lg leading-relaxed text-body">{article.excerpt}</p>
                            ) : null}
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ol>
              )}
            </div>
          )}
        </Container>
      </section>

      <CTA
        title="Ready to talk about a project?"
        intro="If a piece here matches work you have in mind, tell us the initiative. We scope it, price it, and stay with it through launch."
      />
    </>
  );
}

function LeadArticle({
  article,
}: {
  article: {
    slug: string;
    title: string;
    excerpt: string;
    cover_path: string | null;
    published_at: string | null;
  };
}) {
  const cover = publicMediaUrl(article.cover_path);
  return (
    <Link href={`/blogs/${article.slug}`} className="group grid items-center gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-14">
      <div className="relative aspect-[16/10] overflow-hidden rounded-[7px] bg-[#edf3f8]">
        {cover ? <Image src={cover} alt="" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 60vw" priority /> : null}
      </div>
      <div>
        <time dateTime={article.published_at ?? undefined} className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">
          {formatDate(article.published_at)}
        </time>
        <h2 className="mt-3 text-3xl font-bold leading-[1.08] text-ink-900 group-hover:text-brand-600 sm:text-4xl">
          {article.title}
        </h2>
        {article.excerpt ? <p className="mt-4 text-lg leading-relaxed text-body">{article.excerpt}</p> : null}
        <span className="mt-6 inline-flex text-sm font-semibold text-brand-600">Read article</span>
      </div>
    </Link>
  );
}
