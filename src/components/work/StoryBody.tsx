import { Fragment } from "react";
import { isHtml } from "@/components/blog/analysis";
import { renderArticleBody } from "@/lib/blog";

/**
 * Case studies written in the blog editor render as that same HTML.
 * Older plain-text stories still use the small markdown subset: blank-line
 * paragraphs, `##`/`###` headings, `-` or `1.` lists, `>` quotes, `**bold**`
 * and `[label](https://link)`.
 */
const INLINE = /(\*\*[^*]+\*\*|\[[^\]]+\]\((?:https?:\/\/|\/)[^)\s]+\))/g;

function inline(text: string) {
  return text.split(INLINE).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-ink-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    const link = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
    if (link) {
      const external = link[2].startsWith("http");
      return (
        <a
          key={i}
          href={link[2]}
          className="font-medium text-brand-600 underline decoration-brand-200 underline-offset-4 hover:decoration-brand-500"
          {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
        >
          {link[1]}
        </a>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

function lines(text: string) {
  return text.split("\n").map((line, i, all) => (
    <Fragment key={i}>
      {inline(line)}
      {i < all.length - 1 ? <br /> : null}
    </Fragment>
  ));
}

export function StoryBody({ text }: { text: string }) {
  if (isHtml(text)) {
    const { html } = renderArticleBody(text);
    return <div className="article-body" dangerouslySetInnerHTML={{ __html: html }} />;
  }
  const blocks = text
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);

  return (
    <div className="space-y-5 text-[17px] leading-[1.75] text-body">
      {blocks.map((block, i) => {
        const rows = block.split("\n").map((l) => l.trim());
        if (/^###\s/.test(block)) {
          return (
            <h3 key={i} className="pt-3 font-display text-xl font-semibold text-ink-900">
              {block.replace(/^###\s+/, "")}
            </h3>
          );
        }
        if (/^##?\s/.test(block)) {
          return (
            <h2 key={i} className="pt-5 font-display text-2xl font-semibold text-ink-900">
              {block.replace(/^##?\s+/, "")}
            </h2>
          );
        }
        if (rows.every((l) => /^[-*]\s/.test(l))) {
          return (
            <ul key={i} className="space-y-2 pl-5 marker:text-brand-500 [list-style:square]">
              {rows.map((l, j) => (
                <li key={j}>{inline(l.replace(/^[-*]\s+/, ""))}</li>
              ))}
            </ul>
          );
        }
        if (rows.every((l) => /^\d+[.)]\s/.test(l))) {
          return (
            <ol key={i} className="list-decimal space-y-2 pl-5 marker:font-semibold marker:text-brand-600">
              {rows.map((l, j) => (
                <li key={j}>{inline(l.replace(/^\d+[.)]\s+/, ""))}</li>
              ))}
            </ol>
          );
        }
        if (rows.every((l) => l.startsWith(">"))) {
          return (
            <blockquote key={i} className="border-l-2 border-brand-500 pl-5 text-ink-900">
              {lines(rows.map((l) => l.replace(/^>\s?/, "")).join("\n"))}
            </blockquote>
          );
        }
        return <p key={i}>{lines(block)}</p>;
      })}
    </div>
  );
}
