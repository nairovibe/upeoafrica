import { company } from "@/lib/content";
import { submitToIndexNow } from "@/lib/indexnow";

/**
 * Tell the engines that accept an immediate submission.
 * IndexNow covers Bing, Yandex, Seznam, Naver and others.
 * Bing also reads a sitemap ping. Google does not accept IndexNow or the old
 * sitemap ping. It discovers the page from the sitemap, which is refreshed
 * in the same save.
 */
export async function announceToSearchEngines(urls: string[]) {
  const sitemap = `${company.domain}/sitemap.xml`;
  const list = [...new Set([...urls, `${company.domain}/blogs`, `${company.domain}/feed.xml`, sitemap])];
  const indexnow = await submitToIndexNow(list);
  let bing = false;
  try {
    const res = await fetch(`https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemap)}`);
    bing = res.ok;
  } catch {
    bing = false;
  }
  return { indexnow: indexnow.submitted, bing };
}
