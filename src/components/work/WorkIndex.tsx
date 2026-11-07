"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/site/PageHeader";
import { Container } from "@/components/ui/Container";
import { FeaturedWork, WorkCard } from "@/components/work/WorkCard";
import { WorkEmpty } from "@/components/work/WorkEmpty";
import { WorkFilters, workHref } from "@/components/work/WorkFilters";
import type { WorkCard as WorkCardData } from "@/lib/cms";

function tally(values: string[]) {
  const counts = new Map<string, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([v]) => v);
}

export function WorkIndex({
  work,
  industry,
  service,
}: {
  work: WorkCardData[];
  industry?: string;
  service?: string;
}) {
  const industries = tally(work.map((w) => w.industry).filter((i): i is string => Boolean(i)));
  const services = tally(work.flatMap((w) => w.services));
  const activeIndustry = industry && industries.includes(industry) ? industry : undefined;
  const activeService = service && services.includes(service) ? service : undefined;
  const filtered = Boolean(activeIndustry || activeService);
  const featured = filtered ? null : (work.find((w) => w.featured) ?? null);
  const list = work.filter(
    (w) => w.id !== featured?.id && (!activeIndustry || w.industry === activeIndustry) && (!activeService || w.services.includes(activeService)),
  );

  const label = [activeIndustry, activeService].filter(Boolean).join(", ");
  const intro =
    "Projects we have delivered for businesses in Kenya and abroad: custom software, web and mobile apps, M-Pesa and card payments, branding, and marketing. Each case study covers the brief, what we built, and the results after launch.";

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Our Work" }]}
        title={filtered ? `${label} projects` : "Our Work"}
        intro={intro}
      />
      <section className="bg-white py-16 lg:py-24">
        <Container>
          {work.length === 0 ? <WorkEmpty /> : null}
      {featured ? <FeaturedWork item={featured} /> : null}

      <div className={featured ? "mt-16" : undefined}>
        <WorkFilters industries={industries} services={services} active={{ industry: activeIndustry, service: activeService }} />
      </div>

      {filtered ? (
        <p className="mt-6 text-sm text-body">
          {list.length} {list.length === 1 ? "project" : "projects"}
          {activeIndustry ? <> in {activeIndustry}</> : null}
          {activeService ? <> with {activeService}</> : null}.{" "}
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
        </Container>
      </section>
    </>
  );
}

export function WorkIndexFromUrl({ work }: { work: WorkCardData[] }) {
  const sp = useSearchParams();
  return <WorkIndex work={work} industry={sp.get("industry") ?? undefined} service={sp.get("service") ?? undefined} />;
}
