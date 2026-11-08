import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/notify";
import { verifyTurnstile } from "@/lib/turnstile";
import { startMpesaStk } from "@/lib/intasend";
import { sendTicketEmail, ticketRpcError } from "@/lib/tickets";
import { normaliseKePhone } from "@/components/events/utils";
import { chargeKes } from "@/lib/offer";
import { priceCurrency } from "@/lib/constants";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(`ticket:${ip}`, 6, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many attempts. Wait a few minutes and try again." }, { status: 429 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    eventId?: string;
    ticketTypeId?: string;
    quantity?: number;
    email?: string;
    phone?: string;
    name?: string;
    company?: string;
    turnstileToken?: string;
  };
  if (!(await verifyTurnstile(body.turnstileToken, ip, "ticket"))) {
    return NextResponse.json({ error: "Could not verify this checkout. Refresh the check and try again." }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase() ?? "";
  const name = body.name?.trim() ?? "";
  const companyName = body.company?.trim().slice(0, 120) || undefined;
  const quantity = Math.floor(Number(body.quantity) || 1);
  const phone = body.phone?.trim() ? normaliseKePhone(body.phone) : null;

  if (!body.eventId || !UUID.test(body.eventId) || !body.ticketTypeId || !UUID.test(body.ticketTypeId)) {
    return NextResponse.json({ error: "Choose a ticket." }, { status: 400 });
  }
  if (!name || name.length > 120) {
    return NextResponse.json({ error: "Enter the attendee name." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (body.phone?.trim() && !phone) {
    return NextResponse.json({ error: "Enter a Safaricom number like 0712 345 678." }, { status: 400 });
  }
  if (quantity < 1 || quantity > 50) {
    return NextResponse.json({ error: "Choose a quantity." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: ticket } = await supabase
    .from("ticket_types")
    .select("name, price_kes, promo_price_kes, promo_label, promo_starts_at, promo_ends_at")
    .eq("id", body.ticketTypeId)
    .maybeSingle();
  if (ticket && chargeKes(ticket) > 0 && !phone) {
    return NextResponse.json({ error: "Enter the M-Pesa number that will pay." }, { status: 400 });
  }

  const { data: pricedEvent } = await supabase.from("events").select("currency").eq("id", body.eventId).maybeSingle();
  if (ticket && chargeKes(ticket) > 0 && priceCurrency(pricedEvent?.currency) === "USD") {
    return NextResponse.json(
      { error: "This event is priced in US dollars. M-Pesa pays Kenyan shilling tickets." },
      { status: 400 },
    );
  }

  const { data: rows, error } = await supabase.rpc("create_ticket_order", {
    p_event_id: body.eventId,
    p_ticket_type_id: body.ticketTypeId,
    p_quantity: quantity,
    p_email: email,
    p_phone: phone ?? "",
    p_name: name,
    p_company: companyName,
  });
  const order = rows?.[0];
  if (error || !order) {
    const mapped = ticketRpcError(error?.message);
    return NextResponse.json({ error: mapped.message }, { status: mapped.status });
  }

  const { data: event } = await supabase
    .from("events")
    .select("id, title, slug, starts_at, ends_at, venue, mode")
    .eq("id", body.eventId)
    .maybeSingle();
  const eventTitle = event?.title ?? "Event ticket";

  if (order.order_status === "paid") {
    if (event) {
      await sendTicketEmail({
        to: email,
        name,
        code: order.ticket_code,
        orderId: order.order_id,
        quantity,
        amount: 0,
        ticketName: ticket?.name ?? null,
        event,
      }).catch(() => {});
    }
    return NextResponse.json({
      ok: true,
      status: "paid",
      orderId: order.order_id,
      code: order.ticket_code,
      quantity,
      eventTitle,
    });
  }

  const service = await createServiceClient();
  const stk = await startMpesaStk({
    amount: order.amount_kes,
    phone: phone!,
    email,
    apiRef: order.order_id,
    narrative: `${eventTitle}${ticket ? ` · ${ticket.name}` : ""} x${quantity}`.slice(0, 100),
  });

  if (!stk.ok) {
    if (service) {
      await service.from("orders").update({ status: "failed" }).eq("id", order.order_id);
      await service.from("payments").insert({
        order_id: order.order_id,
        provider: "intasend",
        result: stk.pending ? "not_configured" : "stk_failed",
        payload: "payload" in stk ? stk.payload : {},
      });
    }
    return NextResponse.json(
      {
        error: stk.pending
          ? "M-Pesa payments are not switched on yet. Write to us and we will hold a seat for you."
          : `${stk.message} Check the number and try again.`,
      },
      { status: stk.pending ? 503 : 502 },
    );
  }

  if (service) {
    if (stk.providerRef) {
      await service.from("orders").update({ provider_ref: stk.providerRef }).eq("id", order.order_id);
    }
    await service.from("payments").insert({
      order_id: order.order_id,
      provider: "intasend",
      result: "stk_initiated",
      payload: stk.payload,
    });
  }

  return NextResponse.json({
    ok: true,
    status: "pending",
    orderId: order.order_id,
    amount: order.amount_kes,
    quantity,
    eventTitle,
  });
}
