/**
 * Served only after ADSENSE_PUBLISHER_ID is set, as pub-XXXXXXXXXXXXXXXX.
 * An ads.txt file with a guessed id would fail AdSense review.
 */
export function GET() {
  const id = process.env.ADSENSE_PUBLISHER_ID?.trim().replace(/^ca-/, "") ?? "";
  if (!/^pub-\d+$/.test(id)) {
    return new Response("Not configured", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }
  return new Response(`google.com, ${id}, DIRECT, f08c47fec0942fa0\n`, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
