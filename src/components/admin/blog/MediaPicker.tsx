"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import { Check, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { publicMediaUrl } from "@/lib/constants";
import { AdminBtn, Field, inputClass } from "@/components/admin/ui";
import { Modal } from "@/components/admin/blog/Modal";
import { cn } from "@/lib/utils";

export type PickedMedia = { path: string; url: string; alt: string; caption?: string };

type LibraryItem = { id: string; storage_path: string; alt: string };

function altFromName(name: string) {
  return name
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/^\d{10,}-/, "")
    .replace(/[-_]+/g, " ")
    .trim();
}

export async function uploadBlogImage(file: File): Promise<PickedMedia> {
  const supabase = createClient();
  const path = `blog/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]+/g, "-")}`;
  const { error } = await supabase.storage.from("public-media").upload(path, file, { upsert: false });
  if (error) throw new Error(error.message);
  const alt = altFromName(file.name);
  await supabase.from("media").insert({ storage_path: path, bucket: "public-media", alt, kind: "image" });
  return { path, url: publicMediaUrl(path) ?? path, alt };
}

export function MediaPicker({
  open,
  title = "Choose image",
  multiple = false,
  details = false,
  onClose,
  onPick,
}: {
  open: boolean;
  title?: string;
  multiple?: boolean;
  /** Ask for alt text and caption before returning a single image. */
  details?: boolean;
  onClose: () => void;
  onPick: (items: PickedMedia[]) => void;
}) {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<PickedMedia[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [step, setStep] = useState<"pick" | "details">("pick");
  const [alt, setAlt] = useState("");
  const [caption, setCaption] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const fetchedTerm = useRef<string | null>(null);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    if (!open) return;
    const term = query.replace(/[,()%*]/g, " ").trim();
    if (term === fetchedTerm.current) return;
    let cancelled = false;
    const t = setTimeout(async () => {
      const supabase = createClient();
      let q = supabase
        .from("media")
        .select("id, storage_path, alt")
        .eq("bucket", "public-media")
        .eq("kind", "image")
        .order("created_at", { ascending: false })
        .limit(60);
      if (term) q = q.or(`alt.ilike.%${term}%,storage_path.ilike.%${term}%`);
      const { data, error } = await q;
      if (cancelled || error) return;
      fetchedTerm.current = term;
      setItems(data ?? []);
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [open, query, reload]);

  function reset() {
    setSelected([]);
    setStep("pick");
    setAlt("");
    setCaption("");
    setErr(null);
  }

  function close() {
    reset();
    onClose();
  }

  function finish(picked: PickedMedia[]) {
    if (details && !multiple) {
      setSelected(picked.slice(0, 1));
      setAlt(picked[0]?.alt ?? "");
      setStep("details");
      return;
    }
    onPick(picked);
    reset();
  }

  function toggle(item: LibraryItem) {
    const picked: PickedMedia = {
      path: item.storage_path,
      url: publicMediaUrl(item.storage_path) ?? item.storage_path,
      alt: item.alt && !/\.[a-z0-9]{3,4}$/i.test(item.alt) ? item.alt : altFromName(item.alt || item.storage_path.split("/").pop() || ""),
    };
    if (!multiple) return finish([picked]);
    setSelected((cur) =>
      cur.some((s) => s.path === picked.path) ? cur.filter((s) => s.path !== picked.path) : [...cur, picked],
    );
  }

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setErr(null);
    try {
      const uploaded: PickedMedia[] = [];
      for (const file of Array.from(files).slice(0, multiple ? 20 : 1)) uploaded.push(await uploadBlogImage(file));
      fetchedTerm.current = null;
      setReload((n) => n + 1);
      finish(uploaded);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  if (step === "details") {
    const img = selected[0];
    return (
      <Modal
        open={open}
        title="Image details"
        onClose={close}
        footer={
          <>
            <AdminBtn variant="ghost" onClick={() => setStep("pick")}>Back</AdminBtn>
            <AdminBtn
              disabled={!alt.trim()}
              onClick={() => {
                onPick([{ ...img, alt: alt.trim(), caption: caption.trim() }]);
                reset();
              }}
            >
              Insert
            </AdminBtn>
          </>
        }
      >
        {img ? <img src={img.url} alt="" className="mb-4 max-h-56 w-full rounded-[5px] border border-line object-contain" /> : null}
        <div className="space-y-3">
          <Field label="Alt text">
            <input className={inputClass} value={alt} onChange={(e) => setAlt(e.target.value)} autoFocus />
          </Field>
          <Field label="Caption">
            <input className={inputClass} value={caption} onChange={(e) => setCaption(e.target.value)} />
          </Field>
        </div>
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
              Add {selected.length || ""}
            </AdminBtn>
          </>
        ) : undefined
      }
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          className={cn(inputClass, "max-w-xs flex-1")}
          placeholder="Search library"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          className="hidden"
          onChange={(e) => onFiles(e.target.files)}
        />
        <AdminBtn variant="ink" onClick={() => fileRef.current?.click()} pending={busy} icon={<Upload aria-hidden />}>
          {busy ? "Uploading..." : "Upload"}
        </AdminBtn>
      </div>
      {err ? <p className="mb-3 text-xs text-red-600">{err}</p> : null}
      {items.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted">No images yet. Upload one to start.</p>
      ) : (
        <div className="grid max-h-[50vh] grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4">
          {items.map((item) => {
            const url = publicMediaUrl(item.storage_path);
            const isOn = selected.some((s) => s.path === item.storage_path);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggle(item)}
                className={cn(
                  "relative overflow-hidden rounded-[5px] border-2",
                  isOn ? "border-brand-500" : "border-transparent hover:border-brand-200",
                )}
                title={item.alt}
              >
                {url ? <img src={url} alt="" className="aspect-square w-full bg-surface-3 object-cover" loading="lazy" /> : null}
                {isOn ? (
                  <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-white">
                    <Check className="h-3 w-3" />
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      )}
    </Modal>
  );
}
