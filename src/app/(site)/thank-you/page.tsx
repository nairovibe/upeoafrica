import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ThankYouAnimation, ThankYouMoment } from "@/components/site/ThankYouMoment";
import { getPublicSettings } from "@/lib/cms";
import { company } from "@/lib/content";
import { matchToken, VERIFY } from "@/lib/search-presence";
import { isThanksKind, type ThanksKind } from "@/lib/thanks";

export const metadata: Metadata = {
  title: "Thank you",
  robots: { index: false, follow: false },
};

const COPY: Record<ThanksKind, { eyebrow: string; title: string; body: string }> = {
  enquiry: {
    eyebrow: "Enquiry received",
    title: "We have your brief.",
    body: "The team will write back within one business day.",
  },
  subscribe: {
    eyebrow: "You are subscribed",
    title: "You are on the list.",
    body: "New articles and event notes will come to this address. Unsubscribe any time.",
  },
  ticket: {
    eyebrow: "Booking confirmed",
    title: "You are booked.",
    body: "The ticket is also in your email. Keep the code for the door.",
  },
  order: {
    eyebrow: "Payment received",
    title: "Payment received.",
    body: "The download link is on its way to your email.",
  },
};

export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ for?: string; c?: string }>;
}) {
  const params = await searchParams;
  const kind: ThanksKind = isThanksKind(params.for) ? params.for : "enquiry";
  const nonce = typeof params.c === "string" ? params.c.slice(0, 40) : "";
  const copy = COPY[kind];
  const settings = await getPublicSettings();
  const note = settings?.thank_you_note?.trim() || "";
  const adsSendTo = matchToken(settings?.google_ads_id, VERIFY.ads);

  return (
    <section className="bg-white pt-32 pb-20 md:pt-40 md:pb-28">
      <Container className="mx-auto max-w-xl text-center">
        <ThankYouAnimation />
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">{copy.eyebrow}</p>
        <h1 className="mt-3 text-3xl font-bold leading-[1.08] text-ink-900 sm:text-4xl">{copy.title}</h1>
        <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-body">{copy.body}</p>
        {note ? <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-ink-900">{note}</p> : null}
        <p className="mx-auto mt-3 max-w-md text-sm text-muted">
          You can also write to{" "}
          <a href={`mailto:${company.email}`} className="font-medium text-brand-600 hover:underline">
            {company.email}
          </a>
          .
        </p>
        {nonce ? <ThankYouMoment kind={kind} nonce={nonce} adsSendTo={adsSendTo} /> : null}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button href="/">Back home</Button>
          <Button href="/contact" variant="outline">
            Contact us
          </Button>
        </div>
      </Container>
    </section>
  );
}
