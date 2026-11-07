import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function page(message: string, status: number) {
  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Unsubscribe</title></head><body style="margin:0;font-family:Arial,Helvetica,sans-serif;background:#fff;color:#0b0e14"><main style="max-width:32rem;margin:4rem auto;padding:0 1.25rem"><p style="font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#f97316">Upeo Africa Technologies</p><h1 style="font-size:28px;line-height:1.2;margin:12px 0">Mailing list</h1><p style="font-size:16px;line-height:1.6;color:#414b5a">${message}</p></main></body></html>`;
  return new NextResponse(html, { status, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") ?? "";
  if (!UUID.test(token)) return page("This unsubscribe link is not valid.", 400);

  const supabase = await createServiceClient();
  if (!supabase) return page("Unsubscribe is not available right now. Write to hello@upeoafricatechnologies.co.ke.", 503);

  const { data } = await supabase
    .from("newsletter_subscribers")
    .select("id, status")
    .eq("unsubscribe_token", token)
    .maybeSingle();
  if (!data) return page("This address is not on the list.", 404);

  if (data.status !== "unsubscribed") {
    await supabase
      .from("newsletter_subscribers")
      .update({ status: "unsubscribed", unsubscribed_at: new Date().toISOString() })
      .eq("id", data.id);
  }

  return page("You are unsubscribed. This address will not receive the list.", 200);
}
