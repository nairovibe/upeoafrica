"use client";

import { createClient } from "@/lib/supabase/client";
import { mediaKind } from "@/components/admin/studio/format";
import { invalidateMediaCache } from "@/components/admin/studio/MediaPicker";

export type Bucket = "public-media" | "product-files";

export function storagePath(folder: string, file: File) {
  const dot = file.name.lastIndexOf(".");
  const base = (dot > 0 ? file.name.slice(0, dot) : file.name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  const ext = dot > 0 ? file.name.slice(dot).toLowerCase().replace(/[^.a-z0-9]/g, "") : "";
  return `${folder.replace(/^\/+|\/+$/g, "")}/${Date.now()}-${base || "file"}${ext}`;
}

/** Uploads through the Storage REST endpoint so progress can be reported; supabase-js does not expose it. */
export async function uploadFile({
  file,
  folder,
  bucket = "public-media",
  onProgress,
}: {
  file: File;
  folder: string;
  bucket?: Bucket;
  onProgress?: (fraction: number) => void;
}) {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Your session has ended. Sign in again.");

  const path = storagePath(folder, file);
  const endpoint = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/${bucket}/${path}`;

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", endpoint);
    xhr.setRequestHeader("Authorization", `Bearer ${session.access_token}`);
    xhr.setRequestHeader("apikey", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    xhr.setRequestHeader("x-upsert", "false");
    xhr.setRequestHeader("cache-control", "max-age=3600");
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(e.loaded / e.total);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) return resolve();
      let message = `Upload failed (${xhr.status})`;
      try {
        const body = JSON.parse(xhr.responseText) as { message?: string; error?: string };
        message = body.message || body.error || message;
      } catch {}
      reject(new Error(message));
    };
    xhr.onerror = () => reject(new Error("Upload failed. Check your connection."));
    xhr.send(file);
  });

  onProgress?.(1);

  let mediaId: string | null = null;
  if (bucket === "public-media") {
    const { data } = await supabase
      .from("media")
      .insert({ storage_path: path, bucket, alt: "", kind: mediaKind(file.type) })
      .select("id")
      .maybeSingle();
    mediaId = data?.id ?? null;
    invalidateMediaCache();
  }
  return { path, mediaId };
}
