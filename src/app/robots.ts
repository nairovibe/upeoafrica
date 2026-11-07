import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { company } from "@/lib/content";

const hidden = ["/console", "/api/", "/invoice"];

/** High-volume crawlers that ignore content and hammer the site. Search and assistant bots stay allowed. */
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

export default async function robots(): Promise<MetadataRoute.Robots> {
  const host = (await headers()).get("host") ?? "";
  if (host.toLowerCase().startsWith("console.")) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: hidden },
      ...heavy.map((userAgent) => ({ userAgent, disallow: "/" })),
    ],
    sitemap: `${company.domain}/sitemap.xml`,
    host: company.domain,
  };
}
