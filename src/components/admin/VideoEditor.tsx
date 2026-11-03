"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Film } from "lucide-react";
import { AdminBtn, Field, Panel, inputClass } from "@/components/admin/ui";
import { FileField } from "@/components/admin/FileField";
import { DangerBtn, Modal, Notice, Toggle } from "@/components/admin/studio/controls";
import { formatDay } from "@/components/admin/studio/format";
import { parseVideoUrl } from "@/components/admin/studio/video";
import { createClient } from "@/lib/supabase/client";
import { publicMediaUrl } from "@/lib/constants";
import type { Video } from "@/lib/cms";
import { refreshSite } from "@/lib/refresh-site";
import { startNavProgress } from "@/components/ui/NavProgress";
import { cn } from "@/lib/utils";

type Option = { id: string; title: string };

export function VideoEditor({
  initial,
  caseStudies = [],
  products = [],
  readOnly,
}: {
  initial?: Video;
  caseStudies?: Option[];
  products?: Option[];
  readOnly?: boolean;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [mode, setMode] = useState<"link" | "file">(initial?.provider === "file" ? "file" : "link");
  const [url, setUrl] = useState(initial?.url ?? "");
  const [storagePath, setStoragePath] = useState(initial?.storage_path ?? "");
  const [caseStudyId, setCaseStudyId] = useState(initial?.case_study_id ?? "");
  const [productId, setProductId] = useState(initial?.product_id ?? "");
  const [published, setPublished] = useState(initial ? Boolean(initial.published_at) : true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const parsed = parseVideoUrl(url);
  const fileUrl = publicMediaUrl(storagePath);

  async function save() {
    if (!title.trim()) return setMsg({ tone: "error", text: "Add a title first." });
    if (mode === "link" && !parsed) return setMsg({ tone: "error", text: "Paste a YouTube or Vimeo link." });
    if (mode === "file" && !storagePath) return setMsg({ tone: "error", text: "Upload a video file first." });
    setBusy(true);
    setMsg(null);
    const supabase = createClient();
    const row = {
      title: title.trim(),
      provider: mode === "file" ? "file" : parsed!.provider,
      url: mode === "link" ? url.trim() : null,
      storage_path: mode === "file" ? storagePath : null,
      case_study_id: caseStudyId || null,
      product_id: productId || null,
      published_at: published ? initial?.published_at || new Date().toISOString() : null,
    };
    const { data, error } = initial
      ? await supabase.from("videos").update(row).eq("id", initial.id).select("id").maybeSingle()
      : await supabase.from("videos").insert(row).select("id").maybeSingle();
    setBusy(false);
    if (error || !data) return setMsg({ tone: "error", text: error?.message ?? "Could not save." });
    refreshSite();
    if (!initial) {
      startNavProgress();
      router.replace(`/console/videos/${data.id}`);
      return;
    }
    setMsg({ tone: "ok", text: "Saved." });
    router.refresh();
  }

  async function remove() {
    if (!initial) return;
    setBusy(true);
    const { error } = await createClient().from("videos").delete().eq("id", initial.id);
    setBusy(false);
    if (error) {
      setConfirmDelete(false);
      return setMsg({ tone: "error", text: error.message });
    }
    refreshSite();
    startNavProgress();
    router.push("/console/videos");
    router.refresh();
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-5">
        <Panel title="Video">
          <div className="space-y-4">
            <Field label="Title">
              <input className={inputClass} value={title} disabled={readOnly} onChange={(e) => setTitle(e.target.value)} />
            </Field>
            <div>
              <span className="mb-1.5 block text-[13px] font-medium text-ink-900">Source</span>
              <div className="inline-flex rounded-[5px] border border-line p-0.5">
                {(["link", "file"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    disabled={readOnly}
                    onClick={() => setMode(m)}
                    className={cn(
                      "rounded-[4px] px-3 py-1.5 text-[12px] font-medium",
                      mode === m ? "bg-brand-500 text-white" : "text-body hover:text-ink-900",
                    )}
                  >
                    {m === "link" ? "YouTube or Vimeo" : "Uploaded file"}
                  </button>
                ))}
              </div>
            </div>
            {mode === "link" ? (
              <Field label="Link">
                <input
                  className={inputClass}
                  value={url}
                  disabled={readOnly}
                  placeholder="https://www.youtube.com/watch?v=…"
                  onChange={(e) => setUrl(e.target.value)}
                />
                {url.trim() ? (
                  <span className={cn("mt-1 block text-xs", parsed ? "text-emerald-700" : "text-red-600")}>
                    {parsed ? `${parsed.provider === "youtube" ? "YouTube" : "Vimeo"} video ${parsed.id}` : "Link not recognised"}
                  </span>
                ) : null}
              </Field>
            ) : (
              <FileField label="File" folder="videos" accept="video/*" value={storagePath} onChange={setStoragePath} disabled={readOnly} />
            )}
          </div>
        </Panel>

        <Panel title="Preview" flush>
          <div className="aspect-video overflow-hidden rounded-b-[5px] border-t border-line bg-ink-950">
            {mode === "link" && parsed ? (
              <iframe
                key={parsed.embedUrl}
                src={parsed.embedUrl}
                title="Video preview"
                className="h-full w-full"
                allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : mode === "file" && fileUrl ? (
              <video key={fileUrl} src={fileUrl} controls className="h-full w-full" />
            ) : (
              <div className="flex h-full items-center justify-center text-white/40">
                <Film className="h-8 w-8" strokeWidth={1.5} />
              </div>
            )}
          </div>
        </Panel>
      </div>

      <div className="space-y-5">
        <Panel title="Publish" meta={initial ? `Updated ${formatDay(initial.updated_at)}` : undefined}>
          <div className="space-y-3.5">
            <Toggle label="Live on the site" checked={published} onChange={setPublished} disabled={readOnly} />
            {msg ? <Notice tone={msg.tone}>{msg.text}</Notice> : null}
            {!readOnly ? (
              <div className="flex flex-wrap gap-2 border-t border-line pt-3.5">
                <AdminBtn onClick={save} pending={busy}>
                  {busy ? "Saving…" : initial ? "Save changes" : "Add video"}
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

        <Panel title="Linked to">
          <div className="space-y-4">
            <Field label="Case study">
              <select className={inputClass} value={caseStudyId} disabled={readOnly} onChange={(e) => setCaseStudyId(e.target.value)}>
                <option value="">None</option>
                {caseStudies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Product">
              <select className={inputClass} value={productId} disabled={readOnly} onChange={(e) => setProductId(e.target.value)}>
                <option value="">None</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </Panel>
      </div>

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete this video?"
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
        <p className="text-sm text-body">The entry is removed from the console and the site. Uploaded files stay in Media.</p>
      </Modal>
    </div>
  );
}
