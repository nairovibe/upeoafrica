import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ImageIcon } from "lucide-react";
import { publicMediaUrl } from "@/lib/constants";
import type { WorkCard as WorkCardData } from "@/lib/cms";
import { cn } from "@/lib/utils";

/** next/image only optimises hosts listed in next.config; anything else is served as is. */
export function needsUnoptimized(src: string) {
  return !src.includes(".supabase.co/");
}

export function workByline(item: { client: { name: string } | null; project_year: number | null }) {
  return [item.client?.name, item.project_year].filter(Boolean).join(" · ");
}

function Cover({ src, sizes, preload, className }: { src: string | null; sizes: string; preload?: boolean; className?: string }) {
  return (
    <div className={cn("relative overflow-hidden bg-surface-3", className)}>
      {src ? (
        <Image
          src={src}
          alt=""
          fill
          sizes={sizes}
          preload={preload}
          unoptimized={needsUnoptimized(src)}
          className="object-cover transition-transform duration-500 ease-out-expo group-hover:scale-[1.03]"
        />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center text-ink-900/20">
          <ImageIcon className="h-8 w-8" strokeWidth={1.5} aria-hidden />
        </span>
      )}
    </div>
  );
}

function Services({ items, max = 3 }: { items: string[]; max?: number }) {
  if (!items.length) return null;
  const shown = items.slice(0, max);
  const more = items.length - shown.length;
  return (
    <ul className="flex flex-wrap gap-1.5">
      {shown.map((s) => (
        <li key={s} className="rounded-[5px] bg-surface-2 px-2 py-1 text-xs text-body">
          {s}
        </li>
      ))}
      {more > 0 ? <li className="px-1 py-1 text-xs text-muted">+{more} more</li> : null}
    </ul>
  );
}

export function WorkCard({ item }: { item: WorkCardData }) {
  const byline = workByline(item);
  return (
    <Link
      href={`/work/${item.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-[5px] border border-line bg-white transition-colors duration-200 hover:border-brand-300"
    >
      <Cover src={publicMediaUrl(item.cover_path)} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="aspect-[16/10]" />
      <div className="flex flex-1 flex-col p-5">
        <p className="flex flex-wrap items-center gap-x-2 text-xs font-semibold text-brand-600">
          {item.industry ? <span>{item.industry}</span> : null}
          {item.industry && byline ? <span className="text-ink-900/20" aria-hidden>/</span> : null}
          {byline ? <span className="font-medium text-muted">{byline}</span> : null}
        </p>
        <h3 className="mt-1.5 font-display text-lg font-semibold leading-snug text-ink-900 group-hover:text-brand-600">{item.title}</h3>
        {item.summary ? <p className="mt-2 line-clamp-3 text-[15px] leading-relaxed text-body">{item.summary}</p> : null}
        {item.services.length ? (
          <div className="mt-auto pt-5">
            <Services items={item.services} />
          </div>
        ) : null}
      </div>
    </Link>
  );
}

export function FeaturedWork({ item }: { item: WorkCardData }) {
  const byline = workByline(item);
  return (
    <Link
      href={`/work/${item.slug}`}
      className="group grid overflow-hidden rounded-[5px] border border-line bg-white transition-colors hover:border-brand-300 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]"
    >
      <Cover
        src={publicMediaUrl(item.cover_path)}
        sizes="(max-width: 1024px) 100vw, 60vw"
        preload
        className="aspect-[16/10] lg:aspect-auto lg:min-h-[24rem]"
      />
      <div className="flex flex-col justify-center p-6 sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">Featured project</p>
        <h2 className="mt-3 font-display text-2xl font-bold leading-tight text-ink-900 group-hover:text-brand-600 sm:text-3xl">
          {item.title}
        </h2>
        {byline || item.industry ? (
          <p className="mt-2 text-sm text-muted">{[byline, item.industry].filter(Boolean).join(" · ")}</p>
        ) : null}
        {item.summary ? <p className="mt-4 text-lg leading-relaxed text-body">{item.summary}</p> : null}
        {item.services.length ? (
          <div className="mt-6">
            <Services items={item.services} max={5} />
          </div>
        ) : null}
        <span className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-ink-900 group-hover:text-brand-600">
          Read the case study
          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 ease-out-expo group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
        </span>
      </div>
    </Link>
  );
}
