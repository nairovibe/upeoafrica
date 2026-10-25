"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { inputClass } from "@/components/admin/ui";

export function RoleSelect({ id, value, disabled }: { id: string; value: string; disabled?: boolean }) {
  const router = useRouter();
  return (
    <select
      defaultValue={value}
      disabled={disabled}
      className={inputClass + " w-auto py-1.5"}
      onChange={async (e) => {
        const supabase = createClient();
        await supabase.from("profiles").update({ role: e.target.value }).eq("id", id);
        router.refresh();
      }}
    >
      <option value="owner">owner</option>
      <option value="editor">editor</option>
      <option value="sales">sales</option>
    </select>
  );
}
