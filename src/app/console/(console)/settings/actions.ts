"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { PUBLIC_TAG } from "@/lib/public-cache";
import { getStaff } from "@/lib/cms";
import { createClient } from "@/lib/supabase/server";
import { currentSessionId } from "@/lib/sessions";

type Rpc = {
  rpc: (fn: string, args?: Record<string, string>) => Promise<{ error: { message: string } | null }>;
};

export async function saveProfile(input: { fullName: string; avatarPath: string }): Promise<{ ok: true } | { ok: false; error: string }> {
  const staff = await getStaff();
  if (!staff) return { ok: false, error: "Sign in again." };
  const fullName = input.fullName.trim();
  if (fullName.length < 2) return { ok: false, error: "Add your name." };
  const avatar = input.avatarPath.trim() || null;
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ full_name: fullName, avatar_path: avatar }).eq("id", staff.id);
  if (error) return { ok: false, error: error.message };
  await supabase.from("articles").update({ author_name: fullName, author_photo_path: avatar }).eq("author_id", staff.id);
  revalidateTag(PUBLIC_TAG, { expire: 0 });
  revalidatePath("/blogs", "layout");
  revalidatePath("/console", "layout");
  revalidatePath("/console/settings");
  return { ok: true };
}

export async function revokeSession(sessionId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const staff = await getStaff();
  if (!staff) return { ok: false, error: "Sign in again." };
  if (!sessionId) return { ok: false, error: "That session is missing." };
  const supabase = await createClient();
  const { error } = await (supabase as unknown as Rpc).rpc("revoke_my_session", { target: sessionId });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function signOutOtherDevices(): Promise<{ ok: true } | { ok: false; error: string }> {
  const staff = await getStaff();
  if (!staff) return { ok: false, error: "Sign in again." };
  const keep = await currentSessionId();
  const supabase = await createClient();
  if (!keep) {
    const { error } = await supabase.auth.signOut({ scope: "others" });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }
  const { data, error } = await (supabase as unknown as { rpc: (fn: string) => Promise<{ data: { id: string }[] | null; error: { message: string } | null }> }).rpc(
    "my_login_sessions",
  );
  if (error) return { ok: false, error: error.message };
  for (const row of data ?? []) {
    if (row.id === keep) continue;
    const revoked = await (supabase as unknown as Rpc).rpc("revoke_my_session", { target: row.id });
    if (revoked.error) return { ok: false, error: revoked.error.message };
  }
  return { ok: true };
}
