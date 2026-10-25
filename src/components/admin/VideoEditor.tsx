"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminBtn, Field, inputClass } from "@/components/admin/ui";
import { createClient } from "@/lib/supabase/client";

export function VideoEditor() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [provider, setProvider] = useState("youtube");
  const [url, setUrl] = useState("");
  const [err, setErr] = useState<string | null>(null);

  async function save() {
    const supabase = createClient();
    const { error } = await supabase.from("videos").insert({
      title,
      provider,
      url: url || null,
      published_at: new Date().toISOString(),
    });
    if (error) return setErr(error.message);
    setTitle("");
    setUrl("");
    router.refresh();
  }

  return (
    <div className="max-w-xl space-y-4 border border-line bg-white p-4 rounded-[5px]">
      <Field label="Title">
        <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} />
      </Field>
      <Field label="Provider">
        <select className={inputClass} value={provider} onChange={(e) => setProvider(e.target.value)}>
          <option value="youtube">YouTube</option>
          <option value="vimeo">Vimeo</option>
        </select>
      </Field>
      <Field label="URL">
        <input className={inputClass} value={url} onChange={(e) => setUrl(e.target.value)} />
      </Field>
      {err && <p className="text-sm text-brand-600">{err}</p>}
      <AdminBtn variant="ink" onClick={save}>Add video</AdminBtn>
    </div>
  );
}
