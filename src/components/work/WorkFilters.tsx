import Link from "next/link";
import { cn } from "@/lib/utils";

export type WorkFilter = { industry?: string; service?: string };

export function workHref({ industry, service }: WorkFilter) {
  const p = new URLSearchParams();
  if (industry) p.set("industry", industry);
  if (service) p.set("service", service);
  const s = p.toString();
  return `/work${s ? `?${s}` : ""}`;
}

function FilterLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? "page" : undefined}
      className={cn(
        "rounded-[5px] px-3 py-1.5 text-sm font-medium transition-colors",
        active ? "bg-brand-500 text-white" : "border border-line text-body hover:border-brand-300 hover:text-ink-900",
      )}
    >
      {children}
    </Link>
  );
}

function Group({
  label,
  options,
  active,
  hrefFor,
}: {
  label: string;
  options: string[];
  active?: string;
  hrefFor: (value?: string) => string;
}) {
  return (
    <div className="flex flex-col gap-2.5 sm:flex-row sm:items-baseline sm:gap-5">
      <p className="w-20 shrink-0 text-xs font-semibold uppercase tracking-[0.16em] text-muted">{label}</p>
      <nav aria-label={`Filter by ${label.toLowerCase()}`} className="flex flex-wrap gap-2">
        <FilterLink href={hrefFor(undefined)} active={!active}>
          All
        </FilterLink>
        {options.map((o) => (
          <FilterLink key={o} href={hrefFor(o)} active={active === o}>
            {o}
          </FilterLink>
        ))}
      </nav>
    </div>
  );
}

export function WorkFilters({ industries, services, active }: { industries: string[]; services: string[]; active: WorkFilter }) {
  if (industries.length < 2 && services.length < 2) return null;
  return (
    <div className="space-y-4 border-y border-line py-6">
      {industries.length > 1 ? (
        <Group label="Industry" options={industries} active={active.industry} hrefFor={(industry) => workHref({ ...active, industry })} />
      ) : null}
      {services.length > 1 ? (
        <Group label="Service" options={services} active={active.service} hrefFor={(service) => workHref({ ...active, service })} />
      ) : null}
    </div>
  );
}
