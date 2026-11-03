"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminBtn, Field, Panel, inputClass } from "@/components/admin/ui";
import { FileField } from "@/components/admin/FileField";
import { DangerBtn, Modal, Notice, Toggle } from "@/components/admin/studio/controls";
import { createClient } from "@/lib/supabase/client";
import { PARTNER_RELATIONSHIPS, slugify } from "@/lib/constants";
import type { Partner } from "@/lib/cms";
import { refreshSite } from "@/lib/refresh-site";
import { startNavProgress } from "@/components/ui/NavProgress";

export function PartnerEditor({ initial, readOnly }: { initial?: Partner; readOnly?: boolean }) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial));
  const [url, setUrl] = useState(initial?.url ?? "");
  const [relationship, setRelationship] = useState(initial?.relationship ?? "technology");
  const [blurb, setBlurb] = useState(initial?.blurb ?? "");
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [sortOrder, setSortOrder] = useState(String(initial?.sort_order ?? 0));
  const [logo, setLogo] = useState(initial?.logo_path ?? "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function save() {
    if (!name.trim()) return setMsg({ tone: "error", text: "Add the partner name first." });
    setBusy(true);
    setMsg(null);
    const supabase = createClient();
    const row = {
      name: name.trim(),
      slug: slugify(slug || name),
      url: url.trim() || null,
      relationship,
      blurb: blurb.trim(),
      featured,
      sort_order: Number.parseInt(sortOrder, 10) || 0,
      logo_path: logo || null,
    };
    const { error } = initial
      ? await supabase.from("partners").update(row).eq("id", initial.id)
      : await supabase.from("partners").insert(row);
    setBusy(false);
    if (error) {
      const text = error.code === "23505" ? "Another partner already uses that slug." : error.message;
      return setMsg({ tone: "error", text });
    }
    refreshSite();
    startNavProgress();
    router.push("/console/partners");
    router.refresh();
  }

  async function remove() {
    if (!initial) return;
    setBusy(true);
    const { error } = await createClient().from("partners").delete().eq("id", initial.id);
    setBusy(false);
    if (error) {
      setConfirmDelete(false);
      return setMsg({ tone: "error", text: error.message });
    }
    refreshSite();
    startNavProgress();
    router.push("/console/partners");
    router.refresh();
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <Panel title="Partner">
        <div className="space-y-4">
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
          </div>
          <Field label="Website">
            <input className={inputClass} value={url} disabled={readOnly} placeholder="https://" onChange={(e) => setUrl(e.target.value)} />
          </Field>
          <Field label="Relationship">
            <select className={inputClass} value={relationship} disabled={readOnly} onChange={(e) => setRelationship(e.target.value)}>
              {PARTNER_RELATIONSHIPS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Blurb">
            <textarea className={inputClass} rows={5} value={blurb} disabled={readOnly} onChange={(e) => setBlurb(e.target.value)} />
          </Field>
        </div>
      </Panel>

      <div className="space-y-5">
        <Panel title="Display">
          <div className="space-y-4">
            <Toggle label="Featured" checked={featured} onChange={setFeatured} disabled={readOnly} />
            <Field label="Sort order">
              <input className={inputClass} type="number" value={sortOrder} disabled={readOnly} onChange={(e) => setSortOrder(e.target.value)} />
            </Field>
            {msg ? <Notice tone={msg.tone}>{msg.text}</Notice> : null}
            {!readOnly ? (
              <div className="flex flex-wrap gap-2 border-t border-line pt-4">
                <AdminBtn onClick={save} pending={busy}>
                  {busy ? "Saving…" : initial ? "Save changes" : "Add partner"}
                </AdminBtn>
                {initial ? (
                  <DangerBtn onClick={() => setConfirmDelete(true)} disabled={busy}>
                    Delete
                  </DangerBtn>
                ) : null}
              </div>
            ) : null}
          </div>
        </Panel>
        <Panel title="Logo">
          <FileField label="Logo" folder="partners" value={logo} onChange={setLogo} accept="image/*" disabled={readOnly} />
        </Panel>
      </div>

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete this partner?"
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
        <p className="text-sm text-body">The partner comes off the site straight away.</p>
      </Modal>
    </div>
  );
}
