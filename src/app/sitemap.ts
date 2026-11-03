import type { MetadataRoute } from "next";
import { company, services } from "@/lib/content";
import { getPublishedWork, getPublishedProducts, getPublishedEvents } from "@/lib/cms";
import { getSitemapArticles } from "@/lib/blog";

const base = company.domain;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [work, articles, products, events] = await Promise.all([
    getPublishedWork(),
    getSitemapArticles(),
    getPublishedProducts(),
    getPublishedEvents(),
  ]);

  const pages = ["", "/services", "/about", "/contact", "/work", "/process", "/blogs", "/products", "/events", "/founders", "/partners"];
  const legal = ["/privacy", "/terms", "/sla"];
  const latestArticle = articles[0] ? new Date(articles[0].updated_at) : undefined;

  return [
    ...pages.map((route) => ({
      url: `${base}${route}`,
      lastModified: route === "/blogs" ? latestArticle : undefined,
      changeFrequency: (route === "" || route === "/blogs" ? "weekly" : "monthly") as "weekly" | "monthly",
      priority: route === "" ? 1 : 0.8,
    })),
    ...services.map((s) => ({
      url: `${base}/services/${s.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...articles.map((a) => ({
      url: `${base}/blogs/${a.slug}`,
      lastModified: new Date(a.updated_at),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...work.map((w) => ({
      url: `${base}/work/${w.slug}`,
      lastModified: new Date(w.updated_at),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...products.map((p) => ({
      url: `${base}/products/${p.slug}`,
      lastModified: new Date(p.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...events.map((e) => ({
      url: `${base}/events/${e.slug}`,
      lastModified: new Date(e.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...legal.map((route) => ({
      url: `${base}${route}`,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];
}
