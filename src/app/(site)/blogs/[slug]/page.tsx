import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/site/PageHeader";
import { Container } from "@/components/ui/Container";
import { CTA } from "@/components/sections/CTA";
import { getArticleBySlug } from "@/lib/cms";
import { publicMediaUrl } from "@/lib/constants";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = await getArticleBySlug(slug);
  if (!item) return { title: "Blogs" };
  return { title: item.title, description: item.excerpt };
}

export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getArticleBySlug(slug);
  if (!item) notFound();
  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Blogs", href: "/blogs" }, { label: item.title }]}
        title={item.title}
        intro={item.excerpt}
        image={publicMediaUrl(item.cover_path) || undefined}
      />
      <section className="bg-white py-24 lg:py-32">
        <Container>
          <article className="mx-auto max-w-2xl whitespace-pre-wrap text-lg leading-relaxed text-body">
            {item.body}
          </article>
        </Container>
      </section>
      <CTA />
    </>
  );
}
