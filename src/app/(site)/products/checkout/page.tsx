import type { Metadata } from "next";
import { CheckoutWizard } from "@/components/products/CheckoutWizard";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ pay?: string; order?: string }>;
}) {
  const params = await searchParams;
  return <CheckoutWizard notice={params.pay ?? null} watching={params.order ?? null} />;
}
