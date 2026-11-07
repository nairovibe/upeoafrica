import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleView } from "@/components/blog/ArticleView";
import { getPreviewArticleBySlug } from "@/lib/blog";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPreviewArticleBySlug(slug);
  if (!article) return { title: "Preview" };
  return { title: article.title, robots: { index: false, follow: false } };
}

export default async function ArticlePreviewPage({ params }: Props) {
  const { slug } = await params;
  const article = await getPreviewArticleBySlug(slug);
  if (!article) notFound();
  return <ArticleView article={article} preview />;
}
