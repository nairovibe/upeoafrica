import { getPublicSettings } from "@/lib/cms";
import { adsenseAccount } from "@/lib/search-presence";

/**
 * Served only after a real AdSense publisher id is saved or set in the environment.
 * An ads.txt file with a guessed id would fail AdSense review.
 */
export async function GET() {
  const settings = await getPublicSettings();
  const saved = adsenseAccount(settings?.google_adsense_account);
  const id = (process.env.ADSENSE_PUBLISHER_ID?.trim() || saved).replace(/^ca-/, "");
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
