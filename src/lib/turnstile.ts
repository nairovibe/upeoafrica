const ACTIONS = ["login", "signup", "recovery", "contact", "inquiry", "checkout", "ticket"] as const;
export type TurnstileAction = (typeof ACTIONS)[number];

function remoteIp(ip: string) {
  const value = ip.trim();
  const v4 = /^(?:\d{1,3}\.){3}\d{1,3}$/.test(value);
  const v6 = value.includes(":") && /^[0-9a-fA-F:]+$/.test(value);
  return v4 || v6 ? value : undefined;
}

function allowedHostnames() {
  const fromEnv = process.env.TURNSTILE_HOSTNAMES;
  if (fromEnv) {
    return new Set(
      fromEnv
        .split(",")
        .map((h) => h.trim().toLowerCase())
        .filter(Boolean),
    );
  }
  if (process.env.NODE_ENV === "production") {
    return new Set(["upeoafricatechnologies.co.ke"]);
  }
  return new Set(["localhost", "127.0.0.1"]);
}

export async function verifyTurnstile(
  token: string | undefined,
  ip: string,
  expectedAction: TurnstileAction,
) {
  const secret = process.env.TURNSTILE_SECRET_KEY || process.env.TURNSTILE_SECRET;
  if (
    !secret ||
    typeof token !== "string" ||
    token.length === 0 ||
    token.length > 2048 ||
    !ACTIONS.includes(expectedAction)
  ) {
    return false;
  }

  const expectedHostnames = allowedHostnames();
  if (expectedHostnames.size === 0) return false;

  try {
    const body = new URLSearchParams({ secret, response: token });
    const visitor = remoteIp(ip);
    if (visitor) body.set("remoteip", visitor);
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      signal: AbortSignal.timeout(10_000),
      body,
    });
    if (!res.ok) return false;
    const result = (await res.json()) as {
      success?: boolean;
      action?: string;
      hostname?: string;
    };
    const host = (result.hostname ?? "").toLowerCase();
    return (
      result.success === true &&
      result.action === expectedAction &&
      expectedHostnames.has(host)
    );
  } catch {
    return false;
  }
}
