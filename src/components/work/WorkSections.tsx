import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Quote } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { needsUnoptimized } from "@/components/work/format";
import { StackMarks } from "@/components/work/StackMarks";
import type { WorkCard, WorkDetail } from "@/lib/cms";
import { groupsForStack } from "@/lib/stack";

function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function WorkFacts({ item }: { item: WorkDetail }) {
  const facts: { label: string; value: React.ReactNode }[] = [];
  if (item.confidential) facts.push({ label: "Client", value: "Protected by NDA" });
  else if (item.client?.name) facts.push({ label: "Client", value: item.client.name });
  if (item.project_year) facts.push({ label: "Year", value: item.project_year });
  if (item.role) facts.push({ label: "Our role", value: item.role });
  if (item.industry) {
    facts.push({
      label: "Industry",
      value: (
        <Link href={`/work?industry=${encodeURIComponent(item.industry)}`} className="hover:text-brand-600">
          {item.industry}
        </Link>
      ),
    });
  }
  if (!item.confidential && item.project_url) {
    facts.push({
      label: "Live",
      value: (
        <a href={item.project_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-brand-600 hover:underline">
          {hostOf(item.project_url)}
          <ArrowUpRight className="h-4 w-4" aria-hidden />
        </a>
      ),
    });
  }
  if (!facts.length) return null;
  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[5px] border border-line bg-line sm:grid-cols-3 lg:grid-flow-col lg:auto-cols-fr lg:grid-cols-none">
      {facts.map((f) => (
        <div key={f.label} className="bg-white px-5 py-4">
          <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">{f.label}</dt>
          <dd className="mt-1.5 truncate text-[15px] font-medium text-ink-900">{f.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function WorkScope({ services, tech }: { services: string[]; tech: string[] }) {
  if (!services.length && !tech.length) return null;
  const groups = groupsForStack(tech);
  const known = new Set(groups.flatMap((group) => group.items.map((item) => item.name.toLowerCase())));
  const other = tech.filter((name) => !known.has(name.toLowerCase()));
  return (
    <div className="space-y-8">
      {services.length ? (
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Services</h2>
          <ul className="mt-3 divide-y divide-line border-y border-line">
            {services.map((s) => (
              <li key={s}>
                <Link
                  href={`/work?q=${encodeURIComponent(s)}`}
                  className="flex items-center justify-between gap-3 py-2.5 text-[15px] text-ink-900 hover:text-brand-600"
                >
                  {s}
                  <ArrowRight className="h-3.5 w-3.5 text-muted" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {tech.length ? (
        <div className="space-y-5">
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Built with</h2>
          {groups.map((group) => {
            const names = group.items
              .filter((item) => tech.some((name) => name.toLowerCase() === item.name.toLowerCase()))
              .map((item) => item.name);
            return (
              <div key={group.id}>
                <h3 className="text-sm font-medium text-ink-900">{group.label}</h3>
                <div className="mt-2">
                  <StackMarks names={names} />
                </div>
              </div>
            );
          })}
          {other.length ? <StackMarks names={other} /> : null}
        </div>
      ) : null}
    </div>
  );
}

export function WorkResults({ outcomes }: { outcomes: string[] }) {
  if (!outcomes.length) return null;
  return (
    <section className="bg-surface-2 py-16 lg:py-20">
      <Container className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
        <h2 className="font-display text-3xl font-bold leading-[1.08] text-ink-900 sm:text-4xl">Results</h2>
        <ol className="divide-y divide-line border-y border-line">
          {outcomes.map((o, i) => (
            <li key={i} className="flex items-baseline gap-5 py-5">
              <span className="font-display text-sm tabular-nums text-brand-500">{String(i + 1).padStart(2, "0")}</span>
              <span className="text-lg leading-relaxed text-ink-900">{o}</span>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}

export function WorkGallery({ images, title }: { images: string[]; title: string }) {
  if (!images.length) return null;
  const [lead, ...rest] = images;
  return (
    <div className="space-y-4">
      <div className="relative aspect-[16/9] overflow-hidden rounded-[5px] bg-surface-2">
        <Image
          src={lead}
          alt={`${title}, screen 1`}
          fill
          sizes="(min-width: 1280px) 1200px, 100vw"
          className="object-cover"
          unoptimized={needsUnoptimized(lead)}
        />
      </div>
      {rest.length ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {rest.map((src, i) => (
            <div key={`${src}-${i}`} className="relative aspect-[4/3] overflow-hidden rounded-[5px] bg-surface-2">
              <Image
                src={src}
                alt={`${title}, screen ${i + 2}`}
                fill
                sizes="(min-width: 640px) 50vw, 100vw"
                className="object-cover"
                unoptimized={needsUnoptimized(src)}
              />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function WorkTestimonial({ quote, author, title }: { quote: string; author: string | null; title: string | null }) {
  return (
    <figure className="mx-auto max-w-3xl text-center">
      <Quote className="mx-auto h-8 w-8 text-brand-500" aria-hidden />
      <blockquote className="mt-6 font-display text-2xl font-semibold leading-snug text-ink-900 sm:text-3xl">
        {quote}
      </blockquote>
      {author || title ? (
        <figcaption className="mt-6 text-sm text-body">
          {author ? <span className="font-semibold text-ink-900">{author}</span> : null}
          {author && title ? ", " : null}
          {title}
        </figcaption>
      ) : null}
    </figure>
  );
}

export function NextProject({ item }: { item: WorkCard }) {
  return (
    <Link
      href={`/work/${item.slug}`}
      className="group flex items-center justify-between gap-6 border-y border-line py-8 transition-colors hover:border-brand-300"
    >
      <span className="min-w-0">
        <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-muted">Next project</span>
        <span className="mt-2 block truncate font-display text-2xl font-bold text-ink-900 group-hover:text-brand-600 sm:text-3xl">
          {item.title}
        </span>
        {item.client?.name || item.industry ? (
          <span className="mt-1 block text-sm text-muted">{[item.client?.name, item.industry].filter(Boolean).join(" · ")}</span>
        ) : null}
      </span>
      <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-[5px] border border-line text-ink-900 transition-colors group-hover:border-brand-500 group-hover:bg-brand-500 group-hover:text-white">
        <ArrowRight className="h-5 w-5" aria-hidden />
      </span>
    </Link>
  );
}
