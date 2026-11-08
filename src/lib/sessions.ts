import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export type LoginSession = {
  id: string;
  device: string;
  place: string;
  seen: string;
  current: boolean;
};

type SessionQuery = {
  from: (table: string) => {
    upsert: (
      values: Record<string, string>,
      options: { onConflict: string },
    ) => Promise<{ error: { message: string } | null }>;
  };
  rpc: (fn: string) => Promise<{ data: RawSession[] | null; error: { message: string } | null }>;
};

type RawSession = {
  id: string;
  user_agent: string | null;
  ip: string | null;
  created_at: string;
  updated_at: string;
  place: string | null;
  device: string | null;
};

export function deviceLabel(ua: string) {
  const browser = /Edg\//.test(ua)
    ? "Edge"
    : /Chrome\//.test(ua)
      ? "Chrome"
      : /Firefox\//.test(ua)
        ? "Firefox"
        : /Safari\//.test(ua) && !/Chrome\//.test(ua)
          ? "Safari"
          : "Browser";
  const os = /Windows/.test(ua)
    ? "Windows"
    : /Mac OS X/.test(ua)
      ? "macOS"
      : /Android/.test(ua)
        ? "Android"
        : /iPhone|iPad/.test(ua)
          ? "iOS"
          : "Unknown device";
  return `${browser} on ${os}`;
}

export function sessionIdFromAccessToken(token: string) {
  const part = token.split(".")[1];
  if (!part) return null;
  try {
    const json = JSON.parse(Buffer.from(part, "base64url").toString("utf8")) as { session_id?: unknown };
    return typeof json.session_id === "string" ? json.session_id : null;
  } catch {
    return null;
  }
}

function placeFrom(h: Headers) {
  const city = h.get("x-vercel-ip-city");
  const region = h.get("x-vercel-ip-country-region");
  const country = h.get("x-vercel-ip-country");
  const named = [city, region, country]
    .filter((value): value is string => Boolean(value))
    .map((value) => {
      try {
        return decodeURIComponent(value);
      } catch {
        return value;
      }
    });
  if (named.length) return named.join(", ");
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "";
  if (!ip || ip === "127.0.0.1" || ip === "::1" || ip === "local") return "This computer";
  return ip;
}

export async function currentSessionId() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return null;
  return sessionIdFromAccessToken(session.access_token);
}

/** Record this browser against the auth session. Place comes from the host, never a guessed city. */
export async function rememberThisDevice(userId: string) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session || session.user.id !== userId) return;
  const sessionId = sessionIdFromAccessToken(session.access_token);
  if (!sessionId) return;
  const h = await headers();
  const ua = h.get("user-agent") ?? "";
  const db = supabase as unknown as SessionQuery;
  await db.from("staff_session_places").upsert(
    {
      session_id: sessionId,
      user_id: userId,
      place: placeFrom(h),
      device: deviceLabel(ua),
      last_seen_at: new Date().toISOString(),
    },
    { onConflict: "session_id" },
  );
}

export async function listLoginSessions(): Promise<LoginSession[]> {
  const supabase = await createClient();
  const current = await currentSessionId();
  const db = supabase as unknown as SessionQuery;
  const { data, error } = await db.rpc("my_login_sessions");
  if (error || !data) return [];
  return data.map((row) => ({
    id: row.id,
    device: row.device || deviceLabel(row.user_agent ?? ""),
    place: row.place || (row.ip ? row.ip : "Location unavailable"),
    seen: row.updated_at || row.created_at,
    current: row.id === current,
  }));
}
