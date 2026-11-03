"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, CircleAlert, UploadCloud } from "lucide-react";
import { Spinner } from "@/components/admin/pending";
import { uploadFile } from "@/components/admin/studio/upload";
import { cn } from "@/lib/utils";

const MAX_BYTES = 10 * 1024 * 1024;

type Job = { key: string; name: string; progress: number; error?: string; done?: boolean };

export function MediaDrop({
  folder = "library",
  accept = "image/*,video/mp4,video/webm,application/pdf",
  disabled,
}: {
  folder?: string;
  accept?: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [refreshing, startRefresh] = useTransition();
  const uploading = jobs.filter((j) => !j.done && !j.error).length;

  function patch(key: string, next: Partial<Job>) {
    setJobs((prev) => prev.map((j) => (j.key === key ? { ...j, ...next } : j)));
  }

  async function start(list: FileList | null) {
    if (!list || list.length === 0 || disabled) return;
    const files = Array.from(list);
    const batch = files.map((f, i) => ({ key: `${Date.now()}-${i}-${f.name}`, name: f.name, progress: 0 }));
    setJobs((prev) => [...batch, ...prev.filter((j) => !j.done)]);

    await Promise.all(
      files.map(async (file, i) => {
        const { key } = batch[i];
        if (file.size > MAX_BYTES) {
          patch(key, { error: "Over the 10 MB limit" });
          return;
        }
        try {
          await uploadFile({ file, folder, onProgress: (p) => patch(key, { progress: p }) });
          patch(key, { progress: 1, done: true });
        } catch (e) {
          patch(key, { error: e instanceof Error ? e.message : "Upload failed" });
        }
      }),
    );
    if (input.current) input.current.value = "";
    startRefresh(() => router.refresh());
  }

  return (
    <div>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        onClick={() => !disabled && input.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !disabled) {
            e.preventDefault();
            input.current?.click();
          }
        }}
        onDragOver={(e) => {
          if (disabled) return;
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          start(e.dataTransfer.files);
        }}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-[5px] border border-dashed bg-white px-5 py-8 text-center transition-colors",
          disabled ? "cursor-not-allowed border-line opacity-60" : "cursor-pointer hover:border-brand-400",
          over ? "border-brand-500 bg-brand-50" : "border-line",
        )}
      >
        {uploading > 0 || refreshing ? (
          <Spinner className="h-6 w-6 text-brand-500" />
        ) : (
          <UploadCloud className="h-6 w-6 text-brand-500" strokeWidth={1.75} />
        )}
        <p className="text-sm font-medium text-ink-900" aria-live="polite">
          {uploading > 0
            ? `Uploading ${uploading} ${uploading === 1 ? "file" : "files"}...`
            : refreshing
              ? "Updating library..."
              : "Drop files here or click to upload"}
        </p>
        <p className="text-xs text-muted">Images, MP4 or PDF up to 10 MB</p>
        <input
          ref={input}
          type="file"
          multiple
          accept={accept}
          className="sr-only"
          disabled={disabled}
          onChange={(e) => start(e.target.files)}
        />
      </div>
      {jobs.length > 0 ? (
        <ul className="mt-3 divide-y divide-line rounded-[5px] border border-line bg-white">
          {jobs.map((job) => (
            <li key={job.key} className="flex items-center gap-3 px-3 py-2 text-xs">
              <span className="min-w-0 flex-1 truncate text-ink-900">{job.name}</span>
              {job.error ? (
                <span className="flex items-center gap-1 text-red-600">
                  <CircleAlert className="h-3.5 w-3.5" />
                  {job.error}
                </span>
              ) : job.done ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              ) : (
                <span className="flex w-32 items-center gap-2">
                  <span className="h-1 flex-1 overflow-hidden rounded-full bg-surface-3">
                    <span className="block h-full bg-brand-500 transition-[width]" style={{ width: `${Math.round(job.progress * 100)}%` }} />
                  </span>
                  <span className="w-8 text-right tabular-nums text-muted">{Math.round(job.progress * 100)}%</span>
                </span>
              )}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
