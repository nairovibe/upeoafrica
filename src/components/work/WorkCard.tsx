"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ImageIcon, Lock, Play, Star, X } from "lucide-react";
import { LivePreview } from "@/components/work/LivePreview";
import { StackMarks } from "@/components/work/StackMarks";
import { needsUnoptimized, workByline } from "@/components/work/format";
import type { WorkCard as WorkCardData } from "@/lib/cms";
import { groupsForStack, safeHttpUrl } from "@/lib/stack";
import { publicMediaUrl } from "@/lib/constants";
import { cn } from "@/lib/utils";

function Cover({ src, sizes }: { src: string | null; sizes: string }) {
  return (
    <div className="absolute inset-0 bg-surface-3">
      {src ? (
        <Image src={src} alt="" fill sizes={sizes} unoptimized={needsUnoptimized(src)} className="object-cover" />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center text-ink-900/20">
          <ImageIcon className="h-8 w-8" strokeWidth={1.5} aria-hidden />
        </span>
      )}
    </div>
  );
}

export function WorkCard({ item }: { item: WorkCardData }) {
  const cover = publicMediaUrl(item.cover_path);
  const live = item.confidential ? null : safeHttpUrl(item.project_url);
  const groups = groupsForStack(item.tech_stack ?? []);
  const byline = workByline(item);
  const [hovering, setHovering] = useState(false);
  const [pinned, setPinned] = useState(false);
  const timer = useRef<number | null>(null);
  const playing = Boolean(live) && (hovering || pinned);

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  function armHover() {
    if (!live) return;
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setHovering(true), 280);
  }

  function clearHover() {
    if (timer.current) window.clearTimeout(timer.current);
    setHovering(false);
  }

  return (
    <article
      className="group flex h-full flex-col overflow-hidden rounded-[5px] border border-line bg-white transition-colors duration-200 hover:border-brand-300"
      onMouseEnter={armHover}
      onMouseLeave={clearHover}
      onFocus={armHover}
      onBlur={clearHover}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-surface-3">
        <Cover src={cover} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
        {playing && live ? <LivePreview url={live} label={`${item.title} preview`} /> : null}
        <Link href={`/work/${item.slug}`} tabIndex={-1} aria-hidden className="absolute inset-0 z-10" />
        <div className="pointer-events-none absolute left-3 top-3 z-20 flex flex-wrap gap-1.5">
          {item.confidential ? (
            <span className="inline-flex items-center gap-1 rounded-[5px] bg-ink-950/90 px-2 py-1 text-[11px] font-semibold text-white">
              <Lock className="h-3 w-3" aria-hidden />
              Under NDA
            </span>
          ) : null}
          {item.featured ? (
            <span className="inline-flex items-center gap-1 rounded-[5px] bg-white/95 px-2 py-1 text-[11px] font-semibold text-ink-900">
              <Star className="h-3 w-3 fill-brand-500 text-brand-500" aria-hidden />
              Featured
            </span>
          ) : null}
        </div>
        {live ? (
          <button
            type="button"
            onClick={() => setPinned((on) => !on)}
            className={cn(
              "absolute bottom-3 right-3 z-20 inline-flex h-9 items-center gap-1.5 rounded-[5px] px-2.5 text-xs font-medium shadow-sm",
              pinned ? "bg-ink-950 text-white" : "bg-white/95 text-ink-900",
            )}
            aria-pressed={pinned}
          >
            {pinned ? <X className="h-3.5 w-3.5" aria-hidden /> : <Play className="h-3.5 w-3.5" aria-hidden />}
            {pinned ? "Close preview" : "Preview"}
          </button>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-5">
        {groups.length || item.industry ? (
          <p className="flex flex-wrap items-center gap-x-2 text-xs font-semibold text-brand-600">
            {groups.length ? <span>{groups.map((group) => group.label).join(" · ")}</span> : null}
            {groups.length && item.industry ? <span className="text-ink-900/20" aria-hidden>/</span> : null}
            {item.industry ? <span className={groups.length ? "font-medium text-muted" : undefined}>{item.industry}</span> : null}
          </p>
        ) : null}
        <h3 className="mt-1.5 font-display text-lg font-semibold leading-snug text-ink-900">
          <Link href={`/work/${item.slug}`} className="hover:text-brand-600">
            {item.title}
          </Link>
        </h3>
        {byline ? <p className="mt-1 text-xs text-muted">{byline}</p> : null}
        {item.summary ? <p className="mt-2 line-clamp-3 text-[15px] leading-relaxed text-body">{item.summary}</p> : null}
        {item.tech_stack?.length ? (
          <div className="mt-auto pt-5">
            <StackMarks names={item.tech_stack} />
          </div>
        ) : null}
      </div>
    </article>
  );
}
