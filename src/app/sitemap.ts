import type { MetadataRoute } from "next";
import { services } from "@/lib/content";
import { getPublishedArticles, getPublishedWork, getPublishedProducts, getPublishedEvents } from "@/lib/cms";

const base = "https://upeoafricatechnologies.co.ke";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [work, articles, products, events] = await Promise.all([
    getPublishedWork(),
    getPublishedArticles(),
    getPublishedProducts(),
    getPublishedEvents(),
  ]);

  const now = new Date();
  const pages = ["", "/services", "/about", "/contact", "/work", "/process", "/blogs", "/products", "/events", "/founders", "/partners"];
  const legal = ["/privacy", "/terms", "/sla"];

  return [
    ...pages.map((route) => ({
      url: `${base}${route}`,
      lastModified: now,
      changeFrequency: (route === "" ? "weekly" : "monthly") as "weekly" | "monthly",
      priority: route === "" ? 1 : 0.8,
    })),
    ...services.map((s) => ({
      url: `${base}/services/${s.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...work.map((w) => ({
      url: `${base}/work/${w.slug}`,
      lastModified: new Date(w.published_at || w.updated_at),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...articles.map((a) => ({
      url: `${base}/blogs/${a.slug}`,
      lastModified: new Date(a.published_at || a.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.6,
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
      priority: 0.7,
    })),
    ...legal.map((route) => ({
      url: `${base}${route}`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];
}
