"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { AdminBtn, Field, Panel, inputClass } from "@/components/admin/ui";
import { FileField } from "@/components/admin/FileField";
import { DangerBtn, Modal, Notice, Toggle } from "@/components/admin/studio/controls";
import { ChipSelect, GalleryField, ListInput } from "@/components/admin/studio/fields";
import { formatDay } from "@/components/admin/studio/format";
import { parseVideoUrl } from "@/components/admin/studio/video";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/constants";
import { company } from "@/lib/content";
import { refreshSite } from "@/lib/refresh-site";
import { startNavProgress } from "@/components/ui/NavProgress";
import type { CaseStudy } from "@/lib/cms";

export function WorkEditor({
  initial,
  clients,
  serviceOptions = [],
  industries = [],
  readOnly,
}: {
  initial?: CaseStudy;
  clients: { id: string; name: string }[];
  serviceOptions?: string[];
  industries?: string[];
  readOnly?: boolean;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial));
  const [summary, setSummary] = useState(initial?.summary ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [industry, setIndustry] = useState(initial?.industry ?? "");
  const [services, setServices] = useState<string[]>(initial?.services ?? []);
  const [outcomes, setOutcomes] = useState<string[]>(initial?.outcomes ?? []);
  const [clientId, setClientId] = useState(initial?.client_id ?? "");
  const [cover, setCover] = useState(initial?.cover_path ?? "");
  const [gallery, setGallery] = useState<string[]>(initial?.gallery ?? []);
  const [video, setVideo] = useState(initial?.video_url ?? "");
  const [year, setYear] = useState(initial?.project_year ? String(initial.project_year) : "");
  const [projectUrl, setProjectUrl] = useState(initial?.project_url ?? "");
  const [role, setRole] = useState(initial?.role ?? "");
  const [tech, setTech] = useState<string[]>(initial?.tech_stack ?? []);
  const [quote, setQuote] = useState(initial?.testimonial_quote ?? "");
  const [quoteAuthor, setQuoteAuthor] = useState(initial?.testimonial_author ?? "");
  const [quoteTitle, setQuoteTitle] = useState(initial?.testimonial_title ?? "");
  const [sortOrder, setSortOrder] = useState(String(initial?.sort_order ?? 0));
  const [metaTitle, setMetaTitle] = useState(initial?.meta_title ?? "");
  const [metaDescription, setMetaDescription] = useState(initial?.meta_description ?? "");
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [published, setPublished] = useState(Boolean(initial?.published_at));
  const [msg, setMsg] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const parsedVideo = parseVideoUrl(video);
  const wasLive = Boolean(initial?.published_at);

  async function save() {
    if (!title.trim()) return setMsg({ tone: "error", text: "Add a title first." });
    const parsedYear = year.trim() ? Number(year) : null;
    if (parsedYear !== null && (parsedYear < 2000 || parsedYear > 2100)) {
      return setMsg({ tone: "error", text: "Use a four-digit year." });
    }
    setBusy(true);
    setMsg(null);
    const supabase = createClient();
    const finalSlug = slugify(slug || title);
    const row = {
      title: title.trim(),
      slug: finalSlug,
      summary: summary.trim(),
      body,
      industry: industry.trim() || null,
      services,
      outcomes: outcomes.map((s) => s.trim()).filter(Boolean),
      client_id: clientId || null,
      cover_path: cover || null,
      gallery,
      video_url: video.trim() || null,
      project_year: parsedYear,
      project_url: projectUrl.trim() || null,
      role: role.trim() || null,
      tech_stack: tech.map((s) => s.trim()).filter(Boolean),
      testimonial_quote: quote.trim() || null,
      testimonial_author: quoteAuthor.trim() || null,
      testimonial_title: quoteTitle.trim() || null,
      sort_order: Number(sortOrder) || 0,
      meta_title: metaTitle.trim() || null,
      meta_description: metaDescription.trim() || null,
      featured,
      published_at: published ? initial?.published_at || new Date().toISOString() : null,
    };
    const { data, error } = initial
      ? await supabase.from("case_studies").update(row).eq("id", initial.id).select("id").maybeSingle()
      : await supabase.from("case_studies").insert(row).select("id").maybeSingle();
    if (error || !data) {
      setBusy(false);
      const text = error?.code === "23505" ? "Another case study already uses that slug." : error?.message ?? "Could not save.";
      return setMsg({ tone: "error", text });
    }
    if (published && !wasLive) {
      await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "work", title: row.title, url: `${company.domain}/work/${row.slug}`, excerpt: row.summary }),
      }).catch(() => null);
    }
    refreshSite();
    setBusy(false);
    setSlug(finalSlug);
    if (!initial) {
      startNavProgress();
      router.replace(`/console/work/${data.id}`);
      return;
    }
    setMsg({ tone: "ok", text: "Saved." });
    router.refresh();
  }

  async function remove() {
    if (!initial) return;
    setBusy(true);
    const { error } = await createClient().from("case_studies").delete().eq("id", initial.id);
    setBusy(false);
    if (error) {
      setConfirmDelete(false);
      return setMsg({ tone: "error", text: error.message });
    }
    refreshSite();
    startNavProgress();
    router.push("/console/work");
    router.refresh();
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-5">
        <Panel title="Story">
          <div className="space-y-4">
            <Field label="Title">
              <input
                className={inputClass}
                value={title}
                disabled={readOnly}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (!slugTouched) setSlug(slugify(e.target.value));
                }}
              />
            </Field>
            <Field label="Slug">
              <div className="flex items-center rounded-[5px] border border-line bg-white focus-within:border-brand-500">
                <span className="pl-3 text-sm text-muted">/work/</span>
                <input
                  className="w-full bg-transparent py-2.5 pr-3 text-sm text-ink-900 outline-none"
                  value={slug}
                  disabled={readOnly}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setSlug(e.target.value);
                  }}
                  onBlur={() => setSlug((s) => slugify(s))}
                />
              </div>
            </Field>
            <Field label="Summary">
              <textarea className={inputClass} rows={3} value={summary} disabled={readOnly} onChange={(e) => setSummary(e.target.value)} />
            </Field>
            <Field label="Body">
              <textarea className={inputClass} rows={14} value={body} disabled={readOnly} onChange={(e) => setBody(e.target.value)} />
            </Field>
          </div>
        </Panel>

        <Panel title="Outcomes">
          <ListInput value={outcomes} onChange={setOutcomes} placeholder="Checkout time cut by half" addLabel="Add outcome" disabled={readOnly} />
        </Panel>

        <Panel title="Scope">
          <div className="space-y-4">
            <div>
              <span className="mb-1.5 block text-[13px] font-medium text-ink-900">Services</span>
              <ChipSelect options={serviceOptions} value={services} onChange={setServices} disabled={readOnly} />
            </div>
            <div>
              <span className="mb-1.5 block text-[13px] font-medium text-ink-900">Tech stack</span>
              <ListInput value={tech} onChange={setTech} placeholder="Next.js" addLabel="Add technology" disabled={readOnly} />
            </div>
            <Field label="Industry">
              <input
                className={inputClass}
                list="work-industries"
                value={industry}
                disabled={readOnly}
                placeholder="Hospitality"
                onChange={(e) => setIndustry(e.target.value)}
              />
              <datalist id="work-industries">
                {industries.map((i) => (
                  <option key={i} value={i} />
                ))}
              </datalist>
            </Field>
          </div>
        </Panel>
      </div>

      <div className="space-y-5">
        <Panel title="Publish" meta={initial ? `Updated ${formatDay(initial.updated_at)}` : undefined}>
          <div className="space-y-3.5">
            <Toggle label="Live on the site" checked={published} onChange={setPublished} disabled={readOnly} />
            <Toggle label="Featured" checked={featured} onChange={setFeatured} disabled={readOnly} />
            {initial && wasLive ? (
              <a
                href={`/work/${initial.slug}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-brand-600 hover:underline"
              >
                View on site
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ) : null}
            {msg ? <Notice tone={msg.tone}>{msg.text}</Notice> : null}
            {!readOnly ? (
              <div className="flex flex-wrap gap-2 border-t border-line pt-3.5">
                <AdminBtn onClick={save} pending={busy}>
                  {busy ? "Saving..." : initial ? "Save changes" : "Create case study"}
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

        <Panel title="Client" action={!readOnly ? <Link href="/console/clients/new" className="text-xs font-medium text-brand-600 hover:underline">New client</Link> : null}>
          <div className="space-y-4">
            <select className={inputClass} value={clientId} disabled={readOnly} onChange={(e) => setClientId(e.target.value)}>
              <option value="">No client</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <Field label="Our role">
              <input className={inputClass} value={role} disabled={readOnly} placeholder="Design and build" onChange={(e) => setRole(e.target.value)} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Year">
                <input className={inputClass} inputMode="numeric" value={year} disabled={readOnly} placeholder="2025" onChange={(e) => setYear(e.target.value.replace(/\D/g, "").slice(0, 4))} />
              </Field>
              <Field label="Sort order" hint="Lower numbers appear first.">
                <input className={inputClass} inputMode="numeric" value={sortOrder} disabled={readOnly} onChange={(e) => setSortOrder(e.target.value.replace(/\D/g, "").slice(0, 4))} />
              </Field>
            </div>
            <Field label="Live link">
              <input className={inputClass} value={projectUrl} disabled={readOnly} placeholder="https://" onChange={(e) => setProjectUrl(e.target.value)} />
            </Field>
          </div>
        </Panel>

        <Panel title="Testimonial">
          <div className="space-y-4">
            <Field label="Quote">
              <textarea className={inputClass} rows={3} value={quote} disabled={readOnly} onChange={(e) => setQuote(e.target.value)} />
            </Field>
            <Field label="Name">
              <input className={inputClass} value={quoteAuthor} disabled={readOnly} onChange={(e) => setQuoteAuthor(e.target.value)} />
            </Field>
            <Field label="Title">
              <input className={inputClass} value={quoteTitle} disabled={readOnly} placeholder="Director, Acme Ltd" onChange={(e) => setQuoteTitle(e.target.value)} />
            </Field>
          </div>
        </Panel>

        <Panel title="Search">
          <div className="space-y-4">
            <Field label="Meta title" hint={`${metaTitle.length}/60`}>
              <input className={inputClass} value={metaTitle} maxLength={70} disabled={readOnly} onChange={(e) => setMetaTitle(e.target.value)} />
            </Field>
            <Field label="Meta description" hint={`${metaDescription.length}/160`}>
              <textarea className={inputClass} rows={3} maxLength={180} value={metaDescription} disabled={readOnly} onChange={(e) => setMetaDescription(e.target.value)} />
            </Field>
          </div>
        </Panel>

        <Panel title="Cover">
          <FileField label="Cover image" folder="work" value={cover} onChange={setCover} accept="image/*" disabled={readOnly} />
        </Panel>

        <Panel title="Gallery" meta={gallery.length ? `${gallery.length} image${gallery.length === 1 ? "" : "s"}` : undefined}>
          <GalleryField folder="work" value={gallery} onChange={setGallery} disabled={readOnly} />
        </Panel>

        <Panel title="Video">
          <div className="space-y-3">
            <input
              className={inputClass}
              value={video}
              disabled={readOnly}
              onChange={(e) => setVideo(e.target.value)}
              placeholder="YouTube or Vimeo link"
            />
            {parsedVideo ? (
              <div className="aspect-video overflow-hidden rounded-[5px] border border-line bg-ink-950">
                <iframe
                  src={parsedVideo.embedUrl}
                  title="Video preview"
                  className="h-full w-full"
                  allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : video.trim() ? (
              <p className="text-xs text-red-600">Use a YouTube or Vimeo link.</p>
            ) : null}
          </div>
        </Panel>
      </div>

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete this case study?"
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
        <p className="text-sm text-body">It comes off the site straight away. Linked videos stay in the library.</p>
      </Modal>
    </div>
  );
}
