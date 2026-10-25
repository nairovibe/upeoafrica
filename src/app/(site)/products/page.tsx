import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/site/PageHeader";
import { Container } from "@/components/ui/Container";
import { CTA } from "@/components/sections/CTA";
import { getPublishedProducts } from "@/lib/cms";
import { formatKes } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Browse the WordPress plugins, point-of-sale tools, and digital products we sell. Each one is built by the same team that delivers client work.",
};

export default async function ProductsPage() {
  const products = await getPublishedProducts();
  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Products" }]}
        title="Products"
        intro="Browse the WordPress plugins, point-of-sale tools, and digital products we sell. Each one is built by the same team that delivers client work."
      />
      <section className="bg-white py-24 lg:py-32">
        <Container>
          {products.length === 0 ? (
            <p className="max-w-xl text-[15px] leading-relaxed text-body">
              Catalogue is empty until a product is published from the studio. Custom software still starts on{" "}
              <Link href="/contact" className="font-medium text-brand-600 hover:underline">
                contact
              </Link>
              .
            </p>
          ) : (
            <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => (
                <Link key={p.id} href={`/products/${p.slug}`} className="group block border border-line p-6 hover:border-brand-300">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">{p.type}</p>
                  <h2 className="mt-3 font-display text-xl font-semibold text-ink-900 group-hover:text-brand-600">{p.title}</h2>
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-body">{p.description}</p>
                  <p className="mt-4 text-sm font-medium text-ink-900">
                    {p.price_kes > 0 ? formatKes(p.price_kes) : "Talk to us"}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </Container>
      </section>
      <CTA />
    </>
  );
}
