import { parse, serialize, type SerializeOptions } from "cookie";

export const REMEMBER_COOKIE = "upeo-console-remember";
export const REMEMBER_MAX_AGE = 14 * 24 * 60 * 60;

export function isRemembered(value: string | undefined | null) {
  return value === "1";
}

export function withRemember(options: SerializeOptions | undefined, remember: boolean): SerializeOptions {
  const next: SerializeOptions = { path: "/", sameSite: "lax", ...options };
  if (next.maxAge === 0) return next;
  delete next.expires;
  if (remember) next.maxAge = REMEMBER_MAX_AGE;
  else delete next.maxAge;
  return next;
}

export function readRemembered() {
  if (typeof document === "undefined") return false;
  return isRemembered(parse(document.cookie)[REMEMBER_COOKIE]);
}

export function persistRemember(remember: boolean) {
  const secure = window.location.protocol === "https:";
  document.cookie = serialize(REMEMBER_COOKIE, remember ? "1" : "", {
    path: "/",
    sameSite: "lax",
    secure,
    maxAge: remember ? REMEMBER_MAX_AGE : 0,
  });
}

export function clearRemember() {
  if (typeof document === "undefined") return;
  persistRemember(false);
}

export function writeBrowserCookies(
  cookies: { name: string; value: string; options?: SerializeOptions }[],
) {
  const remember = readRemembered();
  for (const { name, value, options } of cookies) {
    document.cookie = serialize(name, value, withRemember(options, remember));
  }
}

export function readBrowserCookies() {
  const parsed = parse(document.cookie);
  return Object.keys(parsed).map((name) => ({ name, value: parsed[name] ?? "" }));
}
