import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStaff } from "@/lib/cms";
import { csvCell } from "@/lib/newsletter";

export async function GET(request: Request) {
  const staff = await getStaff();
  if (!staff) return new NextResponse("Sign in required.", { status: 401 });

  const status = new URL(request.url).searchParams.get("status");
  const supabase = await createClient();
  let query = supabase
    .from("newsletter_subscribers")
    .select("email, status, source, created_at, unsubscribed_at")
    .order("created_at", { ascending: false });
  if (status === "subscribed" || status === "unsubscribed") query = query.eq("status", status);

  const { data, error } = await query;
  if (error) return new NextResponse("Could not export the mailing list.", { status: 500 });

  const lines = ["email,status,source,joined,unsubscribed"];
  for (const row of data ?? []) {
    lines.push(
      [row.email, row.status, row.source, row.created_at, row.unsubscribed_at ?? ""].map(csvCell).join(","),
    );
  }

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="mailing-list.csv"',
      "Cache-Control": "no-store",
    },
  });
}
