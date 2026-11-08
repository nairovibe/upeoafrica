import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { CTA } from "@/components/sections/CTA";
import { ProductTools } from "@/components/products/cart";
import { ProductBuy } from "@/components/products/ProductBuy";
import { ProductGallery } from "@/components/products/ProductGallery";
import { ProductTabs } from "@/components/products/ProductTabs";
import { productBlurb } from "@/components/products/blurb";
import { stripTags } from "@/components/blog/analysis";
import { getProductBySlug, getPublishedProducts } from "@/lib/cms";
import { publicMediaUrl, priceCurrency } from "@/lib/constants";
import { MoneyFigure } from "@/components/products/MoneyFigure";
import { renderArticleBody } from "@/lib/blog";
import { chargeKes, currentOffer } from "@/lib/offer";
import { parseTiers, tierDue, tiersFrom } from "@/lib/tiers";

const TYPE_LABELS: Record<string, string> = { plugin: "Plugin", download: "Download", saas: "SaaS" };

export const revalidate = 43200;

export async function generateStaticParams() {
  const products = await getPublishedProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = await getProductBySlug(slug);
  if (!item) return { title: "Products" };
  const image = publicMediaUrl(item.cover_path);
  return {
    title: item.title,
    description: stripTags(item.description).slice(0, 160),
    openGraph: image ? { images: [image] } : undefined,
  };
}

function pictures(cover: string | null, gallery: string[]) {
  const paths = [...new Set([cover, ...gallery].filter((path): path is string => Boolean(path)))];
  return paths.map((path) => publicMediaUrl(path)).filter((url): url is string => Boolean(url));
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await getProductBySlug(slug);
  if (!item) notFound();
  const tiers = parseTiers(item.price_tiers);
  const from = tiersFrom(tiers);
  const offer = tiers.length ? null : currentOffer(item);
  const due = from ?? chargeKes(item);
  const images = pictures(item.cover_path, item.gallery ?? []);
  const summary = productBlurb(item.title, item.description, 220);
  const info = renderArticleBody(item.description);
  const notes = renderArticleBody(item.changelog ?? "");

  return (
    <>
      <section className="bg-white pt-36 pb-20 md:pt-44">
        <Container>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <nav aria-label="Breadcrumb">
              <ol className="flex flex-wrap items-center gap-x-2 text-xs font-medium uppercase tracking-[0.14em] text-muted">
                <li>
                  <Link href="/" className="hover:text-brand-600">Home</Link>
                </li>
                <li aria-hidden>/</li>
                <li>
                  <Link href="/products" className="hover:text-brand-600">Products</Link>
                </li>
                <li aria-hidden>/</li>
                <li className="text-ink-900">{item.title}</li>
              </ol>
            </nav>
            <div className="ml-auto">
              <ProductTools title={item.title} productId={item.id} />
            </div>
          </div>

          <div className="mt-8 grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
            <ProductGallery images={images} title={item.title} />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">{TYPE_LABELS[item.type] ?? item.type}</p>
              <h1 className="mt-3 font-display text-4xl font-semibold text-ink-900">{item.title}</h1>
              {item.version ? <p className="mt-2 text-sm text-muted">Version {item.version}</p> : null}
              {summary ? <p className="mt-4 max-w-xl text-base leading-relaxed text-body">{summary}</p> : null}
              <p className="mt-6">
                {due > 0 ? (
                  <MoneyFigure amount={due} currency={item.currency} from={tiers.length > 1} size="lg" />
                ) : tiers.some((tier) => tierDue(tier) > 0) ? (
                  <MoneyFigure amount={Math.min(...tiers.map((tier) => tierDue(tier)).filter((amount) => amount > 0))} currency={item.currency} from size="lg" />
                ) : (
                  <span className="font-display text-3xl font-semibold text-ink-900">Free</span>
                )}
              </p>
            </div>
          </div>

          <div className="mt-12">
            <ProductBuy
              productId={item.id}
              slug={item.slug}
              title={item.title}
              type={item.type}
              tiers={tiers}
              currency={priceCurrency(item.currency)}
              price={due}
              listPrice={offer?.list}
              offerLabel={offer?.label}
              cover={images[0] ?? null}
            />
          </div>

          <ProductTabs infoHtml={info.html} changelogHtml={notes.html} screenshots={images} title={item.title} />
        </Container>
      </section>
      <CTA />
    </>
  );
}
