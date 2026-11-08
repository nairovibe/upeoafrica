import { company } from "@/lib/content";
import { notifyBuyerReceipt, pushDeskEvent } from "@/lib/notify";
import { priceCurrency } from "@/lib/constants";
import { createServiceClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/database.types";

const WEEK = 7 * 24 * 60 * 60 * 1000;

/** Mark a product order paid and email the download link for this purchase. */
export async function fulfillProductOrder(opts: {
  orderId: string;
  providerRef: string;
  amount: number;
  currency: string;
  payload: Json;
  origin: string;
}) {
  const service = await createServiceClient();
  if (!service) return { ok: false as const, error: "Checkout is not configured yet." };

  const { data: order } = await service.from("orders").select("*").eq("id", opts.orderId).maybeSingle();
  if (!order || order.kind !== "product" || !order.product_id) {
    return { ok: false as const, error: "Order not found." };
  }
  if (priceCurrency(order.currency) !== priceCurrency(opts.currency)) {
    return { ok: false as const, error: "The payment currency does not match the order." };
  }
  if (Math.abs(opts.amount - Number(order.amount_kes)) > 0.01) {
    return { ok: false as const, error: "The payment amount does not match the order." };
  }

  const { data: product } = await service
    .from("products")
    .select("title, file_path")
    .eq("id", order.product_id)
    .maybeSingle();
  const title = order.tier_label ? `${product?.title || "Purchase"} · ${order.tier_label}` : product?.title || "Purchase";

  if (order.status !== "paid") {
    const expires = new Date(Date.now() + WEEK).toISOString();
    const { error } = await service
      .from("orders")
      .update({
        status: "paid",
        provider_ref: opts.providerRef || order.provider_ref,
        download_expires_at: expires,
      })
      .eq("id", order.id);
    if (error) return { ok: false as const, error: "Could not record the payment." };
    await service.from("payments").insert({
      order_id: order.id,
      provider: "paypal",
      result: "COMPLETED",
      payload: opts.payload,
    });
    const downloadUrl = product?.file_path ? `${opts.origin}/api/download/${order.id}` : undefined;
    await notifyBuyerReceipt({
      email: order.email,
      name: order.attendee_name || undefined,
      amount: Number(order.amount_kes),
      currency: order.currency,
      title,
      orderId: order.id,
      downloadUrl,
      kind: "product",
    }).catch(() => {});
    if (!downloadUrl) {
      await pushDeskEvent({
        type: "order",
        title: `Paid, file missing: ${title}`,
        body: order.email,
        href: "/console/orders",
      }).catch(() => {});
    }
  }

  return { ok: true as const };
}
