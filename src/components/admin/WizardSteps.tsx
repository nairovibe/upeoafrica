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
    <ol className="flex items-start" aria-label="Steps">
      {steps.map((label, index) => {
        const active = index === current;
        const done = index < current;
        const reached = active || done;
        return (
          <li key={label} className="relative flex min-w-0 flex-1 flex-col items-center">
            {index > 0 ? (
              <span
                aria-hidden
                className={cn(
                  "absolute top-4 right-1/2 left-0 h-0.5 -translate-y-1/2",
                  index <= current ? "bg-brand-500" : "bg-line",
                )}
              />
            ) : null}
            {index < steps.length - 1 ? (
              <span
                aria-hidden
                className={cn(
                  "absolute top-4 right-0 left-1/2 h-0.5 -translate-y-1/2",
                  index < current ? "bg-brand-500" : "bg-line",
                )}
              />
            ) : null}
            <button
              type="button"
              aria-current={active ? "step" : undefined}
              onClick={() => onPick(index)}
              className="relative z-10 flex w-full cursor-pointer flex-col items-center gap-2 bg-transparent px-1 text-center"
            >
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold tabular-nums",
                  reached ? "bg-brand-500 text-white" : "bg-white text-muted ring-1 ring-inset ring-line",
                )}
              >
                {index + 1}
              </span>
              <span className="min-w-0">
                <span className="block text-[10px] font-medium uppercase tracking-[0.14em] text-muted sm:text-[11px]">
                  Step {index + 1}
                </span>
                <span className={cn("block text-xs font-medium sm:text-sm", reached ? "text-ink-900" : "text-body")}>
                  {label}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
