import { getAllLiveArticleCards } from "@/lib/blog";
import { publicMediaUrl } from "@/lib/constants";
import { company } from "@/lib/content";

export const revalidate = 43200;

function xml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export async function GET() {
  const posts = await getAllLiveArticleCards();
  const updated = posts[0]?.published_at ? new Date(posts[0].published_at) : new Date();
  const items = posts
    .map((post) => {
      const link = `${company.domain}/blogs/${post.slug}`;
      const cover = publicMediaUrl(post.cover_path);
      const when = post.published_at ? new Date(post.published_at).toUTCString() : updated.toUTCString();
      return `    <item>
      <title>${xml(post.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${when}</pubDate>
      ${post.category ? `<category>${xml(post.category)}</category>` : ""}
      ${post.author_name ? `<dc:creator>${xml(post.author_name)}</dc:creator>` : ""}
      <description>${xml(post.excerpt || post.title)}</description>
      ${cover ? `<enclosure url="${xml(cover)}" type="image/jpeg" />` : ""}
    </item>`;
    })
    .join("\n");

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${xml(company.name)}</title>
    <link>${company.domain}/blogs</link>
    <atom:link href="${company.domain}/feed.xml" rel="self" type="application/rss+xml" />
    <description>${xml("Practical writing on software, payments, design, and growing a business in Kenya and East Africa.")}</description>
    <language>en-ke</language>
    <lastBuildDate>${updated.toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
