"use client";

import { cn } from "@/lib/utils";

export function WizardSteps({
  steps,
  current,
  onPick,
}: {
  steps: string[];
  current: number;
  onPick: (index: number) => void;
}) {
  return (
    <ol
      className={cn("grid grid-cols-2 gap-3", steps.length > 4 ? "lg:grid-cols-5" : "lg:grid-cols-4")}
      aria-label="Steps"
    >
      {steps.map((label, index) => {
        const active = index === current;
        const done = index < current;
        return (
          <li key={label}>
            <button
              type="button"
              aria-current={active ? "step" : undefined}
              onClick={() => onPick(index)}
              className={cn(
                "flex h-full w-full cursor-pointer items-center gap-3 rounded-[5px] border bg-white px-4 py-3 text-left transition-colors duration-200",
                active ? "border-brand-500 shadow-[0_0_0_1px_#f97316]" : "border-line hover:border-brand-300",
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold tabular-nums",
                  active ? "bg-brand-500 text-white" : done ? "bg-brand-50 text-brand-600" : "bg-surface-2 text-muted",
                )}
              >
                {index + 1}
              </span>
              <span className="min-w-0">
                <span className="block text-[11px] font-medium uppercase tracking-[0.14em] text-muted">Step {index + 1}</span>
                <span className={cn("block truncate text-sm font-medium", active ? "text-ink-900" : "text-body")}>{label}</span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
