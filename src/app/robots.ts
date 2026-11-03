import type { MetadataRoute } from "next";
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

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: hidden },
      ...heavy.map((userAgent) => ({ userAgent, disallow: "/" })),
    ],
    sitemap: `${company.domain}/sitemap.xml`,
    host: company.domain,
  };
}
