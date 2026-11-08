"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, LayoutGrid, List, Search } from "lucide-react";
import { PageHeader } from "@/components/site/PageHeader";
import { Container } from "@/components/ui/Container";
import { buyButtonClass, CartButton, useCart, type CartItem } from "@/components/products/cart";
import { productBlurb } from "@/components/products/blurb";
import { MoneyFigure } from "@/components/products/MoneyFigure";
import { formatMoney, priceCurrency, publicMediaUrl } from "@/lib/constants";
import { chargeKes, currentOffer } from "@/lib/offer";
import { parseTiers, tierDue, tiersFrom } from "@/lib/tiers";
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
  cover_path?: string | null;
  price_kes: number;
  promo_price_kes?: number | null;
  promo_label?: string | null;
  promo_starts_at?: string | null;
  promo_ends_at?: string | null;
  price_tiers?: unknown;
  currency?: string | null;
};

function lineFrom(value: string | null): ProductLine | null {
  return value && PRODUCT_LINES.includes(value as ProductLine) ? (value as ProductLine) : null;
}

function cartLine(product: ProductCard): CartItem | null {
  const tiers = parseTiers(product.price_tiers);
  const tier = tiers.find((row) => row.popular && tierDue(row) > 0) ?? tiers.find((row) => tierDue(row) > 0) ?? null;
  const amount = tier ? tierDue(tier) : chargeKes(product);
  if (amount <= 0) return null;
  return {
    productId: product.id,
    slug: product.slug,
    title: product.title,
    tierId: tier?.id ?? null,
    tierName: tier?.name || null,
    currency: priceCurrency(product.currency),
    amount,
    cover: publicMediaUrl(product.cover_path),
  };
}

