const EMAIL =
  /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/;

export function normalizeEmail(raw: unknown) {
  if (typeof raw !== "string") return null;
  const email = raw.trim().toLowerCase();
  if (email.length < 6 || email.length > 320 || !EMAIL.test(email)) return null;
  return email;
}

export function csvCell(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}
