"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminBtn, Field, Panel, inputClass } from "@/components/admin/ui";
import { FileField } from "@/components/admin/FileField";
import { DangerBtn, Modal, Notice, Toggle } from "@/components/admin/studio/controls";
import { createClient } from "@/lib/supabase/client";
import { EXPERT_DISCIPLINES, slugify } from "@/lib/constants";
import type { Expert } from "@/lib/cms";
import { refreshSite } from "@/lib/refresh-site";
import { startNavProgress } from "@/components/ui/NavProgress";

export function ExpertEditor({ initial, readOnly }: { initial?: Expert; readOnly?: boolean }) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial));
  const [title, setTitle] = useState(initial?.title ?? "");
  const [discipline, setDiscipline] = useState(initial?.discipline ?? "engineering");
  const [bio, setBio] = useState(initial?.bio ?? "");
  const [published, setPublished] = useState(initial?.published ?? false);
  const [sortOrder, setSortOrder] = useState(String(initial?.sort_order ?? 0));
  const [photo, setPhoto] = useState(initial?.photo_path ?? "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function save() {
    if (!name.trim()) return setMsg({ tone: "error", text: "Add the person's name first." });
    if (!title.trim()) return setMsg({ tone: "error", text: "Add the role they hold at the company." });
    setBusy(true);
    setMsg(null);
    const supabase = createClient();
    const row = {
      name: name.trim(),
      slug: slugify(slug || name),
      title: title.trim(),
      discipline,
      bio: bio.trim(),
      published,
      sort_order: Number.parseInt(sortOrder, 10) || 0,
      photo_path: photo || null,
    };
    const { error } = initial
      ? await supabase.from("experts").update(row).eq("id", initial.id)
      : await supabase.from("experts").insert(row);
    setBusy(false);
    if (error) {
      const text = error.code === "23505" ? "Another person already uses that slug." : error.message;
      return setMsg({ tone: "error", text });
    }
    refreshSite();
    startNavProgress();
    router.push("/console/experts");
    router.refresh();
  }

  async function remove() {
    if (!initial) return;
    setBusy(true);
    const { error } = await createClient().from("experts").delete().eq("id", initial.id);
    setBusy(false);
    if (error) {
      setConfirmDelete(false);
      return setMsg({ tone: "error", text: error.message });
    }
    refreshSite();
    startNavProgress();
    router.push("/console/experts");
    router.refresh();
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <Panel title="Expert">
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
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Role">
              <input
                className={inputClass}
                value={title}
                disabled={readOnly}
                placeholder="Lead engineer"
                onChange={(e) => setTitle(e.target.value)}
              />
            </Field>
            <Field label="Practice">
              <select className={inputClass} value={discipline} disabled={readOnly} onChange={(e) => setDiscipline(e.target.value)}>
                {EXPERT_DISCIPLINES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Bio">
            <textarea
              className={inputClass}
              rows={6}
              value={bio}
              disabled={readOnly}
              placeholder="What they are responsible for, in plain language."
              onChange={(e) => setBio(e.target.value)}
            />
          </Field>
        </div>
      </Panel>

      <div className="space-y-5">
        <Panel title="On the site">
          <div className="space-y-4">
            <Toggle label="Published on About" checked={published} onChange={setPublished} disabled={readOnly} />
            <Field label="Sort order">
              <input className={inputClass} type="number" value={sortOrder} disabled={readOnly} onChange={(e) => setSortOrder(e.target.value)} />
            </Field>
            {msg ? <Notice tone={msg.tone}>{msg.text}</Notice> : null}
            {!readOnly ? (
              <div className="flex flex-wrap gap-2 border-t border-line pt-4">
                <AdminBtn onClick={save} pending={busy}>
                  {busy ? "Saving…" : initial ? "Save changes" : "Add expert"}
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
        <Panel title="Portrait">
          <FileField label="Photo" folder="experts" value={photo} onChange={setPhoto} accept="image/*" disabled={readOnly} />
        </Panel>
      </div>

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Remove this person?"
        footer={
          <>
            <AdminBtn variant="ghost" onClick={() => setConfirmDelete(false)} disabled={busy}>
              Cancel
            </AdminBtn>
            <DangerBtn onClick={remove} disabled={busy}>
              {busy ? "Removing…" : "Remove"}
            </DangerBtn>
          </>
        }
      >
        <p className="text-sm text-body">They come off the About page straight away.</p>
      </Modal>
    </div>
  );
}
