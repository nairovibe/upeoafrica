export type LeadAnswer = { label: string; value: string };
export type LeadDetails = { form: string; answers: LeadAnswer[] };
export type LeadUtm = Partial<Record<(typeof UTM_KEYS)[number], string>>;

export const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;

const STORE_KEY = "upeo:lead-context";

type Stored = { utm: LeadUtm; referrer: string };

export function answer(label: string, value: string | string[] | null | undefined): LeadAnswer {
  const text = Array.isArray(value) ? value.join(", ") : (value ?? "");
  return { label, value: text.trim() };
}

function read(): Stored | null {
  try {
    const raw = window.sessionStorage.getItem(STORE_KEY);
    return raw ? (JSON.parse(raw) as Stored) : null;
  } catch {
    return null;
  }
}

/** Saves first-touch UTM params and the landing referrer once per browser session. */
export function captureLeadContext() {
  if (typeof window === "undefined" || read()) return;
  const params = new URLSearchParams(window.location.search);
  const utm: LeadUtm = {};
  for (const key of UTM_KEYS) {
    const value = params.get(key)?.trim();
    if (value) utm[key] = value.slice(0, 200);
  }
  let referrer = "";
  try {
    if (document.referrer && new URL(document.referrer).host !== window.location.host) referrer = document.referrer;
  } catch {}
  try {
    window.sessionStorage.setItem(STORE_KEY, JSON.stringify({ utm, referrer } satisfies Stored));
  } catch {}
}

export function leadContext() {
  captureLeadContext();
  const stored = read();
  return {
    page_url: window.location.href,
    referrer: stored?.referrer ?? "",
    utm: stored?.utm ?? {},
  };
}
