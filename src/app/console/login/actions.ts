"use server";

import { headers } from "next/headers";
import { STAFF_ACCESS_DENIED } from "@/lib/constants";
import { rateLimit } from "@/lib/notify";

const STAFF_EMAIL_DOMAINS = [
  "upeoafricatechnologies.co.ke",
  "averissystems.com",
] as const;

function isStaffEmail(email: string) {
  const host = email.trim().toLowerCase().split("@")[1] ?? "";
  return (STAFF_EMAIL_DOMAINS as readonly string[]).includes(host);
}

export async function guardStaffEmail(email: string) {
  if (!isStaffEmail(email)) {
    return { ok: false as const, message: STAFF_ACCESS_DENIED };
  }
  return { ok: true as const };
}

export async function guardAuthAttempt(token: string) {
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "local";
  if (!rateLimit(`auth:${ip}`, 12, 10 * 60 * 1000)) {
    return { ok: false as const, message: "Too many attempts. Wait a moment, then try again." };
  }
  if (typeof token !== "string" || token.length === 0 || token.length > 2048) {
    return { ok: false as const, message: "Complete the verification check before continuing." };
  }
  return { ok: true as const };
}
