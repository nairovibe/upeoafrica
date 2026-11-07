import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { parseVideoUrl } from "@/components/admin/studio/video";
import { PageHeader } from "@/components/site/PageHeader";
import { Container } from "@/components/ui/Container";
import { CTA } from "@/components/sections/CTA";
import { StoryBody } from "@/components/work/StoryBody";
import { WorkDemo } from "@/components/work/WorkDemo";
import { workByline } from "@/components/work/format";
import { NextProject, WorkFacts, WorkGallery, WorkResults, WorkScope, WorkTestimonial } from "@/components/work/WorkSections";
import { getPublishedWork, getWorkBySlug } from "@/lib/cms";
import { publicMediaUrl } from "@/lib/constants";
import { company } from "@/lib/content";
import { safeHttpUrl } from "@/lib/stack";

type Params = Promise<{ slug: string }>;

export const revalidate = 43200;

export async function generateStaticParams() {
  const work = await getPublishedWork();
  return work.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const item = await getWorkBySlug(slug);
  if (!item) return { title: "Work" };
  const url = `/work/${item.slug}`;
  const title = item.meta_title || item.title;
  const description = item.meta_description || item.summary || undefined;
  const image = publicMediaUrl(item.cover_path);
  return {
    title: item.meta_title ? { absolute: item.meta_title } : `${item.title} case study`,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title,
      description,
      siteName: company.name,
      locale: "en_KE",
      publishedTime: item.published_at ?? undefined,
      modifiedTime: item.updated_at,
      images: image ? [{ url: image, alt: item.title }] : undefined,
    },
    twitter: { card: image ? "summary_large_image" : "summary", title, description, images: image ? [image] : undefined },
  };
}

export default async function WorkDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const [item, all] = await Promise.all([getWorkBySlug(slug), getPublishedWork()]);
  if (!item) notFound();

  const cover = publicMediaUrl(item.cover_path);
  const video = parseVideoUrl(item.video_url);
  const gallery = item.gallery.map((p) => publicMediaUrl(p)).filter((u): u is string => Boolean(u));
  const index = all.findIndex((w) => w.id === item.id);
  const next = all.length > 1 ? all[(index + 1) % all.length] : null;
  const byline = workByline(item);
  const pageUrl = `${company.domain}/work/${item.slug}`;
  const live = item.confidential ? null : safeHttpUrl(item.project_url);
  const publicClient = item.confidential ? null : item.client;
  const hasStory = Boolean(item.body.trim()) || item.services.length > 0 || item.tech_stack.length > 0;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CreativeWork",
        "@id": `${pageUrl}#work`,
        name: item.title,
        headline: item.meta_title || item.title,
        description: item.meta_description || item.summary || undefined,
        url: pageUrl,
        image: [cover, ...gallery].filter(Boolean),
        dateCreated: item.project_year ? String(item.project_year) : undefined,
        datePublished: item.published_at ?? undefined,
        dateModified: item.updated_at,
        inLanguage: "en-KE",
        genre: item.industry ?? undefined,
        keywords: [...item.services, ...item.tech_stack].join(", ") || undefined,
        creator: { "@type": "Organization", name: company.name, url: company.domain },
        sponsor: publicClient?.name
          ? { "@type": "Organization", name: publicClient.name, url: publicClient.url ?? undefined }
          : undefined,
        sameAs: live ?? undefined,
        video: video
          ? { "@type": "VideoObject", name: `${item.title} walkthrough`, embedUrl: video.embedUrl, thumbnailUrl: video.thumbUrl ?? cover ?? undefined, uploadDate: item.published_at ?? undefined }
          : undefined,
        mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: company.domain },
          { "@type": "ListItem", position: 2, name: "Our Work", item: `${company.domain}/work` },
          { "@type": "ListItem", position: 3, name: item.title, item: pageUrl },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <PageHeader
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Our Work", href: "/work" }, { label: item.title }]}
        title={item.title}
        intro={item.summary || undefined}
        meta={[byline, item.industry].filter(Boolean).join(" · ") || undefined}
        image={cover || undefined}
        imageAlt={item.title}
      />

      <section className="bg-white py-14 lg:py-20">
        <Container>
          <WorkFacts item={item} />
          {live ? (
            <div className="mt-10">
              <WorkDemo url={live} title={item.title} />
            </div>
          ) : null}
          {hasStory ? (
            <div className="mt-14 grid gap-14 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-20">
              <article className="max-w-2xl">
                {item.body.trim() ? <StoryBody text={item.body} /> : null}
              </article>
              <aside className="lg:sticky lg:top-28 lg:self-start">
                <WorkScope services={item.services} tech={item.tech_stack} />
              </aside>
            </div>
          ) : null}
        </Container>
      </section>

      <WorkResults outcomes={item.outcomes} />

      {video || gallery.length ? (
        <section aria-label="Screens and video" className="bg-white py-14 lg:py-20">
          <Container className="space-y-4">
            {video ? (
              <div className="aspect-video overflow-hidden rounded-[5px] bg-ink-950">
                <iframe
                  src={video.embedUrl}
                  title={`${item.title} walkthrough`}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            ) : null}
            <WorkGallery images={gallery} title={item.title} />
          </Container>
        </section>
      ) : item.video_url ? (
        <Container className="py-10">
          <a href={item.video_url} className="font-medium text-brand-600 hover:underline" target="_blank" rel="noreferrer">
            Watch the walkthrough
          </a>
        </Container>
      ) : null}

      {!item.confidential && item.testimonial_quote ? (
        <section className="border-t border-line bg-white py-16 lg:py-24">
          <Container>
            <WorkTestimonial quote={item.testimonial_quote} author={item.testimonial_author} title={item.testimonial_title} />
          </Container>
        </section>
      ) : null}

      {next ? (
        <section className="bg-white pb-16 lg:pb-24">
          <Container>
            <NextProject item={next} />
          </Container>
        </section>
      ) : null}

      <CTA
        title="Want results like these?"
        intro={`Tell us what you need built. We have shipped ${item.industry ? `${item.industry.toLowerCase()} ` : ""}projects like this one and can show you how it would work for you.`}
      />
    </>
  );
}
