import { NextResponse } from "next/server";
import { getStaff } from "@/lib/cms";
import { firePublishWebhook } from "@/lib/notify";
import { submitToIndexNow } from "@/lib/indexnow";

export async function POST(request: Request) {
  const staff = await getStaff();
  if (!staff || (staff.role !== "owner" && staff.role !== "editor")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = (await request.json()) as {
    type: "article" | "product" | "work" | "event";
    title: string;
    url: string;
    excerpt?: string;
  };
  await Promise.all([firePublishWebhook(body), submitToIndexNow([body.url])]);
  return NextResponse.json({ ok: true });
}
