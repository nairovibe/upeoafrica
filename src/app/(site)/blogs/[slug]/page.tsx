import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleView } from "@/components/blog/ArticleView";
import { getLiveArticleBySlug, getSitemapArticles } from "@/lib/blog";
import { publicMediaUrl } from "@/lib/constants";
import { company } from "@/lib/content";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 43200;

export async function generateStaticParams() {
  const articles = await getSitemapArticles();
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const a = await getLiveArticleBySlug(slug);
  if (!a) return { title: "Blog" };
  const url = `/blogs/${a.slug}`;
  const title = a.meta_title || a.title;
  const description = a.meta_description || a.excerpt;
  const image = publicMediaUrl(a.og_image_path) || publicMediaUrl(a.cover_path);
  const keywords = [...new Set([a.focus_keyword, ...a.keywords, ...a.tags].filter((k): k is string => Boolean(k)))];
  return {
    title: a.meta_title ? { absolute: a.meta_title } : a.title,
    description,
    keywords: keywords.length ? keywords : undefined,
    authors: [{ name: a.author_name || company.name }],
    alternates: { canonical: a.canonical_url || url },
    robots: a.noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      type: "article",
      url,
      title,
      description,
      siteName: company.name,
      locale: "en_KE",
      publishedTime: a.published_at ?? undefined,
      modifiedTime: a.updated_at,
      authors: [a.author_name || company.name],
      section: a.category ?? undefined,
      tags: a.tags,
      images: image ? [{ url: image, alt: a.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getLiveArticleBySlug(slug);
  if (!article) notFound();
  return <ArticleView article={article} />;
}
