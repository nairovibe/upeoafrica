import { createClient } from "@/lib/supabase/client";
import type { TablesUpdate } from "@/lib/database.types";

export type ActivityKind = "note" | "status" | "email" | "call" | "meeting";

export async function logActivity(leadId: string, kind: ActivityKind, body: string) {
  const { error } = await createClient().from("lead_activity").insert({ lead_id: leadId, kind, body });
  return !error;
}

/** Writes the status and logs the change. Extra fields ride on the same update. */
export async function setLeadStatus(
  leadId: string,
  from: string,
  to: string,
  extra: TablesUpdate<"leads"> = {},
) {
  const { error } = await createClient()
    .from("leads")
    .update({ ...extra, status: to })
    .eq("id", leadId);
  if (error) return false;
  if (from !== to) await logActivity(leadId, "status", `Moved from ${from} to ${to}.`);
  return true;
}
