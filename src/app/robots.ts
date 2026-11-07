import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { company } from "@/lib/content";

/** Private surfaces. Search and assistant bots may read everything else. */
const hidden = ["/console", "/api/", "/invoice", "/*/preview"];

/** High-volume crawlers that ignore content and hammer the site. */
const heavy = [
  "AhrefsBot",
  "SemrushBot",
  "MJ12bot",
  "DotBot",
  "BLEXBot",
  "DataForSeoBot",
  "PetalBot",
  "Bytespider",
  "CCBot",
  "MegaIndex",
  "SeekportBot",
  "serpstatbot",
];

/** Named so a specific-bot rule cannot drop the private-path block. */
const welcome = [
  "Googlebot",
  "Googlebot-Image",
  "Bingbot",
  "DuckDuckBot",
  "Applebot",
  "YandexBot",
  "Baiduspider",
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "PerplexityBot",
  "Google-Extended",
];

export default async function robots(): Promise<MetadataRoute.Robots> {
  const host = (await headers()).get("host") ?? "";
  if (host.toLowerCase().startsWith("console.")) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  const publicRule = { allow: "/", disallow: hidden };

  return {
    rules: [
      { userAgent: "*", ...publicRule },
      { userAgent: welcome, ...publicRule },
      ...heavy.map((userAgent) => ({ userAgent, disallow: "/" })),
    ],
    sitemap: `${company.domain}/sitemap.xml`,
    host: company.domain,
  };
}
