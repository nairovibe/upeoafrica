export function compact(n: number) {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `${+(n / 1_000_000).toFixed(abs >= 10_000_000 ? 0 : 1)}M`;
  if (abs >= 1_000) return `${+(n / 1_000).toFixed(abs >= 10_000 ? 0 : 1)}k`;
  return String(Math.round(n));
}

export function trend(current: number, previous: number): { text: string; tone: "up" | "down" | "neutral" } {
  if (current === 0 && previous === 0) return { text: "Same as last week", tone: "neutral" };
  if (previous === 0) return { text: "New this week", tone: "up" };
  const pct = Math.round(((current - previous) / previous) * 100);
  if (pct === 0) return { text: "Same as last week", tone: "neutral" };
  return { text: `${pct > 0 ? "+" : ""}${pct}% vs last week`, tone: pct > 0 ? "up" : "down" };
}

export function percent(part: number, whole: number) {
  return whole > 0 ? Math.round((part / whole) * 100) : 0;
}
