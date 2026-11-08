import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/site/PageHeader";
import { Container } from "@/components/ui/Container";
import { CTA } from "@/components/sections/CTA";
import { ArticleCopy } from "@/components/site/ArticleCopy";
import { CheckoutForm } from "@/components/site/CheckoutForm";
import { ProductBuy } from "@/components/products/ProductBuy";
import { stripTags } from "@/components/blog/analysis";
import { getProductBySlug, getPublishedProducts } from "@/lib/cms";
import { formatKes } from "@/lib/constants";
import { chargeKes, currentOffer } from "@/lib/offer";
import { parseTiers, tiersFrom } from "@/lib/tiers";

export const revalidate = 43200;

export async function generateStaticParams() {
  const products = await getPublishedProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = await getProductBySlug(slug);
  if (!item) return { title: "Products" };
  return { title: item.title, description: stripTags(item.description).slice(0, 160) };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getProductBySlug(slug);
  if (!item) notFound();
  const tiers = parseTiers(item.price_tiers);
  const from = tiersFrom(tiers);
  const offer = tiers.length ? null : currentOffer(item);
  const due = from ?? chargeKes(item);
  const intro = stripTags(item.description);

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Products", href: "/products" }, { label: item.title }]}
        title={item.title}
        intro={intro ? intro.slice(0, 220) : undefined}
      />
      <section className="bg-white py-24 lg:py-32">
        <Container>
          <div className={tiers.length ? "grid gap-14 lg:grid-cols-[minmax(0,1fr)_420px]" : "grid gap-14 lg:grid-cols-[minmax(0,1fr)_340px]"}>
            <div>
              {item.version && <p className="text-sm text-muted">Version {item.version}</p>}
              <div className={item.version ? "mt-8" : undefined}>
                <ArticleCopy text={item.description} />
              </div>
              {item.changelog ? (
                <div className="mt-12">
                  <h2 className="font-display text-xl font-semibold text-ink-900">Changelog</h2>
                  <div className="mt-4">
                    <ArticleCopy text={item.changelog} />
                  </div>
                </div>
              ) : null}
            </div>
            <aside className="border border-line p-6">
              {tiers.length ? (
                <ProductBuy productId={item.id} tiers={tiers} />
              ) : (
              <>
              <p className="font-display text-2xl font-semibold text-ink-900">
                {due > 0 ? formatKes(due) : "On request"}
              </p>
              {offer ? (
                <p className="mt-1 text-sm text-muted">
                  <span className="line-through">{formatKes(offer.list)}</span>
                  <span className="ml-2 font-medium text-brand-600">{offer.label}</span>
                </p>
              ) : null}
              <p className="mt-2 text-sm text-body">
                {due > 0 ? "Get it now with M-Pesa. The file link is emailed after confirmation." : "Tell us what you need and we will scope it."}
              </p>
              {due > 0 ? (
                <div className="mt-6">
                  <CheckoutForm productId={item.id} />
                </div>
              ) : null}
              </>
              )}
            </aside>
          </div>
        </Container>
      </section>
      <CTA />
    </>
  );
}
