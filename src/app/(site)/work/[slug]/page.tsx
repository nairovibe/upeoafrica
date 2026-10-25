import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/site/PageHeader";
import { Container } from "@/components/ui/Container";
import { CTA } from "@/components/sections/CTA";
import { getWorkBySlug } from "@/lib/cms";
import { publicMediaUrl } from "@/lib/constants";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = await getWorkBySlug(slug);
  if (!item) return { title: "Work" };
  return { title: item.title, description: item.summary };
}

export default async function WorkDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getWorkBySlug(slug);
  if (!item) notFound();
  const cover = publicMediaUrl(item.cover_path);

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Our Work", href: "/work" }, { label: item.title }]}
        title={item.title}
        intro={item.summary}
        image={cover || undefined}
        imageAlt={item.title}
      />
      <section className="bg-white py-24 lg:py-32">
        <Container>
          <div className="grid gap-14 lg:grid-cols-[1fr_280px]">
            <article className="max-w-2xl whitespace-pre-wrap text-[15px] leading-relaxed text-body">
              {item.body}
            </article>
            <aside className="space-y-8">
              {item.industry && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Industry</p>
                  <p className="mt-2 text-sm text-ink-900">{item.industry}</p>
                </div>
              )}
              {item.services.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">What we did</p>
                  <ul className="mt-2 space-y-1 text-sm text-ink-900">
                    {item.services.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
              {item.outcomes.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Outcomes</p>
                  <ul className="mt-2 space-y-1 text-sm text-ink-900">
                    {item.outcomes.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </aside>
          </div>
          {item.video_url && (
            <p className="mt-12">
              <a href={item.video_url} className="font-medium text-brand-600 hover:underline" target="_blank" rel="noreferrer">
                Watch the walkthrough
              </a>
            </p>
          )}
        </Container>
      </section>
      <CTA />
    </>
  );
}
