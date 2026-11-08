import { renderArticleBody } from "@/lib/blog";

/** The same sanitised article HTML the blog uses, for any long description. */
export function ArticleCopy({ text }: { text: string }) {
  if (!text.trim()) return null;
  const { html } = renderArticleBody(text);
  if (!html.trim()) return null;
  return <div className="article-body" dangerouslySetInnerHTML={{ __html: html }} />;
}
