"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { WorkCard } from "@/components/work/WorkCard";
import { WorkEmpty } from "@/components/work/WorkEmpty";
import type { WorkCard as WorkCardData } from "@/lib/cms";
import { stackGroups, type StackGroupId } from "@/lib/content";
import { stackInGroup } from "@/lib/stack";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 9;
const DISCIPLINES = new Set<string>(stackGroups.map((group) => group.id));

function tally(values: string[]) {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([value]) => value);
}

function buildHref(params: { discipline?: string; industry?: string; q?: string; page?: number }) {
  const search = new URLSearchParams();
  if (params.discipline) search.set("discipline", params.discipline);
  if (params.industry) search.set("industry", params.industry);
  if (params.q) search.set("q", params.q);
  if (params.page && params.page > 1) search.set("page", String(params.page));
  const query = search.toString();
  return `/work${query ? `?${query}` : ""}`;
}

export function WorkIndex({
  work,
  discipline,
  industry,
  service,
  q,
  page,
}: {
  work: WorkCardData[];
  discipline?: string;
  industry?: string;
  service?: string;
  q?: string;
  page: number;
}) {
  const router = useRouter();
  const industries = tally(work.map((item) => item.industry).filter((value): value is string => Boolean(value)));
  const activeDiscipline = discipline && DISCIPLINES.has(discipline) ? (discipline as StackGroupId) : undefined;
  const activeIndustry = industry && industries.includes(industry) ? industry : undefined;
  const term = q?.trim().toLowerCase();
  const matched = work.filter((item) => {
    if (activeDiscipline && !stackInGroup(item.tech_stack ?? [], activeDiscipline)) return false;
    if (activeIndustry && item.industry !== activeIndustry) return false;
    if (service && !(item.services ?? []).includes(service)) return false;
    if (!term) return true;
    const client = item.confidential ? "" : item.client?.name ?? "";
    const hay = `${item.title} ${item.summary} ${item.industry ?? ""} ${client} ${(item.services ?? []).join(" ")} ${(item.tech_stack ?? []).join(" ")}`.toLowerCase();
    return hay.includes(term);
  });
  const pages = Math.max(1, Math.ceil(matched.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const visible = matched.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const activeLabel = stackGroups.find((group) => group.id === activeDiscipline)?.label;

  return (
    <section className="bg-white py-14 lg:py-20">
      <Container>
        {work.length > 0 ? (
          <h2 className="mb-8 text-center font-display text-3xl font-bold leading-[1.08] text-ink-900 sm:text-4xl">Client projects</h2>
        ) : null}
          {work.length === 0 ? (
            <WorkEmpty />
          ) : (
            <>
              <div className="flex flex-col items-center gap-3">
                <nav aria-label="Filter by discipline" className="flex flex-wrap items-center justify-center gap-2">
                  <FilterLink href={buildHref({ industry: activeIndustry, q })} active={!activeDiscipline}>
                    All
                  </FilterLink>
                  {stackGroups.map((group) => (
                    <FilterLink
                      key={group.id}
                      href={buildHref({ discipline: group.id, industry: activeIndustry, q })}
                      active={activeDiscipline === group.id}
                    >
                      {group.label}
                    </FilterLink>
                  ))}
                </nav>
                <div className="flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center">
                  {industries.length > 0 ? (
                    <>
                      <label className="sr-only" htmlFor="work-industry">
                        Industry
                      </label>
                      <select
                        id="work-industry"
                        value={activeIndustry ?? ""}
                        onChange={(event) => {
                          const next = event.target.value;
                          router.push(buildHref({ discipline: activeDiscipline, industry: next || undefined, q }));
                        }}
                        className="h-10 w-full max-w-full rounded-[5px] border border-line bg-white px-3 text-sm font-medium text-ink-900 outline-none focus:border-brand-500 sm:w-auto"
                      >
                        <option value="">Industries</option>
                        {industries.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </>
                  ) : null}
                  <form action="/work" role="search" className="relative w-full sm:w-64">
                    {activeDiscipline ? <input type="hidden" name="discipline" value={activeDiscipline} /> : null}
                    {activeIndustry ? <input type="hidden" name="industry" value={activeIndustry} /> : null}
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
                    <input
                      name="q"
                      defaultValue={q}
                      placeholder="Search projects"
                      aria-label="Search projects"
                      className="h-10 w-full rounded-[5px] border border-line bg-white py-2 pl-9 pr-3 text-sm text-ink-900 outline-none focus:border-brand-500"
                    />
                  </form>
                </div>
              </div>

              {term || activeDiscipline || activeIndustry ? (
                <p className="mt-6 text-center text-sm text-body">
                  {`${matched.length} ${matched.length === 1 ? "project" : "projects"}${activeLabel ? ` in ${activeLabel}` : ""}${activeIndustry ? ` for ${activeIndustry}` : ""}${term ? ` matching "${q}"` : ""}. `}
                  <Link href="/work" className="font-medium text-brand-600 hover:underline">
                    Clear filters
                  </Link>
                </p>
              ) : null}

              {visible.length > 0 ? (
                <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {visible.map((item) => (
                    <WorkCard key={item.id} item={item} />
                  ))}
                </div>
              ) : (
                <p className="mx-auto mt-10 max-w-xl text-center text-lg leading-relaxed text-body">
                  No published project matches this yet.{" "}
                  <Link href="/contact" className="font-medium text-brand-600 hover:underline">
                    Ask us
                  </Link>{" "}
                  about work we have not put on the site.
                </p>
              )}

              {pages > 1 ? (
                <nav aria-label="Projects pages" className="mt-10 flex items-center justify-center gap-2">
                  {Array.from({ length: pages }, (_, index) => {
                    const number = index + 1;
                    const on = number === current;
                    return (
                      <Link
                        key={number}
                        href={buildHref({ discipline: activeDiscipline, industry: activeIndustry, q, page: number })}
                        aria-current={on ? "page" : undefined}
                        className={cn(
                          "inline-flex h-10 min-w-10 items-center justify-center rounded-[5px] px-3 text-sm font-medium",
                          on ? "bg-brand-500 text-white" : "border border-line text-body hover:border-brand-300",
                        )}
                      >
                        {number}
                      </Link>
                    );
                  })}
                </nav>
              ) : null}
            </>
          )}
      </Container>
    </section>
  );
}

function FilterLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex h-10 items-center rounded-[5px] px-4 text-sm font-medium transition-colors",
        active ? "bg-brand-500 text-white" : "border border-line text-body hover:border-brand-300 hover:text-ink-900",
      )}
    >
      {children}
    </Link>
  );
}

export function WorkIndexFromUrl({ work }: { work: WorkCardData[] }) {
  const params = useSearchParams();
  const page = Number(params.get("page") || "1");
  return (
    <WorkIndex
      work={work}
      discipline={params.get("discipline") ?? undefined}
      industry={params.get("industry") ?? undefined}
      service={params.get("service") ?? undefined}
      q={params.get("q") ?? undefined}
      page={Number.isFinite(page) && page > 0 ? page : 1}
    />
  );
}
