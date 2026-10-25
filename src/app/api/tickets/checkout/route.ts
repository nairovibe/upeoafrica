import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { notifyBuyerReceipt, rateLimit } from "@/lib/notify";
import { verifyTurnstile } from "@/lib/turnstile";
import { startMpesaStk } from "@/lib/intasend";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(`ticket:${ip}`, 6, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many attempts." }, { status: 429 });
  }

  const body = (await request.json()) as {
    eventId?: string;
    ticketTypeId?: string;
    email?: string;
    phone?: string;
    name?: string;
    turnstileToken?: string;
  };
  if (!(await verifyTurnstile(body.turnstileToken, ip, "ticket"))) {
    return NextResponse.json({ error: "Could not verify this checkout." }, { status: 400 });
  }

  const email = body.email?.trim() ?? "";
  const phone = (body.phone ?? "").replace(/\s/g, "");
  const name = body.name?.trim() || null;
  if (!body.eventId || !body.ticketTypeId || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^254\d{9}$/.test(phone)) {
    return NextResponse.json(
      { error: "Name, email, and a Safaricom number in the form 2547XXXXXXXX are required." },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const db = (await createServiceClient()) ?? supabase;

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", body.eventId)
    .not("published_at", "is", null)
    .maybeSingle();
  if (!event) return NextResponse.json({ error: "Event not found." }, { status: 404 });

  const { data: ticket } = await supabase
    .from("ticket_types")
    .select("*")
    .eq("id", body.ticketTypeId)
    .eq("event_id", event.id)
    .maybeSingle();
  if (!ticket) return NextResponse.json({ error: "Ticket type not found." }, { status: 404 });

  const { count: held } = await db
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("ticket_type_id", ticket.id)
    .in("status", ["pending", "paid"]);
  if (ticket.quota != null && (held ?? 0) >= ticket.quota) {
    return NextResponse.json({ error: "That ticket is sold out." }, { status: 409 });
  }

  const { count: eventHeld } = await db
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("event_id", event.id)
    .eq("kind", "ticket")
    .in("status", ["pending", "paid"]);
  if (event.capacity != null && (eventHeld ?? 0) >= event.capacity) {
    return NextResponse.json({ error: "This event is at capacity." }, { status: 409 });
  }

  const free = ticket.price_kes <= 0;
  const { data: order, error } = await db
    .from("orders")
    .insert({
      email,
      phone,
      amount_kes: ticket.price_kes,
      provider: "intasend",
      status: free ? "paid" : "pending",
      kind: "ticket",
      event_id: event.id,
      ticket_type_id: ticket.id,
      attendee_name: name,
    })
    .select("id")
    .single();
  if (error || !order) {
    return NextResponse.json({ error: "Could not start checkout." }, { status: 500 });
  }

  if (free) {
    await notifyBuyerReceipt({
      email,
      amount: 0,
      title: `${event.title} · ${ticket.name}`,
      orderId: order.id,
      kind: "ticket",
    }).catch(() => {});
    return NextResponse.json({
      ok: true,
      orderId: order.id,
      message: "You are on the list. We emailed a confirmation.",
    });
  }

  const stk = await startMpesaStk({
    amount: ticket.price_kes,
    phone,
    email,
    apiRef: order.id,
    narrative: `${event.title} · ${ticket.name}`,
  });

  if (stk.pending) {
    return NextResponse.json({
      ok: true,
      orderId: order.id,
      pending: true,
      message: stk.message,
    });
  }

  if (!stk.ok) {
    await db.from("orders").update({ status: "failed" }).eq("id", order.id);
    return NextResponse.json({ error: stk.message }, { status: 502 });
  }

  if (stk.providerRef) {
    await db.from("orders").update({ provider_ref: stk.providerRef }).eq("id", order.id);
  }

  await db.from("payments").insert({
    order_id: order.id,
    provider: "intasend",
    result: "stk_initiated",
    payload: "payload" in stk ? stk.payload : {},
  });

  return NextResponse.json({ ok: true, orderId: order.id });
}
