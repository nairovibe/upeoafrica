import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/notify";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(`ticket-status:${ip}`, 120, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many checks." }, { status: 429 });
  }
  const orderId = request.nextUrl.searchParams.get("order") ?? "";
  if (!UUID.test(orderId)) {
    return NextResponse.json({ error: "Unknown order." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("ticket_order_status", { p_order_id: orderId });
  const row = data?.[0];
  if (error || !row) {
    return NextResponse.json({ error: "Unknown order." }, { status: 404 });
  }
  return NextResponse.json(
    {
      status: row.order_status,
      code: row.ticket_code ?? null,
      eventTitle: row.event_title,
      quantity: row.quantity,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
