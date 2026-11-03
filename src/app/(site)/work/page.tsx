import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/site/PageHeader";
import { Container } from "@/components/ui/Container";
import { CTA } from "@/components/sections/CTA";
import { FeaturedWork, WorkCard } from "@/components/work/WorkCard";
import { WorkEmpty } from "@/components/work/WorkEmpty";
import { WorkFilters, workHref } from "@/components/work/WorkFilters";
import { getPublishedWork, type WorkCard as WorkCardData } from "@/lib/cms";

const intro =
  "Projects we have delivered for businesses in Kenya and abroad: custom software, web and mobile apps, M-Pesa and card payments, branding, and marketing. Each case study covers the brief, what we built, and the results after launch.";

type SP = { industry?: string; service?: string };

/** Distinct values, most used first, then alphabetical. */
function tally(values: string[]) {
  const counts = new Map<string, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([v]) => v);
}

function readFilters(work: WorkCardData[], sp: SP) {
  const industries = tally(work.map((w) => w.industry).filter((i): i is string => Boolean(i)));
  const services = tally(work.flatMap((w) => w.services));
  const industry = sp.industry && industries.includes(sp.industry) ? sp.industry : undefined;
  const service = sp.service && services.includes(sp.service) ? sp.service : undefined;
  return { industries, services, industry, service };
}

export async function generateMetadata({ searchParams }: { searchParams: Promise<SP> }): Promise<Metadata> {
  const sp = await searchParams;
  const filtered = Boolean(sp.industry || sp.service);
  const label = [sp.industry, sp.service].filter(Boolean).join(", ");
  return {
    title: filtered ? `${label} projects` : "Our Work",
    description: intro,
    alternates: { canonical: "/work" },
    robots: filtered ? { index: false, follow: true } : undefined,
    openGraph: { title: "Our Work", description: intro, url: "/work" },
  };
}

export default async function WorkPage({ searchParams }: { searchParams: Promise<SP> }) {
  const [sp, work] = await Promise.all([searchParams, getPublishedWork()]);
  const { industries, services, industry, service } = readFilters(work, sp);
  const filtered = Boolean(industry || service);

  const featured = filtered ? null : (work.find((w) => w.featured) ?? null);
  const list = work.filter(
    (w) => w.id !== featured?.id && (!industry || w.industry === industry) && (!service || w.services.includes(service)),
  );

  return (
    <>
      <PageHeader breadcrumb={[{ label: "Home", href: "/" }, { label: "Our Work" }]} title="Our Work" intro={intro} />

      <section className="bg-white py-16 lg:py-24">
        <Container>
          {work.length === 0 ? (
            <WorkEmpty />
          ) : (
            <>
              {featured ? <FeaturedWork item={featured} /> : null}

              <div className={featured ? "mt-16" : undefined}>
                <WorkFilters industries={industries} services={services} active={{ industry, service }} />
              </div>

              {filtered ? (
                <p className="mt-6 text-sm text-body">
                  {list.length} {list.length === 1 ? "project" : "projects"}
                  {industry ? <> in {industry}</> : null}
                  {service ? <> with {service}</> : null}.{" "}
                  <Link href={workHref({})} scroll={false} className="font-medium text-brand-600 hover:underline">
                    Clear filters
                  </Link>
                </p>
              ) : null}

              {list.length > 0 ? (
                <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {list.map((item) => (
                    <WorkCard key={item.id} item={item} />
                  ))}
                </div>
              ) : filtered ? (
                <p className="mt-10 max-w-2xl text-lg leading-relaxed text-body">
                  No published project matches both filters. Pick one filter, or{" "}
                  <Link href="/contact" className="font-medium text-brand-600 hover:underline">
                    ask us
                  </Link>{" "}
                  about unpublished work in this area.
                </p>
              ) : null}
            </>
          )}
        </Container>
      </section>

      <CTA
        title="Have a similar project in mind?"
        intro="Send us the brief. We reply with how we would approach it, a timeline, and a price."
      />
    </>
  );
}
