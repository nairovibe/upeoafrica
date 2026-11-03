"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LEAD_STATUSES } from "@/lib/constants";
import { inputClass } from "@/components/admin/ui";
import { Spinner } from "@/components/admin/pending";
import { setLeadStatus } from "@/components/admin/leads/actions";
import { cn } from "@/lib/utils";

export function LeadStatus({
  id,
  value,
  onChange,
  className,
}: {
  id: string;
  value: string;
  onChange?: (status: string) => void;
  className?: string;
}) {
  const router = useRouter();
  const [current, setCurrent] = useState(value);
  const [busy, setBusy] = useState(false);
  const [refreshing, startRefresh] = useTransition();
  const [seen, setSeen] = useState(value);
  const working = busy || refreshing;

  if (value !== seen) {
    setSeen(value);
    setCurrent(value);
  }

  return (
    <span className={cn("relative inline-flex items-center", className)} aria-busy={working || undefined}>
      <select
        aria-label="Status"
        value={current}
        disabled={working}
        className={cn(inputClass, "w-full min-w-[8.5rem] py-1.5 capitalize disabled:opacity-70", working && "pr-14")}
        onChange={async (e) => {
          const next = e.target.value;
          const prev = current;
          setCurrent(next);
          setBusy(true);
          const ok = await setLeadStatus(id, prev, next);
          setBusy(false);
          if (!ok) return setCurrent(prev);
          onChange?.(next);
          startRefresh(() => router.refresh());
        }}
      >
        {LEAD_STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      {working ? <Spinner className="pointer-events-none absolute right-8 text-brand-500" /> : null}
    </span>
  );
}
