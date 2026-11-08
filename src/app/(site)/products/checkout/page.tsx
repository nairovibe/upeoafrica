import type { Metadata } from "next";
import { CheckoutWizard } from "@/components/products/CheckoutWizard";
import { billingCards } from "@/lib/billing";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ pay?: string; order?: string }>;
}) {
  const [params, cards] = await Promise.all([searchParams, billingCards()]);
  const ready = (id: "paypal" | "mpesa" | "card") => {
    const card = cards.find((item) => item.id === id);
    return Boolean(card?.enabled && card.configured);
  };
  return (
    <CheckoutWizard
      notice={params.pay ?? null}
      watching={params.order ?? null}
      methods={{ paypal: ready("paypal"), mpesa: ready("mpesa"), card: ready("card") }}
    />
  );
}
