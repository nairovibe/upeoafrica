import type { PillTone } from "@/components/admin/ui";
import type { Lead } from "@/lib/cms";
import { UTM_KEYS, type LeadAnswer } from "@/lib/lead-context";

export const SOURCES = [
  { id: "contact", value: "contact_form", label: "Contact" },
  { id: "wizard", value: "inquiry", label: "Project wizard" },
  { id: "founders", value: "founders", label: "Founders" },
  { id: "event", value: "event", label: "Event" },
] as const;

export function sourceLabel(source: string) {
  return SOURCES.find((s) => s.value === source)?.label ?? source;
}

export function sourceTone(source: string): PillTone {
  if (source === "inquiry") return "brand";
  if (source === "founders") return "ink";
  if (source === "event") return "warning";
  return "neutral";
}

export function statusTone(status: string): PillTone {
  if (status === "new") return "brand";
  if (status === "contacted") return "warning";
  if (status === "qualified") return "ink";
  if (status === "won") return "success";
  if (status === "lost") return "danger";
  return "neutral";
}

export function formName(lead: Lead) {
  const d = lead.details as { form?: unknown } | null;
  return typeof d?.form === "string" && d.form ? d.form : sourceLabel(lead.source);
}

export function leadAnswers(lead: Lead): LeadAnswer[] {
  const d = lead.details as { answers?: unknown } | null;
  if (Array.isArray(d?.answers) && d.answers.length) {
    return d.answers
      .filter((a): a is { label: string; value?: unknown } => !!a && typeof a.label === "string")
      .map((a) => ({ label: a.label, value: typeof a.value === "string" ? a.value : "" }));
  }
  const classic: [string, string | null][] = [
    ["Email", lead.email],
    ["Phone", lead.phone],
    ["Company", lead.company],
    ["Services", (lead.services ?? []).join(", ")],
    ["Stage", lead.stage],
    ["Timeline", lead.timeline],
    ["Budget", lead.budget],
  ];
  return classic.filter(([, v]) => v).map(([label, value]) => ({ label, value: value ?? "" }));
}

/** The message, unless the answers already show it word for word. */
export function leadMessage(lead: Lead) {
  if (!lead.message) return null;
  const shown = leadAnswers(lead).some((a) => a.value.trim() === lead.message?.trim());
  return shown ? null : lead.message;
}

export function leadUtm(lead: Lead) {
  const raw = (lead.utm ?? {}) as Record<string, unknown>;
  return UTM_KEYS.filter((k) => typeof raw[k] === "string" && raw[k]).map((k) => ({
    key: k.replace("utm_", ""),
    value: raw[k] as string,
  }));
}

export function whatsappHref(phone: string | null) {
  let digits = (phone ?? "").replace(/\D/g, "");
  if (!digits) return null;
  if (digits.length === 10 && digits.startsWith("0")) digits = `254${digits.slice(1)}`;
  if (digits.length === 9 && /^[17]/.test(digits)) digits = `254${digits}`;
  return `https://wa.me/${digits}`;
}

export function telHref(phone: string | null) {
  const clean = (phone ?? "").replace(/[^\d+]/g, "");
  return clean ? `tel:${clean}` : null;
}

export function fullDate(iso: string) {
  return new Date(iso).toLocaleString("en-KE", {
    timeZone: "Africa/Nairobi",
    dateStyle: "medium",
    timeStyle: "short",
  });
}
