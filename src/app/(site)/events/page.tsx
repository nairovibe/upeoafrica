import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/site/PageHeader";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/Section";
import { CTA } from "@/components/sections/CTA";
import { getPublishedEvents } from "@/lib/cms";
import { formatKes, publicMediaUrl } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Join talks and training, in person and online. A seat is a ticket for a session taught from projects we have already shipped.",
};

export default async function EventsPage() {
  const events = await getPublishedEvents();
  const supabase = await createClient();
  const ids = events.map((e) => e.id);
  const { data: tickets } = ids.length
    ? await supabase.from("ticket_types").select("event_id, price_kes").in("event_id", ids)
    : { data: [] };
  const fromPrice = new Map<string, number>();
  for (const t of tickets ?? []) {
    const current = fromPrice.get(t.event_id);
    if (current == null || t.price_kes < current) fromPrice.set(t.event_id, t.price_kes);
  }
  const now = Date.now();
  const upcoming = events.filter((e) => new Date(e.starts_at).getTime() >= now - 12 * 60 * 60 * 1000);
  const past = events.filter((e) => new Date(e.starts_at).getTime() < now - 12 * 60 * 60 * 1000);

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "Home", href: "/" }, { label: "About", href: "/about" }, { label: "Events" }]}
        title="Events"
        intro="Join talks and training, in person and online. A seat is a ticket for a session taught from projects we have already shipped."
      />
      <section className="bg-white py-24 lg:py-32">
        <Container>
          <SectionHeading
            title="Who a seat is for"
            intro="Sessions are for people who will use the hour, not for a general audience."
          />
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {[
              ["Founders", "You are deciding what to build, or you already have a product and need the next decision made in the open."],
              ["Teams that already ship", "Your staff run the product. The session is on payments, launch, or how the work is held after go-live."],
              ["A public date", "When a session is scheduled it is listed below, with a price and a way to take a seat."],
            ].map(([title, body]) => (
              <article key={title} className="border border-line p-8">
                <h3 className="font-display text-xl font-semibold text-ink-900">{title}</h3>
                <p className="mt-3 text-lg leading-relaxed text-body">{body}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>
      <section className="bg-[#edf3f8] py-24 lg:py-32">
        <Container>
          <SectionHeading title="Sessions" intro="Upcoming first. Past sessions stay listed so you can see what the studio has already taught." />
          <div className="mt-14">
          {events.length === 0 ? (
            <p className="max-w-2xl text-lg leading-relaxed text-body">
              No session is scheduled. When one is, the date, the place, and the ticket price will be listed here. For a private conversation, start on{" "}
              <Link href="/founders#share" className="font-medium text-brand-600 hover:underline">
                Founders Zone
              </Link>
              .
            </p>
          ) : (
            <div className="space-y-16">
              {upcoming.length > 0 ? (
                <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
                  {upcoming.map((event) => (
                    <EventCard
                      key={event.id}
                      href={`/events/${event.slug}`}
                      title={event.title}
                      summary={event.summary}
                      startsAt={event.starts_at}
                      mode={event.mode}
                      venue={event.venue}
                      cover={publicMediaUrl(event.cover_path)}
                      from={fromPrice.get(event.id)}
                    />
                  ))}
                </div>
              ) : null}
              {past.length > 0 ? (
                <div>
                  <h3 className="font-display text-xl font-semibold text-ink-900">Past sessions</h3>
                  <div className="mt-6 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
                    {past.map((event) => (
                      <EventCard
                        key={event.id}
                        href={`/events/${event.slug}`}
                        title={event.title}
                        summary={event.summary}
                        startsAt={event.starts_at}
                        mode={event.mode}
                        venue={event.venue}
                        cover={publicMediaUrl(event.cover_path)}
                        from={fromPrice.get(event.id)}
                      />
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          )}
          </div>
        </Container>
      </section>
      <CTA />
    </>
  );
}

function EventCard({
  href,
  title,
  summary,
  startsAt,
  mode,
  venue,
  cover,
  from,
}: {
  href: string;
  title: string;
  summary: string;
  startsAt: string;
  mode: string;
  venue: string | null;
  cover: string | null;
  from?: number;
}) {
  return (
    <Link href={href} className="group block border border-line hover:border-brand-300">
      {cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={cover} alt="" className="h-40 w-full object-cover" />
      ) : null}
      <div className="p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">
          {mode}
          {venue ? ` · ${venue}` : ""}
        </p>
        <h3 className="mt-3 font-display text-xl font-semibold text-ink-900 group-hover:text-brand-600">{title}</h3>
        <p className="mt-2 text-sm text-muted">{new Date(startsAt).toLocaleString("en-KE")}</p>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-body">{summary}</p>
        <p className="mt-4 text-sm font-medium text-ink-900">
          {from == null ? "Details" : from > 0 ? `From ${formatKes(from)}` : "Free"}
        </p>
      </div>
    </Link>
  );
}
