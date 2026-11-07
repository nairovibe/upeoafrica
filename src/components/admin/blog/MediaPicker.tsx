"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import { Check, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { publicMediaUrl } from "@/lib/constants";
import { invalidateMediaCache } from "@/components/admin/studio/MediaPicker";
import { fileName } from "@/components/admin/studio/format";
import { AdminBtn, Field, inputClass } from "@/components/admin/ui";
import { Modal } from "@/components/admin/blog/Modal";
import { cn } from "@/lib/utils";

export type PickedMedia = {
  id: string;
  path: string;
  url: string;
  alt: string;
  title: string;
  caption: string;
  description: string;
};

type LibraryItem = {
  id: string;
  storage_path: string;
  alt: string;
  title: string;
  caption: string;
  description: string;
};

function cleanName(name: string) {
  return name
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/^\d{10,}-/, "")
    .replace(/[-_]+/g, " ")
    .trim();
}

function toPicked(item: LibraryItem): PickedMedia {
  const fromFile = cleanName(fileName(item.storage_path));
  const alt = item.alt.trim() && !/\.[a-z0-9]{3,4}$/i.test(item.alt) ? item.alt.trim() : fromFile;
  return {
    id: item.id,
    path: item.storage_path,
    url: publicMediaUrl(item.storage_path) ?? item.storage_path,
    alt,
    title: item.title.trim() || fromFile,
    caption: item.caption ?? "",
    description: item.description ?? "",
  };
}

export async function uploadBlogImage(file: File): Promise<PickedMedia> {
  const supabase = createClient();
  const path = `blog/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]+/g, "-")}`;
  const { error } = await supabase.storage.from("public-media").upload(path, file, { upsert: false });
  if (error) throw new Error(error.message);
  const name = cleanName(file.name);
  const { data, error: insertError } = await supabase
    .from("media")
    .insert({ storage_path: path, bucket: "public-media", alt: name, title: name, kind: "image" })
    .select("id, storage_path, alt, title, caption, description")
    .single();
  if (insertError || !data) throw new Error(insertError?.message ?? "Could not save the image in the library.");
  invalidateMediaCache();
  return toPicked(data);
}

async function saveDetails(items: PickedMedia[]) {
  const supabase = createClient();
  const results = await Promise.all(
    items.map((item) =>
      supabase
        .from("media")
        .update({
          alt: item.alt.trim(),
          title: item.title.trim(),
          caption: item.caption.trim(),
          description: item.description.trim(),
        })
        .eq("id", item.id),
    ),
  );
  const failed = results.find((result) => result.error);
  if (failed?.error) throw new Error(failed.error.message);
  invalidateMediaCache();
}

