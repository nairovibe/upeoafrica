"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, ExternalLink, FileText, Film, ImageIcon, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AdminBtn, Field, inputClass } from "@/components/admin/ui";
import { Spinner } from "@/components/admin/pending";
import { DangerBtn, Drawer, Modal, Notice } from "@/components/admin/studio/controls";
import { invalidateMediaCache } from "@/components/admin/studio/MediaPicker";
import { Thumb } from "@/components/admin/studio/Thumb";
import { fileName, formatBytes, formatDay } from "@/components/admin/studio/format";
import { publicMediaUrl } from "@/lib/constants";
import type { MediaItem } from "@/lib/cms";
import { cn } from "@/lib/utils";

export function MediaLibrary({ items, canEdit }: { items: MediaItem[]; canEdit: boolean }) {
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return items;
    return items.filter((m) => m.alt.toLowerCase().includes(needle) || m.storage_path.toLowerCase().includes(needle));
  }, [items, query]);

  const open = items.find((m) => m.id === openId) ?? null;

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          className={cn(inputClass, "pl-9")}
          placeholder="Search alt text or file name"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {visible.length === 0 ? (
        <div className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-[5px] border border-dashed border-line bg-white px-5 py-12 text-center">
          <ImageIcon className="h-6 w-6 text-muted" strokeWidth={1.5} aria-hidden />
          <p className="text-sm text-muted">
            {items.length === 0
              ? canEdit
                ? "No files here yet. Drop files above or click the upload area to add them."
                : "No files here yet."
              : "No files match that search."}
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
          {visible.map((m) => (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => setOpenId(m.id)}
                className="group block w-full rounded-[5px] border border-line bg-white p-2 text-left transition-colors hover:border-brand-300 focus:outline-none focus-visible:border-brand-500"
              >
                <Thumb
                  src={m.kind === "image" ? publicMediaUrl(m.storage_path) : null}
                  alt={m.alt}
                  icon={m.kind === "video" ? Film : FileText}
                  className="aspect-[4/3] w-full border-0"
                />
                <span className="mt-2 block truncate text-[13px] font-medium text-ink-900">
                  {m.alt || fileName(m.storage_path)}
                </span>
                <span className="block text-xs capitalize text-muted">
                  {m.kind} · {formatDay(m.created_at)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {open ? (
        <MediaDetail key={open.id} item={open} canEdit={canEdit} onClose={() => setOpenId(null)} />
      ) : null}
    </div>
  );
}

function MediaDetail({ item, canEdit, onClose }: { item: MediaItem; canEdit: boolean; onClose: () => void }) {
  const router = useRouter();
  const url = publicMediaUrl(item.storage_path);
  const [alt, setAlt] = useState(item.alt);
  const [meta, setMeta] = useState<{ size?: number; type?: string } | null>(null);
  const [working, setWorking] = useState<"save" | "delete" | null>(null);
  const [refreshing, startRefresh] = useTransition();
  const [msg, setMsg] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [copying, setCopying] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const busy = working !== null || refreshing;

  useEffect(() => {
    const slash = item.storage_path.lastIndexOf("/");
    const dir = slash > 0 ? item.storage_path.slice(0, slash) : "";
    const name = item.storage_path.slice(slash + 1);
    createClient()
      .storage.from(item.bucket)
      .list(dir, { search: name, limit: 5 })
      .then(({ data }) => {
        const hit = data?.find((f) => f.name === name);
        const md = (hit?.metadata ?? {}) as { size?: number; mimetype?: string };
        setMeta({ size: md.size, type: md.mimetype });
      });
  }, [item.bucket, item.storage_path]);

  async function saveAlt() {
    setWorking("save");
    setMsg(null);
    const { error } = await createClient().from("media").update({ alt: alt.trim() }).eq("id", item.id);
    setWorking(null);
    if (error) return setMsg({ tone: "error", text: error.message });
    setMsg({ tone: "ok", text: "Alt text saved." });
    startRefresh(() => router.refresh());
  }

  async function remove() {
    setWorking("delete");
    setMsg(null);
    const supabase = createClient();
    const { error: storageError } = await supabase.storage.from(item.bucket).remove([item.storage_path]);
    if (storageError) {
      setWorking(null);
      setConfirming(false);
      return setMsg({ tone: "error", text: storageError.message });
    }
    const { error } = await supabase.from("media").delete().eq("id", item.id);
    setWorking(null);
    setConfirming(false);
    if (error) return setMsg({ tone: "error", text: error.message });
    invalidateMediaCache();
    onClose();
    startRefresh(() => router.refresh());
  }

  async function copy() {
    if (!url || copying) return;
    setCopying(true);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setMsg({ tone: "error", text: "Could not copy. Select the URL and copy it manually." });
    } finally {
      setCopying(false);
    }
  }

  return (
    <>
      <Drawer
        open
        onClose={onClose}
        title={fileName(item.storage_path)}
        footer={
          canEdit ? (
            <>
              <DangerBtn onClick={() => setConfirming(true)} disabled={busy}>
                Delete
              </DangerBtn>
              <AdminBtn onClick={saveAlt} disabled={busy || alt.trim() === item.alt} pending={working === "save"}>
                {working === "save" ? "Saving..." : "Save"}
              </AdminBtn>
            </>
          ) : null
        }
      >
        <div className="space-y-5">
          <div className="overflow-hidden rounded-[5px] border border-line bg-surface-2">
            {item.kind === "image" && url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={url} alt={item.alt} className="max-h-72 w-full object-contain" />
            ) : item.kind === "video" && url ? (
              <video src={url} controls className="max-h-72 w-full bg-ink-950" />
            ) : (
              <div className="flex h-40 items-center justify-center text-muted">
                <FileText className="h-8 w-8" strokeWidth={1.5} />
              </div>
            )}
          </div>

          <Field label="Alt text">
            <textarea
              className={inputClass}
              rows={2}
              value={alt}
              disabled={!canEdit}
              placeholder="Describe what the image shows"
              onChange={(e) => setAlt(e.target.value)}
            />
          </Field>

          {url ? (
            <div>
              <span className="mb-1.5 block text-[13px] font-medium text-ink-900">Public URL</span>
              <div className="flex gap-2">
                <input readOnly value={url} className={cn(inputClass, "text-xs text-body")} onFocus={(e) => e.target.select()} />
                <button
                  type="button"
                  onClick={copy}
                  disabled={copying}
                  aria-busy={copying || undefined}
                  aria-label={copied ? "URL copied" : "Copy URL"}
                  className="inline-flex w-10 shrink-0 items-center justify-center rounded-[5px] border border-line text-ink-900 hover:bg-surface-3 disabled:opacity-60"
                >
                  {copying ? <Spinner className="h-4 w-4" /> : copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                </button>
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Open file"
                  className="inline-flex w-10 shrink-0 items-center justify-center rounded-[5px] border border-line text-ink-900 hover:bg-surface-3"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          ) : null}

          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-[13px]">
            <div>
              <dt className="text-muted">Type</dt>
              <dd className="mt-0.5 text-ink-900">{meta?.type ?? (meta ? "-" : "…")}</dd>
            </div>
            <div>
              <dt className="text-muted">Size</dt>
              <dd className="mt-0.5 tabular-nums text-ink-900">{meta ? formatBytes(meta.size) : "…"}</dd>
            </div>
            <div>
              <dt className="text-muted">Uploaded</dt>
              <dd className="mt-0.5 text-ink-900">{formatDay(item.created_at)}</dd>
            </div>
            <div className="min-w-0">
              <dt className="text-muted">Path</dt>
              <dd className="mt-0.5 truncate text-ink-900" title={item.storage_path}>
                {item.storage_path}
              </dd>
            </div>
          </dl>

          {msg ? <Notice tone={msg.tone}>{msg.text}</Notice> : null}
        </div>
      </Drawer>

      <Modal
        open={confirming}
        onClose={() => setConfirming(false)}
        title="Delete this file?"
        footer={
          <>
            <AdminBtn variant="ghost" onClick={() => setConfirming(false)} disabled={busy}>
              Cancel
            </AdminBtn>
            <DangerBtn onClick={remove} disabled={busy} pending={working === "delete"}>
              {working === "delete" ? "Deleting..." : "Delete file"}
            </DangerBtn>
          </>
        }
      >
        <p className="text-sm text-body">
          The file is removed from storage and the library. Pages that still use it will show an empty image.
        </p>
      </Modal>
    </>
  );
}
