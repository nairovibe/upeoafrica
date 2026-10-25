import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/site/PageHeader";
import { Container } from "@/components/ui/Container";
import { CTA } from "@/components/sections/CTA";
import { TicketCheckoutForm } from "@/components/site/TicketCheckoutForm";
import { getEventBySlug, getTicketTypes } from "@/lib/cms";
import { formatKes, publicMediaUrl } from "@/lib/constants";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = await getEventBySlug(slug);
  if (!item) return { title: "Events" };
  return { title: item.title, description: (item.summary || item.title).slice(0, 160) };
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getEventBySlug(slug);
  if (!item) notFound();
  const tickets = await getTicketTypes(item.id);
  const cover = publicMediaUrl(item.cover_path);
  const past = new Date(item.starts_at).getTime() < Date.now() - 12 * 60 * 60 * 1000;

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Events", href: "/events" }, { label: item.title }]}
        title={item.title}
        intro={item.summary}
        image={cover || undefined}
        imageAlt={item.title}
      />
      <section className="bg-white py-24 lg:py-32">
        <Container>
          <div className="grid gap-14 lg:grid-cols-[1fr_340px]">
            <article className="max-w-2xl">
              <p className="text-sm text-muted">
                {new Date(item.starts_at).toLocaleString("en-KE")}
                {item.ends_at ? ` – ${new Date(item.ends_at).toLocaleString("en-KE")}` : ""}
              </p>
              <p className="mt-2 text-sm font-medium text-ink-900">
                {item.mode}
                {item.venue ? ` · ${item.venue}` : ""}
                {item.capacity != null ? ` · ${item.capacity} seats` : ""}
              </p>
              {item.body ? (
                <p className="mt-8 whitespace-pre-wrap text-[15px] leading-relaxed text-body">{item.body}</p>
              ) : null}
            </article>
            <aside className="border border-line p-6 h-fit">
              {tickets[0] ? (
                <p className="font-display text-2xl font-semibold text-ink-900">
                  {tickets[0].price_kes > 0 ? formatKes(tickets[0].price_kes) : "Free"}
                </p>
              ) : null}
              <p className="mt-2 text-sm text-body">
                {past
                  ? "This session has already run. Watch this page for the next one."
                  : "Pay with M-Pesa STK. The ticket is emailed after confirmation."}
              </p>
              {!past ? (
                <div className="mt-6">
                  <TicketCheckoutForm eventId={item.id} tickets={tickets} />
                </div>
              ) : null}
            </aside>
          </div>
        </Container>
      </section>
      <CTA />
    </>
  );
}
