export const BUDGET_BANDS = [
  "Not sure yet",
  "Under KES 150k",
  "KES 150k to 500k",
  "KES 500k to 2M",
  "Over KES 2M",
] as const;

/** Shown when an address is refused. Does not name the allowed domains. */
export const STAFF_ACCESS_DENIED =
  "This desk is reserved for people who already work here. Use the address we issued you.";

/** Must match Authentication → Email → OTP length in Supabase. */
export const AUTH_OTP_LENGTH = 8;

export type PasswordCheck = { id: string; label: string; ok: boolean };

export function passwordChecks(password: string): PasswordCheck[] {
  return [
    { id: "len", label: "At least 8 characters", ok: password.length >= 8 },
    { id: "lower", label: "A lowercase letter", ok: /[a-z]/.test(password) },
    { id: "upper", label: "An uppercase letter", ok: /[A-Z]/.test(password) },
    { id: "num", label: "A number", ok: /\d/.test(password) },
    { id: "sym", label: "A symbol", ok: /[^A-Za-z0-9]/.test(password) },
  ];
}

export function passwordScore(password: string) {
  const passed = passwordChecks(password).filter((c) => c.ok).length;
  if (password.length === 0) return { passed, label: "", tone: "muted" as const };
  if (passed <= 2) return { passed, label: "Too thin", tone: "weak" as const };
  if (passed === 3) return { passed, label: "Getting there", tone: "fair" as const };
  if (passed === 4) return { passed, label: "Strong", tone: "good" as const };
  return { passed, label: "Solid", tone: "solid" as const };
}

export function isPasswordAcceptable(password: string) {
  const checks = passwordChecks(password);
  const required = checks.filter((c) => c.id !== "sym");
  return required.every((c) => c.ok);
}

export const LEAD_STATUSES = ["new", "contacted", "qualified", "won", "lost"] as const;

export const PRODUCT_TYPES = ["plugin", "download", "saas"] as const;

export const EXPERT_DISCIPLINES = [
  { value: "leadership", label: "Leadership" },
  { value: "engineering", label: "Engineering" },
  { value: "design", label: "Design" },
  { value: "marketing", label: "Marketing" },
] as const;

export const PARTNER_RELATIONSHIPS = [
  { value: "official_dev_partner", label: "Official development partner" },
  { value: "technology", label: "Technology" },
  { value: "other", label: "Other" },
] as const;

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function publicMediaUrl(path: string | null | undefined) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base}/storage/v1/object/public/public-media/${path.replace(/^\/+/, "")}`;
}

export function formatKes(amount: number) {
  return `KES ${amount.toLocaleString("en-KE")}`;
}

export function formatKesMoney(amount: number) {
  return `KES ${Number(amount || 0).toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