export function ProductIndex({
  catalogue,
  line,
  cancelled = false,
}: {
  catalogue: ProductCard[];
  line: ProductLine | null;
  cancelled?: boolean;
}) {
  const { add } = useCart();
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const copy = line ? LINE_COPY[line] : null;
  const story = line ? products.find((item) => item.href.endsWith(`type=${line}`)) : null;
  const needle = query.trim().toLowerCase();
  const inLine = line ? catalogue.filter((product) => matchesProductLine(product, line)) : catalogue;
  const visible = needle
    ? inLine.filter((product) => {
        const blurb = productBlurb(product.title, product.description).toLowerCase();
        return (
          product.title.toLowerCase().includes(needle) ||
          product.type.toLowerCase().includes(needle) ||
          blurb.includes(needle)
        );
      })
    : inLine;

  function take(product: ProductCard) {
    const lineItem = cartLine(product);
    if (lineItem) add(lineItem);
  }

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
          {cancelled ? (
            <p className="mb-6 border border-line bg-surface-2 px-4 py-3 text-sm text-body">Payment was not completed. You can try again from the product.</p>
          ) : null}
          <div className="flex flex-col gap-4 border-b border-line lg:flex-row lg:items-end lg:justify-between">
            <nav aria-label="Product lines" className="-mb-px flex gap-6 overflow-x-auto">
              {productMenu.map((item) => {
                const active = item.href === (line ? `/products?type=${line}` : "/products");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "inline-flex h-11 shrink-0 items-center border-b-2 text-sm font-medium transition-colors duration-200",
                      active ? "border-brand-500 text-ink-900" : "border-transparent text-muted hover:text-ink-900",
                    )}
                  >
                    {item.title}
                  </Link>
                );
              })}
            </nav>
            <div className="flex flex-wrap items-center justify-end gap-2 pb-3">
              <form role="search" className="flex" onSubmit={(event) => event.preventDefault()}>
                <label htmlFor="product-search" className="sr-only">
                  Search products
                </label>
                <input
                  id="product-search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search products"
                  className="h-11 w-40 border border-line border-r-0 bg-white px-3 text-sm text-ink-900 outline-none focus:border-brand-500 sm:w-56"
                />
                <button type="submit" className={buyButtonClass()}>
                  <Search className="h-4 w-4" aria-hidden />
                  Search
                </button>
              </form>
              <CartButton />
              <div className="flex border border-line" role="group" aria-label="Catalogue layout">
                <button
                  type="button"
                  aria-pressed={view === "grid"}
                  aria-label="Grid view"
                  onClick={() => setView("grid")}
                  className={cn(
                    "inline-flex h-11 w-11 cursor-pointer items-center justify-center transition-colors duration-200",
                    view === "grid" ? "bg-brand-500 text-white" : "bg-white text-ink-900 hover:text-brand-600",
                  )}
                >
                  <LayoutGrid className="h-4 w-4" aria-hidden />
                </button>
                <button
                  type="button"
                  aria-pressed={view === "list"}
                  aria-label="List view"
                  onClick={() => setView("list")}
                  className={cn(
                    "inline-flex h-11 w-11 cursor-pointer items-center justify-center border-l border-line transition-colors duration-200",
                    view === "list" ? "bg-brand-500 text-white" : "bg-white text-ink-900 hover:text-brand-600",
                  )}
                >
                  <List className="h-4 w-4" aria-hidden />
                </button>
              </div>
            </div>
          </div>

          {visible.length > 0 ? (
            <div className={cn("mt-10", view === "grid" ? "grid gap-8 sm:grid-cols-2 lg:grid-cols-3" : "flex flex-col gap-4")}>
              {visible.map((product) => (
                <CatalogueItem key={product.id} product={product} view={view} onBuy={() => take(product)} />
              ))}
            </div>
          ) : inLine.length > 0 ? (
            <p className="mt-10 text-[15px] leading-relaxed text-body">No products match “{query.trim()}”.</p>
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
              <p className="max-w-xl text-[15px] leading-relaxed text-body md:col-span-3">
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

function CatalogueItem({ product, view, onBuy }: { product: ProductCard; view: "grid" | "list"; onBuy: () => void }) {
  const cover = publicMediaUrl(product.cover_path);
  const blurb = productBlurb(product.title, product.description);
  const priced = cartLine(product) != null;
  const href = `/products/${product.slug}`;

  if (view === "list") {
    return (
      <article className="flex flex-col border border-line bg-white transition-colors duration-200 hover:border-brand-300 sm:flex-row sm:items-stretch">
        <Link href={href} className="flex min-w-0 flex-1 flex-col sm:flex-row">
          <div className="h-28 w-full shrink-0 overflow-hidden border-b border-line bg-surface-2 sm:w-44 sm:border-r sm:border-b-0">
            {cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cover} alt="" className="h-full w-full object-contain" />
            ) : null}
          </div>
          <div className="flex flex-1 flex-col p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">{product.type}</p>
            <h2 className="mt-2 font-display text-xl font-semibold text-ink-900">{product.title}</h2>
            {blurb ? <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-body">{blurb}</p> : null}
          </div>
        </Link>
        <div className="flex items-center justify-between gap-4 border-t border-line p-5 sm:w-64 sm:shrink-0 sm:flex-col sm:items-stretch sm:justify-center sm:border-t-0 sm:border-l">
          <p className="font-display text-lg font-semibold text-ink-900">
            <ProductPrice product={product} />
          </p>
          {priced ? <BuyButton href="/products/checkout" onClick={onBuy} /> : null}
        </div>
      </article>
    );
  }

  return (
    <article className="flex h-full flex-col border border-line bg-white transition-colors duration-200 hover:border-brand-300">
      <Link href={href} className="flex flex-1 flex-col">
        <div className="aspect-[3/2] overflow-hidden border-b border-line bg-surface-2">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover} alt="" className="h-full w-full object-contain" />
          ) : null}
        </div>
        <div className="flex flex-1 flex-col p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">{product.type}</p>
          <h2 className="mt-2 font-display text-xl font-semibold text-ink-900">{product.title}</h2>
          {blurb ? <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-body">{blurb}</p> : <span className="flex-1" />}
        </div>
      </Link>
      <div className="flex items-center justify-between gap-3 border-t border-line p-5">
        <p className="font-display text-lg font-semibold text-ink-900">
          <ProductPrice product={product} />
        </p>
        {priced ? <BuyButton href="/products/checkout" onClick={onBuy} /> : null}
      </div>
    </article>
  );
}

function BuyButton({ href, onClick }: { href: string; onClick: () => void }) {
  return (
    <Link href={href} onClick={onClick} className={buyButtonClass()}>
      Get it now
      <ArrowRight className="h-4 w-4" aria-hidden />
    </Link>
  );
}

function ProductPrice({ product }: { product: ProductCard }) {
  const tiers = parseTiers(product.price_tiers);
  const from = tiersFrom(tiers);
  const due = from ?? chargeKes(product);
  const offer = tiers.length ? null : currentOffer(product);
  if (due <= 0) return "Talk to us";
  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-2">
      {offer ? <span className="text-sm font-normal text-muted line-through">{formatMoney(offer.list, product.currency)}</span> : null}
      <MoneyFigure amount={due} currency={product.currency} from={tiers.length > 1} />
    </span>
  );
}

export function ProductIndexFromUrl({ catalogue }: { catalogue: ProductCard[] }) {
  const params = useSearchParams();
  const line = lineFrom(params.get("type"));
  return <ProductIndex catalogue={catalogue} line={line} cancelled={params.get("pay") === "cancelled"} />;
}

export function productLineCopy(line: ProductLine | null) {
  return line ? LINE_COPY[line] : null;
}
