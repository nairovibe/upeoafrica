"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LEAD_STATUSES } from "@/lib/constants";
import { inputClass } from "@/components/admin/ui";

export function LeadStatus({ id, value }: { id: string; value: string }) {
  const router = useRouter();
  return (
    <select
      defaultValue={value}
      className={inputClass + " w-auto min-w-[8.5rem] py-1.5"}
      onChange={async (e) => {
        const supabase = createClient();
        await supabase.from("leads").update({ status: e.target.value }).eq("id", id);
        router.refresh();
      }}
    >
      {LEAD_STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
