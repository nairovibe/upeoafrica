import type { Metadata } from "next";
import { Suspense } from "react";
import { CTA } from "@/components/sections/CTA";
import { ProductIndex, ProductIndexFromUrl } from "@/components/products/ProductIndex";
import { getPublishedProducts } from "@/lib/cms";

const intro =
  "Browse the WordPress plugins, point-of-sale tools, and digital products we sell. Each one is built by the same team that delivers client work.";

export const metadata: Metadata = {
  title: "Products",
  description: intro,
};

export default async function ProductsPage() {
  const catalogue = await getPublishedProducts();

  return (
    <>
      <Suspense fallback={<ProductIndex catalogue={catalogue} line={null} />}>
        <ProductIndexFromUrl catalogue={catalogue} />
      </Suspense>
      <CTA />
    </>
  );
}
