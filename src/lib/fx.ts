export type FxQuote = {
  rate: number;
  asOf: string;
  source: string;
};

const SOURCE = "ExchangeRate-API";
const ENDPOINT = "https://open.er-api.com/v6/latest/USD";
const TTL = 30 * 60 * 1000;

let cached: { quote: FxQuote; at: number } | null = null;

/** Live shillings per one US dollar. Refuses to invent a rate when the source is down. */
export async function usdToKesQuote(): Promise<FxQuote | null> {
  if (cached && Date.now() - cached.at < TTL) return cached.quote;
  const response = await fetch(ENDPOINT, { cache: "no-store" }).catch(() => null);
  if (!response?.ok) return cached?.quote ?? null;
  const json = (await response.json().catch(() => null)) as {
    result?: string;
    rates?: { KES?: number };
    time_last_update_utc?: string;
  } | null;
  const rate = json?.rates?.KES;
  if (json?.result !== "success" || typeof rate !== "number" || !(rate > 0)) return cached?.quote ?? null;
  const quote = { rate, asOf: json.time_last_update_utc || new Date().toISOString(), source: SOURCE };
  cached = { quote, at: Date.now() };
  return quote;
}

export function kesFromUsd(usd: number, rate: number) {
  return Math.round(usd * rate);
}
