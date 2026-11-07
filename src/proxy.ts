import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const CONSOLE_HOST = (process.env.NEXT_PUBLIC_CONSOLE_HOST || "console.upeoafricatechnologies.co.ke").toLowerCase();

function hostname(request: NextRequest) {
  const raw = request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
  return raw.split(",")[0].trim().split(":")[0].toLowerCase();
}

/** Session check for the console only. Public pages are served without a function. */
export async function proxy(request: NextRequest) {
  const response = await updateSession(request);
  if (hostname(request) === CONSOLE_HOST) response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = {
  matcher: ["/console", "/console/:path*"],
};
