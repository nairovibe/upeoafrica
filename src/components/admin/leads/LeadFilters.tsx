"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { inputClass } from "@/components/admin/ui";
import { Spinner } from "@/components/admin/pending";
import { SOURCES } from "@/components/admin/leads/data";
import { cn } from "@/lib/utils";

export function LeadFilters({ filter, q, source }: { filter: string; q: string; source: string }) {
  const router = useRouter();
  const [text, setText] = useState(q);
  const [pending, startTransition] = useTransition();

  function go(next: { q?: string; source?: string }) {
    const params = new URLSearchParams();
    if (filter !== "open") params.set("filter", filter);
    const query = (next.q ?? text).trim();
    const src = next.source ?? source;
    if (query) params.set("q", query);
    if (src) params.set("source", src);
    const qs = params.toString();
    startTransition(() => router.push(qs ? `/console/leads?${qs}` : "/console/leads"));
  }

  return (
    <form
      role="search"
      aria-busy={pending || undefined}
      className="flex flex-wrap items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        go({});
      }}
    >
      <label className="relative block">
        <span className="sr-only">Search enquiries</span>
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
          {pending ? <Spinner className="h-4 w-4 text-brand-500" /> : <Search className="h-4 w-4" aria-hidden />}
        </span>
        <input
          type="search"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Name, email or company"
          className={cn(inputClass, "h-9 w-64 py-1.5 pl-9")}
        />
      </label>
      <label>
        <span className="sr-only">Source</span>
        <select
          value={source}
          onChange={(e) => go({ source: e.target.value })}
          disabled={pending}
          className={cn(inputClass, "h-9 w-auto cursor-pointer py-1.5 disabled:opacity-60")}
        >
          <option value="">All sources</option>
          {SOURCES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </label>
    </form>
  );
}
