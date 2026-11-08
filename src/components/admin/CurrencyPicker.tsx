"use client";

import type { PriceCurrency } from "@/lib/constants";
import { cn } from "@/lib/utils";

const CHOICES: { code: PriceCurrency; label: string }[] = [
  { code: "KES", label: "Kenyan shillings" },
  { code: "USD", label: "US dollars" },
];

export function CurrencyPicker({
  value,
  onChange,
}: {
  value: PriceCurrency;
  onChange: (next: PriceCurrency) => void;
}) {
  return (
    <div>
      <p className="mb-1.5 text-[13px] font-medium text-ink-900">Currency</p>
      <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Currency">
        {CHOICES.map((choice) => {
          const on = value === choice.code;
          return (
            <button
              key={choice.code}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onChange(choice.code)}
              className={cn(
                "h-11 cursor-pointer rounded-[5px] border text-sm font-medium transition-colors duration-200",
                on
                  ? "border-brand-500 bg-brand-50 text-ink-900 shadow-[0_0_0_1px_#f97316]"
                  : "border-line bg-white text-body hover:border-brand-300",
              )}
            >
              {choice.label}
            </button>
          );
        })}
      </div>
      <p className="mt-1.5 text-xs text-muted">
        {value === "KES"
          ? "Get it now sends an M-Pesa prompt for this amount."
          : "Shown in US dollars. M-Pesa checkout stays on shilling prices."}
      </p>
    </div>
  );
}
