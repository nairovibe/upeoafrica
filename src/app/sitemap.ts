import type { MetadataRoute } from "next";
import { company, services } from "@/lib/content";
import { getPublishedWork, getPublishedProducts, getPublishedEvents, getExperts } from "@/lib/cms";
import { getSitemapArticles } from "@/lib/blog";
import { publicMediaUrl } from "@/lib/constants";

const base = company.domain;

export const revalidate = 43200;

const pages: { path: string; changeFrequency: "weekly" | "monthly"; priority: number }[] = [
  { path: "", changeFrequency: "weekly", priority: 1 },
  { path: "/services", changeFrequency: "monthly", priority: 0.9 },
  { path: "/work", changeFrequency: "weekly", priority: 0.9 },
  { path: "/blogs", changeFrequency: "weekly", priority: 0.9 },
  { path: "/products", changeFrequency: "weekly", priority: 0.8 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.8 },
  { path: "/about", changeFrequency: "monthly", priority: 0.7 },
  { path: "/process", changeFrequency: "monthly", priority: 0.7 },
  { path: "/events", changeFrequency: "weekly", priority: 0.7 },
  { path: "/founders", changeFrequency: "monthly", priority: 0.6 },
  { path: "/partners", changeFrequency: "monthly", priority: 0.5 },
];

const legal = ["/privacy", "/terms", "/sla"];

function imageOf(path: string | null | undefined) {
  const image = publicMediaUrl(path);
  return image ? [image] : undefined;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [work, articles, products, events, experts] = await Promise.all([
    getPublishedWork(),
    getSitemapArticles(),
    getPublishedProducts(),
    getPublishedEvents(),
    getExperts(),
  ]);
  const latestArticle = articles[0] ? new Date(articles[0].updated_at) : undefined;

  return [
    ...pages.map((page) => ({
      url: `${base}${page.path}`,
      lastModified: page.path === "/blogs" ? latestArticle : undefined,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    })),
    ...services.map((service) => ({
      url: `${base}/services/${service.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...articles.map((article) => ({
      url: `${base}/blogs/${article.slug}`,
      lastModified: new Date(article.updated_at),
      changeFrequency: "monthly" as const,
      priority: 0.7,
      images: imageOf(article.cover_path),
    })),
    ...work.map((item) => ({
      url: `${base}/work/${item.slug}`,
      lastModified: new Date(item.updated_at),
      changeFrequency: "monthly" as const,
      priority: 0.7,
      images: imageOf(item.cover_path),
    })),
    ...products.map((product) => ({
      url: `${base}/products/${product.slug}`,
      lastModified: new Date(product.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.7,
      images: imageOf(product.cover_path),
    })),
    ...experts.map((person) => ({
      url: `${base}/experts/${person.slug}`,
      lastModified: new Date(person.updated_at),
      changeFrequency: "monthly" as const,
      priority: 0.6,
      images: imageOf(person.photo_path),
    })),
    ...events.map((event) => ({
      url: `${base}/events/${event.slug}`,
      lastModified: new Date(event.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.6,
      images: imageOf(event.cover_path),
    })),
    ...legal.map((route) => ({
      url: `${base}${route}`,
      changeFrequency: "yearly" as const,
      priority: 0.2,
    })),
  ];
}
