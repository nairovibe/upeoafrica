"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminBtn, Field, Panel, inputClass } from "@/components/admin/ui";
import { FileField } from "@/components/admin/FileField";
import { DangerBtn, Modal, Notice, Toggle } from "@/components/admin/studio/controls";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/constants";
import type { Client } from "@/lib/cms";
import { refreshSite } from "@/lib/refresh-site";
import { startNavProgress } from "@/components/ui/NavProgress";

export function ClientEditor({ initial, readOnly }: { initial?: Client; readOnly?: boolean }) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial));
  const [url, setUrl] = useState(initial?.url ?? "");
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [sortOrder, setSortOrder] = useState(String(initial?.sort_order ?? 0));
  const [logo, setLogo] = useState(initial?.logo_path ?? "");
  const [billingEmail, setBillingEmail] = useState(initial?.billing_email ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [kraPin, setKraPin] = useState(initial?.kra_pin ?? "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function save() {
    if (!name.trim()) return setMsg({ tone: "error", text: "Add the client name first." });
    setBusy(true);
    setMsg(null);
    const supabase = createClient();
    const row = {
      name: name.trim(),
      slug: slugify(slug || name),
      url: url.trim() || null,
      featured,
      sort_order: Number.parseInt(sortOrder, 10) || 0,
      logo_path: logo || null,
      billing_email: billingEmail.trim() || null,
      phone: phone.trim() || null,
      kra_pin: kraPin.trim().toUpperCase() || null,
    };
    const { data, error } = initial
      ? await supabase.from("clients").update(row).eq("id", initial.id).select("id").maybeSingle()
      : await supabase.from("clients").insert(row).select("id").maybeSingle();
    setBusy(false);
    if (error || !data) {
      const text = error?.code === "23505" ? "Another client already uses that slug." : error?.message ?? "Could not save.";
      return setMsg({ tone: "error", text });
    }
    refreshSite();
    if (!initial) {
      startNavProgress();
      router.replace(`/console/clients/${data.id}`);
      return;
    }
    setMsg({ tone: "ok", text: "Saved." });
    router.refresh();
  }

  async function remove() {
    if (!initial) return;
    setBusy(true);
    const { error } = await createClient().from("clients").delete().eq("id", initial.id);
    setBusy(false);
    if (error) {
      setConfirmDelete(false);
      return setMsg({ tone: "error", text: error.message });
    }
    refreshSite();
    startNavProgress();
    router.push("/console/clients");
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <Panel title="Profile">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name">
            <input
              className={inputClass}
              value={name}
              disabled={readOnly}
              onChange={(e) => {
                setName(e.target.value);
                if (!slugTouched) setSlug(slugify(e.target.value));
              }}
            />
          </Field>
          <Field label="Slug">
            <input
              className={inputClass}
              value={slug}
              disabled={readOnly}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Website">
              <input className={inputClass} value={url} disabled={readOnly} placeholder="https://" onChange={(e) => setUrl(e.target.value)} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <FileField label="Logo" folder="clients" value={logo} onChange={setLogo} accept="image/*" disabled={readOnly} />
          </div>
        </div>
      </Panel>

      <Panel title="Billing">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Billing email">
            <input className={inputClass} type="email" value={billingEmail} disabled={readOnly} onChange={(e) => setBillingEmail(e.target.value)} />
          </Field>
          <Field label="Phone">
            <input className={inputClass} type="tel" value={phone} disabled={readOnly} placeholder="+254" onChange={(e) => setPhone(e.target.value)} />
          </Field>
          <Field label="KRA PIN">
            <input className={inputClass} value={kraPin} disabled={readOnly} placeholder="P000000000A" onChange={(e) => setKraPin(e.target.value)} />
          </Field>
        </div>
      </Panel>

      <Panel title="On the site">
        <div className="grid items-end gap-4 sm:grid-cols-2">
          <Toggle label="Show logo on the home strip" checked={featured} onChange={setFeatured} disabled={readOnly} />
          <Field label="Sort order">
            <input
              className={inputClass}
              type="number"
              value={sortOrder}
              disabled={readOnly}
              onChange={(e) => setSortOrder(e.target.value)}
            />
          </Field>
        </div>
      </Panel>

      {!readOnly ? (
        <div className="flex flex-wrap items-center gap-3">
          <AdminBtn onClick={save} pending={busy}>
            {busy ? "Saving…" : initial ? "Save changes" : "Create client"}
          </AdminBtn>
          {initial ? (
            <DangerBtn onClick={() => setConfirmDelete(true)} disabled={busy}>
              Delete
            </DangerBtn>
          ) : null}
          {msg ? <Notice tone={msg.tone}>{msg.text}</Notice> : null}
        </div>
      ) : null}

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete this client?"
        footer={
          <>
            <AdminBtn variant="ghost" onClick={() => setConfirmDelete(false)} disabled={busy}>
              Cancel
            </AdminBtn>
            <DangerBtn onClick={remove} disabled={busy}>
              {busy ? "Deleting…" : "Delete"}
            </DangerBtn>
          </>
        }
      >
        <p className="text-sm text-body">
          Invoices and case studies keep their details and lose the link to this account.
        </p>
      </Modal>
    </div>
  );
}
