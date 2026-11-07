import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const CONSOLE_HOST = (process.env.NEXT_PUBLIC_CONSOLE_HOST || "console.upeoafricatechnologies.co.ke").toLowerCase();
const PUBLIC_HOSTS = new Set(["upeoafricatechnologies.co.ke", "www.upeoafricatechnologies.co.ke"]);

function hostname(request: NextRequest) {
  const raw = request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
  return raw.split(",")[0].trim().split(":")[0].toLowerCase();
}

export async function proxy(request: NextRequest) {
  const host = hostname(request);
  const path = request.nextUrl.pathname;

  if (host === CONSOLE_HOST && path === "/robots.txt") {
    return new NextResponse("User-Agent: *\nDisallow: /\n", {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Robots-Tag": "noindex, nofollow",
        "Cache-Control": "public, max-age=3600",
      },
    });
  }

  if (PUBLIC_HOSTS.has(host) && (path === "/console" || path.startsWith("/console/"))) {
    const dest = new URL(path + request.nextUrl.search, `https://${CONSOLE_HOST}`);
    return NextResponse.redirect(dest, 308);
  }

  if (host === CONSOLE_HOST) {
    const asset = path.startsWith("/_next") || path.startsWith("/api") || path === "/favicon.ico" || path === "/icon.png";
    if (!asset && path !== "/console" && !path.startsWith("/console/")) {
      const dest = request.nextUrl.clone();
      dest.pathname = "/console";
      dest.search = "";
      return NextResponse.redirect(dest);
    }
  }

  if (path.startsWith("/console")) {
    const response = await updateSession(request);
    if (host === CONSOLE_HOST) response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
