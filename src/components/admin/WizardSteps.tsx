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
    <ol className="flex flex-wrap gap-2" aria-label="Steps">
      {steps.map((label, index) => {
        const active = index === current;
        return (
          <li key={label}>
            <button
              type="button"
              aria-current={active ? "step" : undefined}
              onClick={() => onPick(index)}
              className={cn(
                "inline-flex h-9 cursor-pointer items-center gap-2 rounded-[5px] border px-3 text-[13px] font-medium transition-colors duration-200",
                active
                  ? "border-brand-500 bg-brand-500 text-white"
                  : "border-line bg-white text-ink-900 hover:border-brand-300",
              )}
            >
              <span className={cn("tabular-nums", active ? "text-white/80" : "text-muted")}>{index + 1}</span>
              {label}
            </button>
          </li>
        );
      })}
    </ol>
  );
}
