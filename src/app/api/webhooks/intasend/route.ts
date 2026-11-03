import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { notifyBuyerReceipt, pushDeskEvent } from "@/lib/notify";
import { company } from "@/lib/content";
import { sendTicketEmail } from "@/lib/tickets";

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as {
    api_ref?: string;
    invoice_id?: string;
    challenge?: string;
    state?: string;
  } | null;
  if (!payload) return NextResponse.json({ error: "Invalid payload." }, { status: 400 });

  const secret = process.env.INTASEND_WEBHOOK_SECRET;
  if (secret) {
    const header = request.headers.get("x-intasend-signature") || request.headers.get("authorization") || "";
    if (payload.challenge !== secret && !header.includes(secret)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const service = await createServiceClient();
  if (!service) return NextResponse.json({ error: "Service role not configured." }, { status: 503 });

  const ref = payload.api_ref;
  if (!ref) return NextResponse.json({ ok: true });

  const paid = ["COMPLETE", "COMPLETED", "PAID", "SUCCESS"].includes((payload.state || "").toUpperCase());
  const failed = ["FAILED", "CANCELLED"].includes((payload.state || "").toUpperCase());

  const { data: order } = await service.from("orders").select("*").eq("id", ref).maybeSingle();
  const { data: invoice } = order
    ? { data: null }
    : await service.from("invoices").select("*").eq("id", ref).maybeSingle();

  if (order && order.kind === "ticket") {
    if (paid && order.status !== "paid") {
      await service
        .from("orders")
        .update({ status: "paid", provider_ref: payload.invoice_id || order.provider_ref })
        .eq("id", order.id);
      const [{ data: event }, { data: ticket }] = await Promise.all([
        order.event_id
          ? service.from("events").select("id, title, slug, starts_at, ends_at, venue, mode").eq("id", order.event_id).maybeSingle()
          : Promise.resolve({ data: null }),
        order.ticket_type_id
          ? service.from("ticket_types").select("name").eq("id", order.ticket_type_id).maybeSingle()
          : Promise.resolve({ data: null }),
      ]);
      if (event && order.ticket_code) {
        await sendTicketEmail({
          to: order.email,
          name: order.attendee_name,
          code: order.ticket_code,
          orderId: order.id,
          quantity: order.quantity,
          amount: Number(order.amount_kes),
          ticketName: ticket?.name ?? null,
          event,
        }).catch(() => {});
      }
    } else if (failed && order.status === "pending") {
      await service.from("orders").update({ status: "failed" }).eq("id", order.id);
      await pushDeskEvent({
        type: "payment",
        title: "M-Pesa failed",
        body: order.email,
        href: order.event_id ? `/console/events/${order.event_id}/attendees` : "/console/orders",
      }).catch(() => {});
    }
    await service.from("payments").insert({
      order_id: order.id,
      provider: "intasend",
      result: payload.state || null,
      payload,
    });
  } else if (order) {
    if (paid) {
      const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      await service
        .from("orders")
        .update({
          status: "paid",
          provider_ref: payload.invoice_id || order.provider_ref,
          download_expires_at: expires,
        })
        .eq("id", order.id);

      let title = "Purchase";
      if (order.product_id) {
        const { data: product } = await service.from("products").select("title").eq("id", order.product_id).maybeSingle();
        title = product?.title || title;
      } else if (order.event_id) {
        const { data: event } = await service.from("events").select("title").eq("id", order.event_id).maybeSingle();
        title = event?.title || "Event ticket";
      }
      const origin = company.domain;
      await notifyBuyerReceipt({
        email: order.email,
        amount: Number(order.amount_kes),
        title,
        orderId: order.id,
        downloadUrl: order.kind === "product" ? `${origin}/api/download/${order.id}` : undefined,
        kind: order.kind,
      }).catch(() => {});
    } else if (failed) {
      await service.from("orders").update({ status: "failed" }).eq("id", order.id);
      await pushDeskEvent({
        type: "payment",
        title: "M-Pesa failed",
        body: order.email,
        href: "/console/orders",
      }).catch(() => {});
    }
    await service.from("payments").insert({
      order_id: order.id,
      provider: "intasend",
      result: payload.state || null,
      payload,
    });
  } else if (invoice) {
    if (paid) {
      await service
        .from("invoices")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
          provider_ref: payload.invoice_id || invoice.provider_ref,
          amount_paid_kes: invoice.total_kes,
        })
        .eq("id", invoice.id);
      await notifyBuyerReceipt({
        email: invoice.bill_email,
        amount: Number(invoice.total_kes),
        title: invoice.number,
        invoiceId: invoice.id,
        kind: "invoice",
      }).catch(() => {});
    }
    await service.from("payments").insert({
      invoice_id: invoice.id,
      provider: "intasend",
      result: payload.state || null,
      payload,
    });
  }

  return NextResponse.json({ ok: true });
}
