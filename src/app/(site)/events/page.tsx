import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/site/PageHeader";
import { Container } from "@/components/ui/Container";
import { CTA } from "@/components/sections/CTA";
import { getPublishedEvents, getTicketHolds, getTicketTypesForEvents, type Event } from "@/lib/cms";
import {
  dateBlock,
  formatEventDate,
  formatEventTime,
  isEventOver,
  modeLabel,
  priceLabel,
} from "@/components/events/utils";
import { chargeKes } from "@/lib/offer";

const intro =
  "Talks, workshops, bootcamps and online sessions run by Upeo Africa Technologies in Mombasa. Book a free seat or pay for your ticket with M-Pesa.";

/** Seat counts can change. Refresh this page on its own, not with the rest of the site. */
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Events",
  description: intro,
  alternates: { canonical: "/events" },
  openGraph: { title: "Events", description: intro, url: "/events" },
};

export default async function EventsPage() {
  const events = await getPublishedEvents();
  const ids = events.map((e) => e.id);
  const [tickets, holds] = await Promise.all([getTicketTypesForEvents(ids), getTicketHolds(ids)]);

  const prices = new Map<string, number[]>();
  for (const t of tickets) prices.set(t.event_id, [...(prices.get(t.event_id) ?? []), chargeKes(t)]);

  const upcoming = events.filter((e) => !isEventOver(e.starts_at));
  const past = events.filter((e) => isEventOver(e.starts_at)).reverse();

  return (
    <>
      <PageHeader breadcrumb={[{ label: "Home", href: "/" }, { label: "Events" }]} title="Events" intro={intro} />

      <section className="bg-white py-20 lg:py-28">
        <Container>
          {upcoming.length === 0 ? (
            <div className="max-w-2xl rounded-[5px] border border-line p-8">
              <h2 className="font-display text-2xl font-semibold text-ink-900">No upcoming events</h2>
              <p className="mt-3 text-lg leading-relaxed text-body">
                New dates are posted here first. For a private session for your team,{" "}
                <Link href="/contact" className="font-medium text-brand-600 hover:underline">
                  talk to us
                </Link>
                .
              </p>
            </div>
          ) : (
            <div>
              <h2 className="font-display text-2xl font-semibold text-ink-900">Upcoming</h2>
              <ul className="mt-6 space-y-4">
                {upcoming.map((event) => {
                  const taken = holds?.byEvent.get(event.id);
                  const seatsLeft =
                    event.capacity != null && taken != null ? Math.max(event.capacity - taken, 0) : null;
                  return (
                    <li key={event.id}>
                      <UpcomingRow event={event} price={priceLabel(prices.get(event.id) ?? [], event.currency === "USD" ? "USD" : "KES")} seatsLeft={seatsLeft} />
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {past.length > 0 ? (
            <div className="mt-20">
              <h2 className="font-display text-2xl font-semibold text-ink-900">Past events</h2>
              <ul className="mt-6 divide-y divide-line border-y border-line">
                {past.map((event) => (
                  <li key={event.id}>
                    <Link
                      href={`/events/${event.slug}`}
                      className="group grid gap-1 py-4 sm:grid-cols-[10rem_minmax(0,1fr)_auto] sm:items-center sm:gap-6"
                    >
                      <time dateTime={event.starts_at} className="text-sm text-muted">
                        {formatEventDate(event.starts_at)}
                      </time>
                      <span className="font-medium text-ink-900 group-hover:text-brand-600">{event.title}</span>
                      <span className="text-sm text-muted">{event.category || modeLabel(event.mode)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </Container>
      </section>

      <CTA
        title="Want a session for your team?"
        intro="We run private workshops and trainings on software, payments, design and growth. Tell us who it is for and we will plan it with you."
      />
    </>
  );
}

function UpcomingRow({ event, price, seatsLeft }: { event: Event; price: string | null; seatsLeft: number | null }) {
  const d = dateBlock(event.starts_at);
  const meta = [event.category, modeLabel(event.mode), event.venue, `${formatEventTime(event.starts_at)} EAT`]
    .filter(Boolean)
    .join(" · ");
  return (
    <Link
      href={`/events/${event.slug}`}
      className="group grid grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-5 rounded-[5px] border border-line p-4 transition-colors duration-200 hover:border-brand-300 sm:grid-cols-[5rem_minmax(0,1fr)_auto] sm:gap-6 sm:p-5"
    >
      <time
        dateTime={event.starts_at}
        className="flex flex-col items-center justify-center rounded-[5px] bg-surface-2 py-3 text-center"
      >
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-600">{d.month}</span>
        <span className="font-display text-3xl font-semibold leading-none text-ink-900">{d.day}</span>
        <span className="mt-1 text-xs text-muted">{d.weekday}</span>
      </time>
      <div className="min-w-0">
        <h3 className="font-display text-xl font-semibold text-ink-900 group-hover:text-brand-600">{event.title}</h3>
        <p className="mt-1 truncate text-sm text-muted">{meta}</p>
      </div>
      <div className="col-span-2 flex items-center justify-between gap-4 sm:col-span-1 sm:flex-col sm:items-end sm:justify-center sm:gap-1">
        <span className="font-display text-lg font-semibold text-ink-900">{price ?? "Details"}</span>
        <span className="inline-flex items-center gap-3">
          {seatsLeft != null ? (
            <span className={seatsLeft === 0 ? "text-sm font-medium text-brand-600" : "text-sm text-muted"}>
              {seatsLeft === 0 ? "Sold out" : `${seatsLeft} seats left`}
            </span>
          ) : null}
          {seatsLeft !== 0 ? (
            <span className="inline-flex items-center gap-1 text-sm font-medium text-brand-600">
              Get it now
              <ArrowRight className="h-4 w-4" aria-hidden />
            </span>
          ) : null}
        </span>
      </div>
    </Link>
  );
}
