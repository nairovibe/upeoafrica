"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/site/PageHeader";
import { Container } from "@/components/ui/Container";
import { formatKes } from "@/lib/constants";
import { chargeKes, currentOffer } from "@/lib/offer";
import { matchesProductLine, productMenu, products, PRODUCT_LINES, type ProductLine } from "@/lib/content";
import { cn } from "@/lib/utils";

const LINE_COPY: Record<ProductLine, { title: string; intro: string }> = {
  plugin: {
    title: "WordPress plugins",
    intro: "Plugins we sell for WordPress. Each one is built by the same team that delivers client work.",
  },
  pos: {
    title: "POS systems",
    intro: "Point-of-sale software and plugins for retail and hospitality, including the ones that keep selling when the connection drops.",
  },
  saas: {
    title: "Apps & SaaS",
    intro: "Products we design, launch, and keep running.",
  },
};

export type ProductCard = {
  id: string;
  slug: string;
  type: string;
  title: string;
  description: string;
  price_kes: number;
  promo_price_kes?: number | null;
  promo_label?: string | null;
  promo_starts_at?: string | null;
  promo_ends_at?: string | null;
};

function lineFrom(value: string | null): ProductLine | null {
  return value && PRODUCT_LINES.includes(value as ProductLine) ? (value as ProductLine) : null;
}

export function ProductIndex({ catalogue, line }: { catalogue: ProductCard[]; line: ProductLine | null }) {
  const visible = line ? catalogue.filter((product) => matchesProductLine(product, line)) : catalogue;
  const copy = line ? LINE_COPY[line] : null;
  const story = line ? products.find((item) => item.href.endsWith(`type=${line}`)) : null;

  return (
    <>
      <PageHeader
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Products", href: copy ? "/products" : undefined },
          ...(copy ? [{ label: copy.title }] : []),
        ]}
        title={copy?.title ?? "Products"}
        intro={copy?.intro ?? "Browse the WordPress plugins, point-of-sale tools, and digital products we sell. Each one is built by the same team that delivers client work."}
      />
      <section className="bg-white py-16 lg:py-24">
        <Container>
      <div className="flex flex-wrap gap-2" role="navigation" aria-label="Product lines">
        {productMenu.map((item) => {
          const active = item.href === (line ? `/products?type=${line}` : "/products");
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex h-11 items-center rounded-[5px] border px-4 text-sm font-medium transition-colors duration-300",
                active
                  ? "border-brand-500 bg-brand-500 text-white"
                  : "border-line bg-white text-ink-900 hover:border-brand-300 hover:text-brand-600",
              )}
            >
              {item.title}
            </Link>
          );
        })}
      </div>

      {visible.length > 0 ? (
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="group flex flex-col border border-line p-6 transition-colors duration-300 hover:border-brand-300"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">{product.type}</p>
              <h2 className="mt-3 font-display text-xl font-semibold text-ink-900 group-hover:text-brand-600">{product.title}</h2>
              <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-body">{product.description}</p>
              <p className="mt-4 text-sm font-medium text-ink-900">
                {(() => {
                  const offer = currentOffer(product);
                  const due = chargeKes(product);
                  if (due <= 0) return "Talk to us";
                  return (
                    <>
                      {offer ? <span className="mr-2 font-normal text-muted line-through">{formatKes(offer.list)}</span> : null}
                      {formatKes(due)}
                    </>
                  );
                })()}
              </p>
              {chargeKes(product) > 0 ? <p className="mt-3 text-sm font-medium text-brand-600">Get it now</p> : null}
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {(story ? [story] : products).map((item) => (
            <article key={item.title} className="border border-line p-6">
              <item.icon className="h-6 w-6 text-brand-500" aria-hidden />
              <h2 className="mt-4 font-display text-lg font-semibold text-ink-900">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-body">{item.description}</p>
              <p className="mt-4 text-xs font-medium uppercase tracking-wide text-muted">{item.tags.join("  ·  ")}</p>
            </article>
          ))}
          <p className="md:col-span-3 max-w-xl text-[15px] leading-relaxed text-body">
            {line
              ? "Nothing in this line is on sale yet. Tell us what you need and we will scope it."
              : "The catalogue is empty until a product is published. Custom software still starts with a conversation."}{" "}
            <Link href="/contact" className="font-medium text-brand-600 hover:underline">
              Contact us
            </Link>
            .
          </p>
        </div>
      )}
        </Container>
      </section>
    </>
  );
}

export function ProductIndexFromUrl({ catalogue }: { catalogue: ProductCard[] }) {
  const line = lineFrom(useSearchParams().get("type"));
  return <ProductIndex catalogue={catalogue} line={line} />;
}

export function productLineCopy(line: ProductLine | null) {
  return line ? LINE_COPY[line] : null;
}
