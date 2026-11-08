import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, CalendarPlus, Clock, MapPin, MonitorSmartphone, Ticket, Timer } from "lucide-react";
import { PageHeader } from "@/components/site/PageHeader";
import { Container } from "@/components/ui/Container";
import { CTA } from "@/components/sections/CTA";
import { TicketCheckoutForm, type TicketOption } from "@/components/site/TicketCheckoutForm";
import { currentOffer } from "@/lib/offer";
import { getEventBySlug, getPublishedEventSlugs, getTicketHolds, getTicketTypes } from "@/lib/cms";
import { company } from "@/lib/content";
import { publicMediaUrl } from "@/lib/constants";
import {
  durationLabel,
  formatEventDate,
  formatEventTime,
  isEventOver,
  mapsUrl,
  modeLabel,
  parseAgenda,
  parseSpeakers,
  salesState,
} from "@/components/events/utils";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 300;

export async function generateStaticParams() {
  const events = await getPublishedEventSlugs();
  return events.map((event) => ({ slug: event.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = await getEventBySlug(slug);
  if (!item) return { title: "Events" };
  const description = (item.meta_description || item.summary || item.title).slice(0, 160);
  const cover = publicMediaUrl(item.cover_path);
  const title = item.meta_title || item.title;
  return {
    title: item.meta_title ? { absolute: item.meta_title } : item.title,
    description,
    alternates: { canonical: `/events/${item.slug}` },
    openGraph: {
      type: "website",
      title,
      description,
      url: `/events/${item.slug}`,
      images: cover ? [{ url: cover, alt: item.title }] : undefined,
    },
    twitter: { card: cover ? "summary_large_image" : "summary", title, description, images: cover ? [cover] : undefined },
  };
}

const ATTENDANCE: Record<string, string> = {
  online: "https://schema.org/OnlineEventAttendanceMode",
  hybrid: "https://schema.org/MixedEventAttendanceMode",
};

export default async function EventPage({ params }: Props) {
  const { slug } = await params;
  const item = await getEventBySlug(slug);
  if (!item) notFound();
  const [tickets, holds] = await Promise.all([getTicketTypes(item.id), getTicketHolds([item.id])]);

  const now = new Date().getTime();
  const over = isEventOver(item.starts_at, now);
  const regClosed = item.registration_closes_at != null && new Date(item.registration_closes_at).getTime() < now;
  const taken = holds?.byEvent.get(item.id) ?? (holds ? 0 : null);
  const seatsLeft = item.capacity != null && taken != null ? Math.max(item.capacity - taken, 0) : null;

  const options: TicketOption[] = tickets.map((t) => {
    const held = holds ? (holds.byTicket.get(t.id) ?? 0) : null;
    return {
      id: t.id,
      name: t.name,
      description: t.description,
      price_kes: currentOffer(t)?.price ?? t.price_kes,
      list_price_kes: t.price_kes,
      promo_label: currentOffer(t)?.label ?? null,
      max_per_order: t.max_per_order,
      sales_start: t.sales_start,
      sales_end: t.sales_end,
      state: salesState(t, now),
      remaining: t.quota != null && held != null ? Math.max(t.quota - held, 0) : null,
    };
  });

  const cover = publicMediaUrl(item.cover_path);
  const speakers = parseSpeakers(item.speakers);
  const agenda = parseAgenda(item.agenda);
  const gallery = item.gallery.map((p) => publicMediaUrl(p)).filter((u): u is string => Boolean(u));
  const duration = durationLabel(item.starts_at, item.ends_at);
  const url = `${company.domain}/events/${item.slug}`;

  const place = {
    "@type": "Place",
    name: item.venue || company.city,
    address: {
      "@type": "PostalAddress",
      streetAddress: item.venue || company.street,
      addressLocality: company.city,
      addressCountry: "KE",
    },
  };
  const virtual = { "@type": "VirtualLocation", url };
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: item.title,
    description: item.meta_description || item.summary,
    startDate: item.starts_at,
    endDate: item.ends_at ?? undefined,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: ATTENDANCE[item.mode] ?? "https://schema.org/OfflineEventAttendanceMode",
    location: item.mode === "online" ? virtual : item.mode === "hybrid" ? [place, virtual] : place,
    image: cover ? [cover] : undefined,
    url,
    organizer: { "@type": "Organization", name: company.legalName, url: company.domain },
    performer: speakers.length ? speakers.map((s) => ({ "@type": "Person", name: s.name })) : undefined,
    offers: options.map((t) => ({
      "@type": "Offer",
      name: t.name,
      price: t.price_kes,
      priceCurrency: "KES",
      url,
      availability:
        t.remaining === 0 || seatsLeft === 0
          ? "https://schema.org/SoldOut"
          : t.state === "soon"
            ? "https://schema.org/PreOrder"
            : "https://schema.org/InStock",
      validFrom: t.sales_start ?? item.published_at ?? undefined,
    })),
  };

  const facts = [
    { icon: CalendarDays, label: "Date", value: formatEventDate(item.starts_at) },
    {
      icon: Clock,
      label: "Time",
      value: `${formatEventTime(item.starts_at)}${item.ends_at ? ` to ${formatEventTime(item.ends_at)}` : ""} EAT`,
    },
    duration ? { icon: Timer, label: "Duration", value: duration } : null,
    { icon: MonitorSmartphone, label: "Format", value: modeLabel(item.mode) },
    item.venue
      ? { icon: MapPin, label: "Venue", value: item.venue, href: item.mode === "online" ? undefined : mapsUrl(item.venue) }
      : null,
    seatsLeft != null && !over
      ? { icon: Ticket, label: "Seats", value: seatsLeft === 0 ? "Sold out" : `${seatsLeft} left` }
      : null,
  ].filter((f): f is NonNullable<typeof f> => f != null);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <PageHeader
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Events", href: "/events" }, { label: item.title }]}
        title={item.title}
        intro={item.summary || undefined}
        image={cover || undefined}
        imageAlt={item.title}
      />

      <section className="bg-white py-16 lg:py-24">
        <Container>
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[5px] border border-line bg-line sm:grid-cols-3 lg:grid-cols-[repeat(auto-fit,minmax(9rem,1fr))]">
            {facts.map((f) => (
              <div key={f.label} className="bg-white p-4">
                <dt className="flex items-center gap-1.5 text-xs text-muted">
                  <f.icon className="h-3.5 w-3.5" aria-hidden />
                  {f.label}
                </dt>
                <dd className="mt-1 text-sm font-medium text-ink-900">
                  {"href" in f && f.href ? (
                    <a href={f.href} target="_blank" rel="noopener noreferrer" className="hover:text-brand-600 hover:underline">
                      {f.value}
                    </a>
                  ) : (
                    f.value
                  )}
                </dd>
              </div>
            ))}
          </dl>
          {!over ? (
            <a
              href={`/api/events/${item.slug}/ics`}
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:underline"
            >
              <CalendarPlus className="h-4 w-4" aria-hidden />
              Add to calendar
            </a>
          ) : null}

          <div className="mt-12 grid gap-14 lg:grid-cols-[minmax(0,1fr)_380px]">
            <div className="min-w-0 space-y-14">
              {item.body ? (
                <div>
                  <h2 className="font-display text-2xl font-semibold text-ink-900">About this event</h2>
                  <p className="mt-4 whitespace-pre-wrap text-lg leading-relaxed text-body">{item.body}</p>
                </div>
              ) : null}

              {agenda.length > 0 ? (
                <div>
                  <h2 className="font-display text-2xl font-semibold text-ink-900">Agenda</h2>
                  <ol className="mt-5 divide-y divide-line border-y border-line">
                    {agenda.map((a, i) => (
                      <li key={`${a.time}-${i}`} className="grid gap-1 py-4 sm:grid-cols-[6rem_minmax(0,1fr)] sm:gap-6">
                        <span className="font-display text-sm font-semibold tabular-nums text-brand-600">{a.time}</span>
                        <div>
                          <p className="font-medium text-ink-900">{a.title}</p>
                          {a.detail ? <p className="mt-1 text-[15px] leading-relaxed text-body">{a.detail}</p> : null}
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              ) : null}

              {speakers.length > 0 ? (
                <div>
                  <h2 className="font-display text-2xl font-semibold text-ink-900">Speakers</h2>
                  <ul className="mt-5 grid gap-4 sm:grid-cols-2">
                    {speakers.map((s, i) => {
                      const photo = publicMediaUrl(s.photo_path);
                      return (
                        <li key={`${s.name}-${i}`} className="flex items-center gap-4 rounded-[5px] border border-line p-4">
                          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-surface-2">
                            {photo ? (
                              <Image src={photo} alt={s.name} fill className="object-cover" sizes="56px" />
                            ) : (
                              <span className="flex h-full w-full items-center justify-center font-display text-lg font-semibold text-muted">
                                {s.name.charAt(0)}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-ink-900">{s.name}</p>
                            {s.role ? <p className="text-sm text-muted">{s.role}</p> : null}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : null}

              {gallery.length > 0 ? (
                <div>
                  <h2 className="font-display text-2xl font-semibold text-ink-900">Gallery</h2>
                  <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {gallery.map((src, i) => (
                      <div key={src} className="relative aspect-[4/3] overflow-hidden rounded-[5px] bg-surface-2">
                        <Image src={src} alt={`${item.title} photo ${i + 1}`} fill className="object-cover" sizes="(max-width: 640px) 50vw, 260px" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <aside className="lg:sticky lg:top-28 lg:self-start">
              {over ? (
                <div className="rounded-[5px] border border-line p-6">
                  <h2 className="font-display text-xl font-semibold text-ink-900">This event has ended</h2>
                  <Link href="/events" className="mt-3 inline-flex text-sm font-medium text-brand-600 hover:underline">
                    See upcoming events
                  </Link>
                </div>
              ) : (
                <TicketCheckoutForm
                  eventId={item.id}
                  eventSlug={item.slug}
                  tickets={options}
                  eventSeatsLeft={seatsLeft}
                  closedMessage={regClosed ? "Registration has closed." : null}
                />
              )}
            </aside>
          </div>
        </Container>
      </section>
      <CTA />
    </>
  );
}
