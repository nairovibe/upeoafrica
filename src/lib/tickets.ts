import { Resend } from "resend";
import { company } from "@/lib/content";
import { brandedEmailHtml, RESEND_FROM } from "@/lib/email";
import { logOutboundEmail, pushDeskEvent } from "@/lib/notify";
import { formatEventWhen, modeLabel } from "@/components/events/utils";

const RPC_ERRORS: Record<string, { message: string; status: number }> = {
  event_not_found: { message: "This event is no longer available.", status: 404 },
  event_over: { message: "This event has already taken place.", status: 409 },
  registration_closed: { message: "Registration for this event has closed.", status: 409 },
  ticket_not_found: { message: "That ticket is no longer available.", status: 404 },
  sales_not_open: { message: "Sales for this ticket have not opened yet.", status: 409 },
  sales_closed: { message: "Sales for this ticket have closed.", status: 409 },
  too_many: { message: "That is more tickets than one order allows.", status: 400 },
  sold_out: { message: "Not enough tickets left of this type. Try a smaller quantity.", status: 409 },
  at_capacity: { message: "The event is full. Try a smaller quantity.", status: 409 },
};

export function ticketRpcError(raw: string | undefined) {
  const key = Object.keys(RPC_ERRORS).find((k) => raw?.includes(k));
  return key ? RPC_ERRORS[key] : { message: "Could not reserve your ticket. Try again.", status: 500 };
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

export async function sendTicketEmail(opts: {
  to: string;
  name: string | null;
  code: string;
  orderId: string;
  quantity: number;
  amount: number;
  ticketName: string | null;
  event: {
    id: string;
    title: string;
    slug: string;
    starts_at: string;
    ends_at: string | null;
    venue: string | null;
    mode: string;
  };
}) {
  const { event } = opts;
  const first = opts.name?.split(" ")[0] || "there";
  const place = event.venue ? `${modeLabel(event.mode)}, ${event.venue}` : modeLabel(event.mode);
  const seats = `${opts.quantity} ${opts.quantity === 1 ? "ticket" : "tickets"}${opts.ticketName ? ` (${opts.ticketName})` : ""}`;
  const paid = opts.amount > 0 ? `<br />Paid: KES ${opts.amount.toLocaleString("en-KE")}` : "";
  const subject = `Your ticket: ${event.title}`;
  const body = [
    `Hello ${escapeHtml(first)}, you are booked for <strong>${escapeHtml(event.title)}</strong>.`,
    "",
    `Ticket code: <strong style="letter-spacing:0.12em">${opts.code}</strong>`,
    `When: ${formatEventWhen(event.starts_at, event.ends_at)}`,
    `Where: ${escapeHtml(place)}`,
    `${seats}${paid}`,
    "",
    "Show this code at the door. Keep this email on your phone.",
  ].join("<br />");

  const key = process.env.RESEND_API_KEY;
  let resendId: string | null = null;
  if (key) {
    const resend = new Resend(key);
    const result = await resend.emails.send({
      from: RESEND_FROM,
      to: opts.to,
      replyTo: company.email,
      subject,
      text: body.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, ""),
      html: brandedEmailHtml({
        preview: `Ticket ${opts.code} · ${event.title}`,
        heading: "Your ticket is confirmed.",
        body,
        buttonLabel: "Add to calendar",
        buttonUrl: `${company.domain}/api/events/${event.slug}/ics`,
        sentTo: opts.to,
      }),
    });
    resendId = result.data?.id ?? null;
  }

  await logOutboundEmail({
    to: opts.to,
    template: "ticket",
    subject,
    orderId: opts.orderId,
    resendId,
  }).catch(() => {});
  await pushDeskEvent({
    type: "order",
    title: `Ticket: ${event.title}`,
    body: `${opts.name || opts.to} · ${seats}`,
    href: `/console/events/${event.id}/attendees`,
  }).catch(() => {});
  return resendId;
}
