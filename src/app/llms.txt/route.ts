import { company, nav, legalNav, services } from "@/lib/content";
import { getPublishedEvents, getPublishedProducts, getPublishedWork } from "@/lib/cms";
import { getSitemapArticles } from "@/lib/blog";

const base = company.domain;

const PAGE_NOTES: Record<string, string> = {
  "/services": "Software, design and marketing, delivered by one team.",
  "/work": "Portfolio of client projects.",
  "/process": "How a project runs from the brief to launch.",
  "/events": "Talks, workshops and ticketed sessions, with M-Pesa checkout.",
  "/blogs": "Articles on software, payments, design and growth.",
  "/contact": "Start a project with the studio.",
};

function line(path: string, label: string, note: string) {
  return `- [${label}](${base}${path}): ${note}`;
}

/** A short map for assistants. Titles and links only, never page bodies. */
export async function GET() {
  const [articles, work, products, events] = await Promise.all([
    getSitemapArticles(),
    getPublishedWork(),
    getPublishedProducts(),
    getPublishedEvents(),
  ]);

  const pages = [
    line("/", "Home", "Software, design and marketing studio in Mombasa."),
    ...nav
      .filter((item) => item.href !== "/")
      .map((item) => line(item.href, item.label, PAGE_NOTES[item.href] ?? "Main page.")),
    line("/about", "About", "The studio, since 2019."),
    line("/products", "Products", "Plugins, downloads and plans for sale."),
    line("/founders", "For founders", "How we work with founders."),
    line("/partners", "Partners", "Technology and delivery partners."),
    ...legalNav.map((item) => line(item.href, item.label, "Legal page.")),
  ];

  const text = [
    `# ${company.legalName}`,
    "",
    `> ${company.tagline}. Based at ${company.addressLine}. We design and build custom web and mobile apps, M-Pesa and card payments, branding, and digital marketing for businesses in Kenya and across Africa.`,
    "",
    `Contact: ${company.email}, ${company.phone}.`,
    `Full URL list for search engines: ${base}/sitemap.xml`,
    "The console, API, invoices and draft content are private and are not listed here.",
    "",
    "## Pages",
    ...pages,
    "",
    "## Services",
    ...services.map((service) => line(`/services/${service.slug}`, service.title, service.short)),
    "",
    "## Published articles",
    ...(articles.length
      ? articles.map((article) => line(`/blogs/${article.slug}`, article.title, "Blog article."))
      : ["- None published yet."]),
    "",
    "## Case studies",
    ...(work.length
      ? work.map((item) => line(`/work/${item.slug}`, item.title, item.summary || "Client project."))
      : ["- None published yet."]),
    "",
    "## Products",
    ...(products.length
      ? products.map((item) => line(`/products/${item.slug}`, item.title, item.description.slice(0, 140)))
      : ["- None published yet."]),
    "",
    "## Events",
    ...(events.length
      ? events.map((item) => line(`/events/${item.slug}`, item.title, item.summary || "Studio event."))
      : ["- None published yet."]),
    "",
  ].join("\n");

  return new Response(text, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
