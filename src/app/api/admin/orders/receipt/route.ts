import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStaff } from "@/lib/cms";
import { notifyBuyerReceipt } from "@/lib/notify";
import { company } from "@/lib/content";

export async function POST(request: Request) {
  const staff = await getStaff();
  if (!staff) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { orderId } = (await request.json()) as { orderId?: string };
  if (!orderId) return NextResponse.json({ error: "Missing order." }, { status: 400 });

  const supabase = await createClient();
  const { data: order } = await supabase.from("orders").select("*").eq("id", orderId).maybeSingle();
  if (!order) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if (order.status !== "paid") {
    return NextResponse.json({ error: "Receipts go out after the payment is confirmed." }, { status: 400 });
  }

  let title = "Purchase";
  if (order.product_id) {
    const { data: product } = await supabase.from("products").select("title").eq("id", order.product_id).maybeSingle();
    title = product?.title || title;
  } else if (order.event_id) {
    const { data: event } = await supabase.from("events").select("title").eq("id", order.event_id).maybeSingle();
    title = event?.title || "Event ticket";
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL || company.domain;
  await notifyBuyerReceipt({
    email: order.email,
    amount: Number(order.amount_kes),
    title,
    orderId: order.id,
    downloadUrl: order.kind === "product" ? `${origin}/api/download/${order.id}` : undefined,
    kind: order.kind,
  });

  return NextResponse.json({ ok: true });
}
