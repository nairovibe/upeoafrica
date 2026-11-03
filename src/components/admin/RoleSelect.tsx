"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AdminBtn, inputClass } from "@/components/admin/ui";
import { Modal } from "@/components/admin/studio/controls";

const ROLES = [
  { value: "owner", label: "Owner" },
  { value: "editor", label: "Editor" },
  { value: "sales", label: "Sales" },
] as const;

export function RoleSelect({
  id,
  value,
  disabled,
  lastOwner,
  self,
}: {
  id: string;
  value: string;
  disabled?: boolean;
  lastOwner?: boolean;
  self?: boolean;
}) {
  const router = useRouter();
  const [role, setRole] = useState(value);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);

  async function apply(next: string) {
    setPending(null);
    setBusy(true);
    setErr(null);
    const prev = role;
    setRole(next);
    const { error } = await createClient().from("profiles").update({ role: next }).eq("id", id);
    setBusy(false);
    if (error) {
      setRole(prev);
      return setErr(error.message);
    }
    router.refresh();
  }

  function onSelect(next: string) {
    if (next === role) return;
    if (role === "owner" && lastOwner) {
      setErr("Make someone else an owner first.");
      return;
    }
    if (self && role === "owner") return setPending(next);
    apply(next);
  }

  return (
    <div>
      <select
        value={role}
        disabled={disabled || busy}
        aria-label="Role"
        className={inputClass + " w-auto py-1.5"}
        onChange={(e) => onSelect(e.target.value)}
      >
        {ROLES.map((r) => (
          <option key={r.value} value={r.value} disabled={lastOwner && role === "owner" && r.value !== "owner"}>
            {r.label}
          </option>
        ))}
      </select>
      {err ? <p className="mt-1 text-xs text-red-600">{err}</p> : null}
      <Modal
        open={pending !== null}
        onClose={() => setPending(null)}
        title="Give up owner access?"
        footer={
          <>
            <AdminBtn variant="ghost" onClick={() => setPending(null)}>
              Cancel
            </AdminBtn>
            <AdminBtn onClick={() => pending && apply(pending)}>Change my role</AdminBtn>
          </>
        }
      >
        <p className="text-sm text-body">You will no longer be able to change settings or roles.</p>
      </Modal>
    </div>
  );
}
