import { getPublicSettings } from "@/lib/cms";
import { ADSENSE_CLIENT, adsensePublisherId } from "@/lib/adsense";
import { adsenseAccount } from "@/lib/search-presence";

/** Lists the AdSense publisher that is allowed to serve ads on this site. */
export async function GET() {
  const settings = await getPublicSettings();
  const saved = adsenseAccount(settings?.google_adsense_account) || ADSENSE_CLIENT;
  const id = adsensePublisherId(process.env.ADSENSE_PUBLISHER_ID?.trim() || saved);
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
