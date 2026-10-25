import { NextResponse } from "next/server";
import { getStaff } from "@/lib/cms";
import { firePublishWebhook } from "@/lib/notify";

export async function POST(request: Request) {
  const staff = await getStaff();
  if (!staff || (staff.role !== "owner" && staff.role !== "editor")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = (await request.json()) as {
    type: "article" | "product" | "work";
    title: string;
    url: string;
    excerpt?: string;
  };
  await firePublishWebhook(body);
  return NextResponse.json({ ok: true });
}
