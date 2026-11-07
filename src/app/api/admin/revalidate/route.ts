import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { getStaff } from "@/lib/cms";
import { PUBLIC_TAG } from "@/lib/public-cache";

export async function POST() {
  const staff = await getStaff();
  if (!staff) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  revalidateTag(PUBLIC_TAG, { expire: 0 });
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
