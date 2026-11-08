"use server";

import { revalidatePath } from "next/cache";
import { getStaff } from "@/lib/cms";
import { isBillingMethod, saveBillingMethod, type BillingMethodId } from "@/lib/billing";

export async function saveBilling(input: {
  id: string;
  enabled: boolean;
  publicConfig: Record<string, string>;
  secrets: Record<string, string>;
}) {
  const staff = await getStaff();
  if (!staff || staff.role !== "owner") return { ok: false as const, error: "Only the owner can change billing." };
  if (!isBillingMethod(input.id)) return { ok: false as const, error: "Unknown payment method." };
  const saved = await saveBillingMethod({
    id: input.id as BillingMethodId,
    enabled: input.enabled,
    publicConfig: input.publicConfig,
    secrets: input.secrets,
  });
  if (!saved.ok) return saved;
  revalidatePath("/console/billing");
  return { ok: true as const };
}
