import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/notify";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Status only. The buyer already holds the order id from checkout. Email is not returned. */
export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(`checkout-status:${ip}`, 120, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many checks." }, { status: 429 });
  }
  const orderId = request.nextUrl.searchParams.get("order") ?? "";
  if (!UUID.test(orderId)) return NextResponse.json({ error: "Unknown order." }, { status: 400 });

  const supabase = await createServiceClient();
  if (!supabase) return NextResponse.json({ error: "Checkout is not configured yet." }, { status: 503 });

  const { data } = await supabase.from("orders").select("status, amount_kes, kind").eq("id", orderId).maybeSingle();
  if (!data || data.kind !== "product") return NextResponse.json({ error: "Unknown order." }, { status: 404 });

  return NextResponse.json(
    { status: data.status, amount: Number(data.amount_kes) },
    { headers: { "Cache-Control": "no-store" } },
  );
}
