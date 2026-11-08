import type { Json } from "@/lib/database.types";

export const EVENT_TZ = "Africa/Nairobi";

/** Matches the window `create_ticket_order` uses before it raises `event_over`. */
export const EVENT_OVER_GRACE_MS = 12 * 60 * 60 * 1000;

export const EVENT_MODES = [
  { value: "mombasa", label: "In person" },
  { value: "online", label: "Online" },
  { value: "hybrid", label: "Hybrid" },
] as const;

export const EVENT_CATEGORIES = ["Talk", "Workshop", "Bootcamp", "Online session", "Meetup"] as const;

export type Speaker = { name: string; role: string; photo_path?: string };
export type AgendaItem = { time: string; title: string; detail?: string };

export function modeLabel(mode: string) {
  return EVENT_MODES.find((m) => m.value === mode)?.label ?? mode;
}

export function isEventOver(startsAt: string, now = Date.now()) {
  return new Date(startsAt).getTime() < now - EVENT_OVER_GRACE_MS;
}

function part(iso: string, opts: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-GB", { timeZone: EVENT_TZ, ...opts }).format(new Date(iso));
}

export function dateBlock(iso: string) {
  return {
    day: part(iso, { day: "numeric" }),
    month: part(iso, { month: "short" }),
    weekday: part(iso, { weekday: "short" }),
  };
}

export function formatEventDate(iso: string) {
  return part(iso, { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

export function formatEventTime(iso: string) {
  return part(iso, { hour: "2-digit", minute: "2-digit", hour12: false });
}

export function formatEventWhen(startsAt: string, endsAt?: string | null) {
  const start = `${formatEventDate(startsAt)}, ${formatEventTime(startsAt)}`;
  if (!endsAt) return `${start} EAT`;
  const sameDay = formatEventDate(startsAt) === formatEventDate(endsAt);
  return sameDay
    ? `${start} to ${formatEventTime(endsAt)} EAT`
    : `${start} to ${formatEventDate(endsAt)}, ${formatEventTime(endsAt)} EAT`;
}

export function durationLabel(startsAt: string, endsAt?: string | null) {
  if (!endsAt) return null;
  const mins = Math.round((new Date(endsAt).getTime() - new Date(startsAt).getTime()) / 60000);
  if (mins <= 0) return null;
  if (mins < 60) return `${mins} min`;
  if (mins < 24 * 60) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m ? `${h} h ${m} min` : `${h} h`;
  }
  const days = Math.ceil(mins / (24 * 60));
  return `${days} days`;
}

export function mapsUrl(venue: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue)}`;
}

/** Normalises Kenyan mobile numbers (07XX, 01XX, +254, 254) to 254XXXXXXXXX, or null. */
export function normaliseKePhone(input: string) {
  const digits = input.replace(/[^\d]/g, "");
  let n = digits;
  if (/^0[17]\d{8}$/.test(n)) n = `254${n.slice(1)}`;
  else if (/^[17]\d{8}$/.test(n)) n = `254${n}`;
  return /^254[17]\d{8}$/.test(n) ? n : null;
}

export type SalesState = "open" | "soon" | "closed";

export function salesState(
  ticket: { sales_start: string | null; sales_end: string | null },
  now = Date.now(),
): SalesState {
  if (ticket.sales_start && new Date(ticket.sales_start).getTime() > now) return "soon";
  if (ticket.sales_end && new Date(ticket.sales_end).getTime() < now) return "closed";
  return "open";
}

function asArray(value: Json | null | undefined) {
  return Array.isArray(value) ? value : [];
}

function str(value: unknown) {
  return typeof value === "string" ? value : "";
}

export function parseSpeakers(value: Json | null | undefined): Speaker[] {
  return asArray(value)
    .map((raw) => {
      const r = (raw ?? {}) as Record<string, unknown>;
      const photo = str(r.photo_path);
      return { name: str(r.name), role: str(r.role), ...(photo ? { photo_path: photo } : {}) };
    })
    .filter((s) => s.name.trim());
}

export function parseAgenda(value: Json | null | undefined): AgendaItem[] {
  return asArray(value)
    .map((raw) => {
      const r = (raw ?? {}) as Record<string, unknown>;
      const detail = str(r.detail);
      return { time: str(r.time), title: str(r.title), ...(detail ? { detail } : {}) };
    })
    .filter((a) => a.title.trim());
}

export function priceLabel(prices: number[], currency: "KES" | "USD" = "KES") {
  if (prices.length === 0) return null;
  const min = Math.min(...prices);
  if (min <= 0) return prices.some((p) => p > 0) ? "Free and paid" : "Free";
  const amount = currency === "USD" ? `USD ${min.toLocaleString("en-US")}` : `KES ${min.toLocaleString("en-KE")}`;
  return prices.length > 1 && Math.max(...prices) > min ? `From ${amount}` : amount;
}
