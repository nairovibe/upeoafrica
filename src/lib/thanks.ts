export type ThanksKind = "enquiry" | "subscribe" | "ticket" | "order" | "download";

export type TicketThanks = {
  code: string | null;
  qty: number;
  email: string;
  eventSlug: string;
};

export type ThanksPayload = {
  c: string;
  kind: ThanksKind;
  value: number | null;
  ticket: TicketThanks | null;
};

const KEY = "upeo-thanks";

export function isThanksKind(value: string | undefined): value is ThanksKind {
  return value === "enquiry" || value === "subscribe" || value === "ticket" || value === "order" || value === "download";
}

export function goToThanks(kind: ThanksKind, extra?: { value?: number; ticket?: TicketThanks }) {
  const c = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  const payload: ThanksPayload = {
    c,
    kind,
    value: extra?.value && extra.value > 0 ? extra.value : null,
    ticket: extra?.ticket ?? null,
  };
  try {
    sessionStorage.setItem(KEY, JSON.stringify(payload));
  } catch {
    /* A private browser can still land on the page. The message does not depend on storage. */
  }
  window.location.assign(`/thank-you?for=${kind}&c=${encodeURIComponent(c)}`);
}

export function readThanks(c: string): ThanksPayload | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ThanksPayload;
    if (!parsed || parsed.c !== c || !isThanksKind(parsed.kind)) return null;
    return parsed;
  } catch {
    return null;
  }
}
