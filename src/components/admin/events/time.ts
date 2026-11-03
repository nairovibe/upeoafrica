/** Nairobi is UTC+3 all year, so datetime-local values are read and written at a fixed offset. */
const OFFSET_MS = 3 * 60 * 60 * 1000;

export function toNairobiInput(iso: string | null | undefined) {
  if (!iso) return "";
  return new Date(new Date(iso).getTime() + OFFSET_MS).toISOString().slice(0, 16);
}

export function fromNairobiInput(value: string) {
  if (!value) return null;
  const d = new Date(`${value}:00+03:00`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export function defaultStartInput() {
  const d = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  return `${toNairobiInput(d.toISOString()).slice(0, 10)}T09:00`;
}
