import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, CircleCheckBig } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { stagger } from "@/components/ui/stagger";
import { PageHeader } from "@/components/site/PageHeader";
import { ServiceCard } from "@/components/site/ServiceCard";
import { ProcessSlider } from "@/components/site/ProcessSlider";
import { OpenInquiry } from "@/components/site/OpenInquiry";
import { GoogleRating } from "@/components/sections/GoogleRating";
import { CTA } from "@/components/sections/CTA";
import { services, company } from "@/lib/content";

/**
 * One template, nine pages. Every service renders through here, so adding a
 * service to `services.ts` publishes a full page with no new layout code.
 */

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const service = services.find((s) => s.slug === slug);
  if (!service) return {};

  /* The hero paragraph IS the meta description. One string, used in both
     places, so what search results show can never drift from what the page
     actually says. `detail.lead` is written for that job: stake, company name,
     service keywords, places served, and a concrete outcome. */
  return {
    title: service.title,
    description: service.detail.lead,
    alternates: { canonical: `/services/${service.slug}` },
    openGraph: {
      title: `${service.title} · ${company.name}`,
      description: service.detail.lead,
      url: `${company.domain}/services/${service.slug}`,
      images: [{ url: service.image }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${service.title} · ${company.name}`,
      description: service.detail.lead,
    },
  };
}

export default async function ServicePage({ params }: Params) {
  const { slug } = await params;
  const service = services.find((s) => s.slug === slug);
  if (!service) notFound();

  const others = services.filter((s) => s.slug !== service.slug).slice(0, 3);

  /* Service + FAQPage schema. The FAQ answers are eligible for rich results,
     which is most of the reason for writing them out properly. */
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        name: service.title,
        description: service.description,
        serviceType: service.title,
        provider: {
          "@type": "Organization",
          name: company.legalName,
          url: company.domain,
        },
        areaServed: [
          { "@type": "Country", name: "Kenya" },
          { "@type": "Place", name: "Africa" },
        ],
        url: `${company.domain}/services/${service.slug}`,
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: `${service.title} specialisms`,
          itemListElement: service.specialisms.map((sp) => ({
            "@type": "Offer",
            itemOffered: { "@type": "Service", name: sp.title, description: sp.description },
          })),
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: service.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <PageHeader
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Services", href: "/services" },
          { label: service.title },
        ]}
        title={service.title}
        intro={service.detail.lead}
        image={service.image}
        imageAlt={service.imageAlt}
      />

      {/* How we help + what you get */}
      <section className="bg-white py-24 lg:py-32">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,400px)] lg:gap-16">
            <div>
              <Reveal>
                <h2 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">
                  How we help
                </h2>
              </Reveal>
              {service.detail.body.map((para, i) => (
                <Reveal key={i} delay={stagger(i + 1, 3)}>
                  <p className="mt-5 text-[17px] leading-relaxed text-body">{para}</p>
                </Reveal>
              ))}

              <Reveal delay={0.18}>
                <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4 border-t border-line pt-8">
                  <OpenInquiry className="group inline-flex cursor-pointer items-center gap-2 bg-ink-900 px-6 py-3.5 text-sm font-medium text-white transition-colors duration-300 ease-out-expo hover:bg-brand-600">
                    Get this service
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out-expo group-hover:translate-x-1" />
                  </OpenInquiry>
                  <p className="text-sm text-muted">
                    A short call, a clear plan, and a quote before you commit.
                  </p>
                </div>
              </Reveal>
            </div>

            <Reveal delay={0.1}>
              <aside className="border border-brand-200 bg-brand-50 p-8">
                <h2 className="font-display text-lg font-semibold text-ink-900">
                  What you get
                </h2>
                <span className="mt-3 block h-0.5 w-10 bg-brand-500" aria-hidden />
                <ul className="mt-6 space-y-4">
                  {service.detail.outcomes.map((o) => (
                    <li key={o} className="flex gap-3 text-[15px] leading-relaxed text-slate-ink">
                      <CircleCheckBig
                        className="mt-0.5 h-5 w-5 shrink-0 fill-brand-500 text-white"
                        strokeWidth={2.5}
                        aria-hidden
                      />
                      {o}
                    </li>
                  ))}
                </ul>

                <h3 className="mt-8 border-t border-brand-200 pt-6 text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
                  Included
                </h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {service.features.map((f) => (
                    <span
                      key={f}
                      className="border border-brand-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-ink"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </aside>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* The specialisms sold under this service: each one its own piece of work */}
      <section className="border-t border-line bg-surface-2 py-24 lg:py-32">
        <Container>
          <Reveal>
            {/* Title kept as written: lower-casing mangles SEO, UI/UX, and API. */}
            <h2 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">
              What {service.title} covers
            </h2>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-body">
              Take the whole thing, or start with the one piece that is costing you
              most right now. Either way it is the same team and the same contract.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-px border border-ink-900/10 bg-ink-900/10 sm:grid-cols-2 lg:grid-cols-3">
            {service.specialisms.map((sp, i) => (
              <Reveal key={sp.title} delay={stagger(i, 3)} className="flex">
                <article className="group flex h-full w-full flex-col bg-white p-8 transition-colors duration-300 ease-out-expo hover:bg-ink-950">
                  <span
                    className="font-display text-4xl font-light leading-none text-ink-900/[0.10] transition-colors duration-300 ease-out-expo group-hover:text-white/20"
                    aria-hidden
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-5 font-display text-lg font-semibold text-ink-900 transition-colors duration-300 ease-out-expo group-hover:text-white">
                    {sp.title}
                  </h3>
                  <span
                    className="mt-3 block h-0.5 w-10 bg-brand-500 transition-[width] duration-300 ease-out-expo group-hover:w-16"
                    aria-hidden
                  />
                  <p className="mt-4 flex-1 text-[15px] leading-relaxed text-body transition-colors duration-300 ease-out-expo group-hover:text-white/70">
                    {sp.description}
                  </p>
                  <OpenInquiry
                    ariaLabel={`Enquire about ${sp.title}`}
                    className="mt-6 inline-flex cursor-pointer items-center gap-2 border-t border-ink-900/10 pt-5 text-sm font-semibold text-ink-900 transition-colors duration-300 ease-out-expo group-hover:border-white/15 group-hover:text-white"
                  >
                    Get service
                    <ArrowRight className="h-4 w-4 text-brand-500 transition-transform duration-300 ease-out-expo group-hover:translate-x-1" />
                  </OpenInquiry>
                </article>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* How this particular engagement runs. Heading centred and on its own:
          the steps below say what the section is far better than a paragraph
          of "we do this, then we do that" ever did. */}
      <section className="border-t border-line bg-white py-24 lg:py-32">
        <Container>
          <Reveal>
            <h2 className="mx-auto max-w-3xl text-center font-display text-2xl font-bold leading-[1.15] text-ink-900 sm:text-3xl md:text-[2.25rem]">
              How {company.name} delivers {service.title}
            </h2>
          </Reveal>

          <ProcessSlider steps={service.process} />
        </Container>
      </section>

      {/* Questions people actually ask before signing */}
      <section className="bg-white py-24 lg:py-32">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] lg:gap-16">
            <div>
              <Reveal>
                <h2 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">
                  Questions, answered
                </h2>
              </Reveal>
              <Reveal delay={0.05}>
                <p className="mt-4 text-[15px] leading-relaxed text-body">
                  The things clients ask us before they commit. If yours is not here,
                  ask it directly and we will answer it straight.
                </p>
              </Reveal>
              <Reveal delay={0.1}>
                <OpenInquiry className="group mt-6 inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-ink-900 transition-colors duration-300 ease-out-expo hover:text-brand-600">
                  Ask us anything
                  <ArrowRight className="h-4 w-4 text-brand-500 transition-transform duration-300 ease-out-expo group-hover:translate-x-1" />
                </OpenInquiry>
              </Reveal>
            </div>

            <dl className="divide-y divide-line border-t border-line">
              {service.faqs.map((f, i) => (
                <Reveal key={f.q} delay={stagger(i, 3)}>
                  <div className="py-7">
                    <dt className="font-display text-[17px] font-semibold text-ink-900">
                      {f.q}
                    </dt>
                    <dd className="mt-3 text-[15px] leading-relaxed text-body">{f.a}</dd>
                  </div>
                </Reveal>
              ))}
            </dl>
          </div>
        </Container>
      </section>

      <GoogleRating />

      {/* Related services */}
      <section className="bg-surface-2 py-24 lg:py-32">
        <Container>
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <Reveal>
              <h2 className="max-w-xl font-display text-2xl font-bold text-ink-900 sm:text-3xl">
                Often paired with
              </h2>
            </Reveal>
            <Reveal>
              <Link
                href="/services"
                className="group inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-ink-900 transition-colors duration-300 ease-out-expo hover:text-brand-600"
              >
                All services
                <ArrowRight className="h-4 w-4 text-brand-500 transition-transform duration-300 ease-out-expo group-hover:translate-x-1" />
              </Link>
            </Reveal>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {others.map((s, i) => (
              <Reveal key={s.slug} delay={stagger(i, 3)} className="flex">
                <ServiceCard service={s} />
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Title is not lower-cased: it would mangle SEO, UI/UX, and API. */}
      <CTA
        title={`Ready to start with ${service.title}?`}
        intro="Tell us what you are trying to solve. We will scope it with you and put a clear plan, timeline, and quote in front of you before you commit to anything."
      />
    </>
  );
}
