import { priceCurrency } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function MoneyFigure({
  amount,
  currency,
  from = false,
  size = "md",
  tone = "ink",
}: {
  amount: number;
  currency: string | null | undefined;
  from?: boolean;
  size?: "md" | "lg" | "xl";
  tone?: "ink" | "light";
}) {
  const code = priceCurrency(currency);
  const value = amount.toLocaleString(code === "USD" ? "en-US" : "en-KE");
  const quiet = tone === "light" ? "text-white/70" : "text-muted";
  const strong = tone === "light" ? "text-white" : "text-ink-900";
  const amountSize = size === "xl" ? "text-5xl" : size === "lg" ? "text-4xl" : "text-2xl";

  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-1.5">
      {from ? <span className={cn("text-[11px] font-medium uppercase tracking-[0.16em]", quiet)}>From</span> : null}
      <span className={cn("text-sm font-semibold uppercase tracking-[0.08em]", quiet)}>{code}</span>
      <span className={cn("font-display font-semibold leading-none", amountSize, strong)}>{value}</span>
    </span>
  );
}
