"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { LottieSvg, type LottieHandle } from "lottie-react";
import { CalendarPlus } from "lucide-react";
import animation from "@/assets/lottie/thank-you.json";
import { readThanks, type ThanksKind, type TicketThanks } from "@/lib/thanks";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

export function ThankYouAnimation() {
  const reduce = useReducedMotion();
  const lottieRef = useRef<LottieHandle>(null);

  return (
    <LottieSvg
      src={animation}
      lottieRef={lottieRef}
      loop={false}
      autoplay={!reduce}
      subscriptions={reduce ? { ready: () => lottieRef.current?.seek({ percent: 1 }) } : undefined}
      aria-hidden
      className="mx-auto aspect-square h-auto w-full max-w-[220px]"
    />
  );
}

export function ThankYouMoment({
  kind,
  nonce,
  adsSendTo,
  gaId,
}: {
  kind: ThanksKind;
  nonce: string;
  adsSendTo: string;
  gaId: string;
}) {
  const [ticket, setTicket] = useState<TicketThanks | null>(null);

  useEffect(() => {
    const saved = readThanks(nonce);
    if (saved?.kind === "ticket" && saved.ticket) setTicket(saved.ticket);

    const mark = `upeo-thanks-fired:${nonce}`;
    try {
      if (sessionStorage.getItem(mark)) return;
      sessionStorage.setItem(mark, "1");
    } catch {
      /* Fire once in this tab when storage is available. */
    }
    const value = saved?.kind === kind ? saved.value : null;
    const purchase = kind === "ticket" || kind === "order";
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "conversion",
      conversion_kind: kind,
      ...(value ? { value, currency: "KES" } : {}),
    });
    if (typeof window.fbq === "function") {
      window.fbq("track", purchase ? "Purchase" : "Lead", value ? { value, currency: "KES" } : {});
    }
    if (typeof window.gtag === "function" && adsSendTo.includes("/")) {
      window.gtag("event", "conversion", {
        send_to: adsSendTo,
        ...(value ? { value, currency: "KES" } : {}),
      });
    }
    if (typeof window.gtag === "function" && gaId) {
      window.gtag("event", purchase ? "purchase" : "generate_lead", {
        send_to: gaId,
        ...(value ? { value, currency: "KES" } : {}),
      });
    }
  }, [adsSendTo, gaId, kind, nonce]);

  if (!ticket?.code && !ticket?.eventSlug) return null;

  return (
    <div className="mx-auto mt-6 max-w-sm rounded-[5px] border border-line bg-surface-2 px-4 py-3 text-left">
      {ticket.code ? (
        <>
          <p className="text-xs text-muted">Ticket code</p>
          <p className="mt-1 font-display text-2xl font-semibold tracking-[0.12em] text-ink-900">{ticket.code}</p>
          <p className="mt-1 text-sm text-body">
            {ticket.qty} {ticket.qty === 1 ? "ticket" : "tickets"}
            {ticket.email ? ` · sent to ${ticket.email}` : ""}
          </p>
        </>
      ) : null}
      {ticket.eventSlug ? (
        <a
          href={`/api/events/${ticket.eventSlug}/ics`}
          className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:underline"
        >
          <CalendarPlus className="h-4 w-4" aria-hidden />
          Add to calendar
        </a>
      ) : null}
    </div>
  );
}