export function MediaPicker({
  open,
  title = "Choose image",
  multiple = false,
  details = true,
  onClose,
  onPick,
}: {
  open: boolean;
  title?: string;
  multiple?: boolean;
  /** Ask for title, alt, caption, and description before inserting. */
  details?: boolean;
  onClose: () => void;
  onPick: (items: PickedMedia[]) => void;
}) {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<PickedMedia[]>([]);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [step, setStep] = useState<"pick" | "details">("pick");
  const fileRef = useRef<HTMLInputElement>(null);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    if (!open) return;
    const term = query.replace(/[,()%*]/g, " ").trim();
    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      const supabase = createClient();
      let q = supabase
        .from("media")
        .select("id, storage_path, alt, title, caption, description")
        .eq("bucket", "public-media")
        .eq("kind", "image")
        .order("created_at", { ascending: false })
        .limit(60);
      if (term) {
        q = q.or(`title.ilike.%${term}%,alt.ilike.%${term}%,caption.ilike.%${term}%,description.ilike.%${term}%,storage_path.ilike.%${term}%`);
      }
      const { data, error } = await q;
      if (cancelled) return;
      setLoading(false);
      if (error) {
        setErr(error.message);
        return;
      }
      setItems(data ?? []);
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [open, query, reload]);

  function reset() {
    setSelected([]);
    setStep("pick");
    setErr(null);
  }

  function close() {
    reset();
    onClose();
  }

  function finish(picked: PickedMedia[]) {
    if (details && picked.length) {
      setSelected(picked);
      setStep("details");
      return;
    }
    onPick(picked);
    reset();
  }

  function toggle(item: LibraryItem) {
    const picked = toPicked(item);
    if (!multiple) return finish([picked]);
    setSelected((cur) => (cur.some((s) => s.path === picked.path) ? cur.filter((s) => s.path !== picked.path) : [...cur, picked]));
  }

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setErr(null);
    try {
      const uploaded: PickedMedia[] = [];
      for (const file of Array.from(files).slice(0, multiple ? 20 : 1)) uploaded.push(await uploadBlogImage(file));
      setReload((n) => n + 1);
      finish(multiple ? [...selected, ...uploaded] : uploaded);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function confirm() {
    if (selected.some((item) => !item.alt.trim())) {
      setErr("Every image needs alt text.");
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      const next = selected.map((item) => ({
        ...item,
        alt: item.alt.trim(),
        title: item.title.trim(),
        caption: item.caption.trim(),
        description: item.description.trim(),
      }));
      await saveDetails(next);
      onPick(next);
      reset();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not save the image details.");
    } finally {
      setBusy(false);
    }
  }

  if (step === "details") {
    return (
      <Modal
        open={open}
        title={selected.length > 1 ? "Image details" : "Image details"}
        onClose={close}
        wide={selected.length > 1}
        footer={
          <>
            <AdminBtn variant="ghost" onClick={() => setStep("pick")} disabled={busy}>Back</AdminBtn>
            <AdminBtn disabled={busy || selected.some((item) => !item.alt.trim())} pending={busy} onClick={confirm}>
              {busy ? "Saving..." : "Insert"}
            </AdminBtn>
          </>
        }
      >
        <div className={cn("space-y-5", selected.length > 1 && "max-h-[60vh] overflow-y-auto pr-1")}>
          {selected.map((item, index) => (
            <ImageDetails
              key={item.id || item.path}
              item={item}
              onChange={(next) => setSelected((cur) => cur.map((row, i) => (i === index ? next : row)))}
            />
          ))}
        </div>
        {err ? <p className="mt-3 text-xs text-red-600">{err}</p> : null}
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      title={title}
      onClose={close}
      wide
      footer={
        multiple ? (
          <>
            <AdminBtn variant="ghost" onClick={close}>Cancel</AdminBtn>
            <AdminBtn disabled={!selected.length} onClick={() => finish(selected)}>
              Continue{selected.length ? ` (${selected.length})` : ""}
            </AdminBtn>
          </>
        ) : undefined
      }
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          className={cn(inputClass, "max-w-xs flex-1")}
          placeholder="Search title, alt text, or file name"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <input ref={fileRef} type="file" accept="image/*" multiple={multiple} className="hidden" onChange={(e) => onFiles(e.target.files)} />
        <AdminBtn variant="ink" onClick={() => fileRef.current?.click()} pending={busy} icon={<Upload aria-hidden />}>
          {busy ? "Uploading..." : "Upload"}
        </AdminBtn>
      </div>
      {err ? <p className="mb-3 text-xs text-red-600">{err}</p> : null}
      {loading && items.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted">Loading the library…</p>
      ) : items.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted">{query.trim() ? "No images match that search." : "No images yet. Upload one to start."}</p>
      ) : (
        <div className="grid max-h-[50vh] grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-4">
          {items.map((item) => {
            const url = publicMediaUrl(item.storage_path);
            const isOn = selected.some((s) => s.path === item.storage_path);
            const label = item.title.trim() || item.alt.trim() || cleanName(fileName(item.storage_path));
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggle(item)}
                className={cn("overflow-hidden rounded-[5px] border-2 bg-white text-left", isOn ? "border-brand-500" : "border-transparent hover:border-brand-200")}
                title={label}
              >
                <span className="relative block">
                  {url ? <img src={url} alt="" className="aspect-square w-full bg-surface-3 object-cover" loading="lazy" /> : null}
                  {isOn ? (
                    <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-white">
                      <Check className="h-3 w-3" />
                    </span>
                  ) : null}
                </span>
                <span className="block truncate px-1.5 py-1 text-[11px] text-ink-900">{label}</span>
              </button>
            );
          })}
        </div>
      )}
    </Modal>
  );
}

function ImageDetails({ item, onChange }: { item: PickedMedia; onChange: (next: PickedMedia) => void }) {
  const set = (patch: Partial<PickedMedia>) => onChange({ ...item, ...patch });
  return (
    <div className="grid gap-3 sm:grid-cols-[140px_1fr]">
      <img src={item.url} alt="" className="aspect-square w-full rounded-[5px] border border-line object-cover" />
      <div className="space-y-3">
        <Field label="File name">
          <input className={cn(inputClass, "text-body")} readOnly value={fileName(item.path)} />
        </Field>
        <Field label="Title">
          <input className={inputClass} value={item.title} placeholder="Name of this image" onChange={(e) => set({ title: e.target.value })} />
        </Field>
        <Field label="Alt text">
          <input className={inputClass} value={item.alt} placeholder="What the image shows" onChange={(e) => set({ alt: e.target.value })} />
        </Field>
        <Field label="Caption">
          <input className={inputClass} value={item.caption} placeholder="Shown under the image in the article" onChange={(e) => set({ caption: e.target.value })} />
        </Field>
        <Field label="Description">
          <textarea className={inputClass} rows={2} value={item.description} placeholder="Kept in the media library" onChange={(e) => set({ description: e.target.value })} />
        </Field>
      </div>
    </div>
  );
}
