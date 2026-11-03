import { NextResponse } from "next/server";

/** Public IndexNow verification file. Contains only the key, which IndexNow requires to be public. */
export function GET() {
  const key = process.env.INDEXNOW_KEY;
  if (!key) return new NextResponse("Not configured", { status: 404 });
  return new NextResponse(key, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
      "X-Robots-Tag": "noindex",
    },
  });
}
