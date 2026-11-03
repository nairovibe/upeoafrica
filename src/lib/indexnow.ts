import { company } from "@/lib/content";

const HOST = new URL(company.domain).host;

/** IndexNow key file. The key itself is public by design; this path is where engines verify it. */
export function indexNowKeyLocation() {
  return `${company.domain}/indexnow-key.txt`;
}

function onOurHost(raw: string) {
  try {
    const url = new URL(raw);
    return (url.host === HOST || url.host === `www.${HOST}`) && url.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Tell IndexNow (Bing, Yandex, Seznam, Naver and others) about new or updated public URLs.
 * Google does not read IndexNow; it discovers pages from the sitemap.
 * No-ops when INDEXNOW_KEY is unset, and never throws.
 */
export async function submitToIndexNow(urls: string[]) {
  const key = process.env.INDEXNOW_KEY;
  if (!key) return { submitted: 0 };
  const urlList = [...new Set(urls.filter(onOurHost))].slice(0, 100);
  if (urlList.length === 0) return { submitted: 0 };
  try {
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: HOST,
        key,
        keyLocation: indexNowKeyLocation(),
        urlList,
      }),
    });
    return { submitted: res.ok || res.status === 202 ? urlList.length : 0 };
  } catch {
    return { submitted: 0 };
  }
}
