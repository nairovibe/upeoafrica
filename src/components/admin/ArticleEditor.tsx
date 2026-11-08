"use client";

/* eslint-disable @next/next/no-img-element */
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Editor } from "@tiptap/react";
import { ArrowLeft, ArrowRight, ExternalLink, ImagePlus, Search, X } from "lucide-react";
import { AdminBtn, Field, Panel, Pill, inputClass } from "@/components/admin/ui";
import { createClient } from "@/lib/supabase/client";
import { publicMediaUrl, slugify } from "@/lib/constants";
import { company } from "@/lib/content";
import { cn } from "@/lib/utils";
import type { Article } from "@/lib/cms";
import { analyzeSeo, articleStatus, toHtml, type ArticleStatus } from "@/components/blog/analysis";
import { RichEditor } from "@/components/admin/blog/RichEditor";
import { CategoryField } from "@/components/admin/blog/CategoryField";
import { ChipsInput } from "@/components/admin/blog/ChipsInput";
import { ImageSlot } from "@/components/admin/blog/ImageSlot";
import { MediaPicker } from "@/components/admin/blog/MediaPicker";
import { GooglePreview, Meter, SeoScore } from "@/components/admin/blog/SeoPanel";
import { saveArticle, type ArticleInput } from "@/app/console/(console)/insights/actions";
import { startNavProgress } from "@/components/ui/NavProgress";
import { refreshSite } from "@/lib/refresh-site";

type FormState = Omit<ArticleInput, "published_at"> & { status: ArticleStatus; scheduleAt: string };

type StoredDraft = { form: FormState; savedAt: number };

function toLocalInput(iso: string | null | undefined) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromArticle(a: Article | undefined, operatorName: string): FormState {
  return {
    title: a?.title ?? "",
    slug: a?.slug ?? "",
    excerpt: a?.excerpt ?? "",
    body: a ? toHtml(a.body) : "",
    category: a?.category ?? "",
    tags: a?.tags ?? [],
    audience: a?.audience ?? "general",
    author_name: a?.author_name ?? operatorName,
    cover_path: a?.cover_path ?? "",
    og_image_path: a?.og_image_path ?? "",
    gallery: a?.gallery ?? [],
    focus_keyword: a?.focus_keyword ?? "",
    keywords: a?.keywords ?? [],
    meta_title: a?.meta_title ?? "",
    meta_description: a?.meta_description ?? "",
    canonical_url: a?.canonical_url ?? "",
    noindex: a?.noindex ?? false,
    featured: a?.featured ?? false,
    status: articleStatus(a?.published_at),
    scheduleAt: toLocalInput(a?.published_at),
  };
}

const STATUS_LABEL: Record<ArticleStatus, string> = { draft: "Draft", scheduled: "Scheduled", live: "Live" };

export function ArticleEditor({
  initial,
  operatorName,
  operatorPhoto = "",
  categories,
  tags,
}: {
  initial?: Article;
  operatorName: string;
  operatorPhoto?: string;
  categories: string[];
  tags: string[];
}) {
  const router = useRouter();
  const draftKey = `upeo:article-draft:${initial?.id ?? "new"}`;
  const [form, setForm] = useState<FormState>(() => fromArticle(initial, operatorName));
  const [baseline, setBaseline] = useState(() => JSON.stringify(fromArticle(initial, operatorName)));
  const [savedPublishedAt, setSavedPublishedAt] = useState<string | null>(initial?.published_at ?? null);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial));
  const [slugTaken, setSlugTaken] = useState(false);
  const [restore, setRestore] = useState<StoredDraft | null>(null);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState(() => {
    const seed = [...categories];
    const current = initial?.category?.trim();
    if (current && !seed.some((name) => name.toLowerCase() === current.toLowerCase())) seed.push(current);
    return seed.sort((a, b) => a.localeCompare(b));
  });
  const [saving, setSaving] = useState<"save" | "live" | null>(null);
  const [navigating, startNav] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [draftSavedAt, setDraftSavedAt] = useState<number | null>(null);
  const editorRef = useRef<Editor | null>(null);
  const savedSlug = useRef(initial?.slug ?? "");
  const slugChecked = useRef(new Map<string, boolean>());
  const busy = saving !== null || navigating;

  const dirty = JSON.stringify(form) !== baseline;
  const set = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  }, []);

  function chooseCategory(name: string) {
    const clean = name.trim();
    set("category", clean);
    if (!clean) return;
    setCategoryOptions((list) => (list.some((item) => item.toLowerCase() === clean.toLowerCase()) ? list : [...list, clean].sort((a, b) => a.localeCompare(b))));
  }

  const deferredBody = useDeferredValue(form.body);
  const report = useMemo(
    () =>
      analyzeSeo({
        title: form.title,
        slug: form.slug,
        metaTitle: form.meta_title,
        metaDescription: form.meta_description,
        excerpt: form.excerpt,
        focusKeyword: form.focus_keyword,
        keywords: form.keywords,
        html: deferredBody,
        domain: company.domain,
        hasCover: Boolean(form.cover_path),
      }),
    [form.title, form.slug, form.meta_title, form.meta_description, form.excerpt, form.focus_keyword, form.keywords, form.cover_path, deferredBody],
  );

  // Offer a newer local draft than what the database holds.
  useEffect(() => {
    const raw = window.localStorage.getItem(draftKey);
    if (!raw) return;
    try {
      const stored = JSON.parse(raw) as StoredDraft;
      const newer = !initial || stored.savedAt > new Date(initial.updated_at).getTime();
      if (newer && JSON.stringify(stored.form) !== baseline) queueMicrotask(() => setRestore(stored));
      else window.localStorage.removeItem(draftKey);
    } catch {
      window.localStorage.removeItem(draftKey);
    }
    // Only on mount: later baselines come from our own saves.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftKey]);

  useEffect(() => {
    if (!dirty || restore) return;
    const t = setTimeout(() => {
      const savedAt = Date.now();
      window.localStorage.setItem(draftKey, JSON.stringify({ form, savedAt } satisfies StoredDraft));
      setDraftSavedAt(savedAt);
    }, 800);
    return () => clearTimeout(t);
  }, [form, dirty, restore, draftKey]);

  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank" || e.metaKey || e.ctrlKey || a.closest(".ProseMirror")) return;
      if (a.origin !== window.location.origin) return;
      if (!window.confirm("You have unsaved changes. Leave this page?")) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClick, true);
    };
  }, [dirty]);

  useEffect(() => {
    const slug = form.slug;
    if (!slug) return;
    const known = slug === savedSlug.current ? false : slugChecked.current.get(slug);
    if (known !== undefined) {
      queueMicrotask(() => setSlugTaken(known));
      return;
    }
    let cancelled = false;
    const t = setTimeout(async () => {
      const supabase = createClient();
      let q = supabase.from("articles").select("id").eq("slug", slug).limit(1);
      if (initial?.id) q = q.neq("id", initial.id);
      const { data, error } = await q;
      if (cancelled || error) return;
      const taken = Boolean(data?.length);
      slugChecked.current.set(slug, taken);
      setSlugTaken(taken);
    }, 500);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [form.slug, initial?.id]);

  const onEditor = useCallback((editor: Editor) => {
    editorRef.current = editor;
  }, []);

  function applyRestore() {
    if (!restore) return;
    setForm(restore.form);
    editorRef.current?.commands.setContent(restore.form.body, { emitUpdate: false });
    setSlugTouched(true);
    setRestore(null);
  }

  function discardRestore() {
    window.localStorage.removeItem(draftKey);
    setRestore(null);
  }

  async function save(nextStatus: ArticleStatus = form.status) {
    setErr(null);
    setNotice(null);
    if (!form.title.trim()) return setErr("Add a title.");
    if (slugTaken) return setErr("Another article already uses this slug.");
    let publishedAt: string | null = null;
    if (nextStatus === "scheduled") {
      const when = form.scheduleAt ? new Date(form.scheduleAt) : null;
      if (!when || Number.isNaN(when.getTime()) || when.getTime() <= Date.now()) {
        return setErr("Pick a future date and time to schedule.");
      }
      publishedAt = when.toISOString();
    } else if (nextStatus === "live") {
      publishedAt = articleStatus(savedPublishedAt) === "live" ? savedPublishedAt : new Date().toISOString();
    }

    const { status: _status, scheduleAt: _scheduleAt, ...rest } = form;
    void _status;
    void _scheduleAt;
    setSaving(nextStatus === "live" ? "live" : "save");
    try {
      const res = await saveArticle(initial?.id ?? null, { ...rest, slug: form.slug || slugify(form.title), published_at: publishedAt });
      if (!res.ok) return setErr(res.error);

      const wentLive = nextStatus === "live" && articleStatus(savedPublishedAt) !== "live";
      if (wentLive) {
        await fetch("/api/publish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "article",
            title: form.title,
            url: `${company.domain}/blogs/${res.slug}`,
            excerpt: form.excerpt,
          }),
        }).catch(() => null);
      }

      const next: FormState = { ...form, slug: res.slug, status: nextStatus, scheduleAt: toLocalInput(publishedAt) };
      window.localStorage.removeItem(draftKey);
      savedSlug.current = res.slug;
      setForm(next);
      setBaseline(JSON.stringify(next));
      setSavedPublishedAt(publishedAt);
      setDraftSavedAt(null);
      const engines = res.search
        ? res.search.indexnow > 0
          ? "IndexNow and Bing have the URL."
          : res.search.bing
            ? "Bing has the sitemap. IndexNow is not configured on this deployment."
            : "Search engines were not notified. Set INDEXNOW_KEY on the host."
        : "";
      setNotice(
        [wentLive ? "Published." : nextStatus === "scheduled" ? "Scheduled." : nextStatus === "live" ? "Updated." : "Saved.", engines]
          .filter(Boolean)
          .join(" "),
      );
      refreshSite();
      startNav(() => {
        if (!initial) {
          startNavProgress();
          router.replace(`/console/insights/${res.id}`);
        }
        router.refresh();
      });
    } catch {
      setErr("Could not save. Check your connection and try again.");
    } finally {
      setSaving(null);
    }
  }

  const savedStatus = articleStatus(savedPublishedAt);
  const previewHref = initial
    ? savedStatus === "live"
      ? `${company.domain}/blogs/${initial.slug}`
      : `/blogs/${initial.slug}/preview`
    : null;

  return (
    <div>
      {restore ? (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[5px] border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-ink-900">
          <span>
            An unsaved draft from {new Date(restore.savedAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })} is on this device.
          </span>
          <span className="flex gap-2">
            <AdminBtn variant="ghost" onClick={discardRestore}>Discard</AdminBtn>
            <AdminBtn onClick={applyRestore}>Restore draft</AdminBtn>
          </span>
        </div>
      ) : null}

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-4">
          <div className="rounded-[5px] border border-line bg-white p-5">
            <label className="block">
              <span className="text-[13px] font-medium text-ink-900">Title</span>
              <input
                className="mt-1.5 block w-full rounded-[5px] border border-line bg-surface-2 px-3 py-2.5 text-[15px] text-ink-900 outline-none placeholder:text-muted focus:border-brand-500"
                placeholder="Add the article title"
                value={form.title}
                onChange={(e) => {
                  const title = e.target.value.replace(/\n/g, " ");
                  setForm((f) => ({ ...f, title, slug: slugTouched ? f.slug : slugify(title) }));
                }}
              />
            </label>
            <div className="mt-3 flex items-center gap-2 text-[13px] text-muted">
              <span className="shrink-0">Permalink: /blogs/</span>
              <input
                className={cn("min-w-0 flex-1 rounded-[5px] border border-line bg-white px-2.5 py-1.5 text-[13px] text-ink-900 outline-none focus:border-brand-500", slugTaken && "border-red-400")}
                value={form.slug}
                placeholder="auto-generated-from-title"
                onChange={(e) => {
                  setSlugTouched(true);
                  set("slug", slugify(e.target.value));
                }}
              />
            </div>
            {slugTaken ? <p className="mt-1 text-xs text-red-600">Already used by another article.</p> : null}
          </div>

          <div>
            <p className="mb-1.5 text-[13px] font-medium text-ink-900">Body</p>
          <RichEditor
            initialHtml={form.body}
            onChange={(html) => set("body", html)}
            onEditor={onEditor}
            footer={
              <>
                <span className="tabular-nums">{report.words.toLocaleString("en-KE")} words</span>
                <span>{report.minutes} min read</span>
                <span className="ml-auto">
                  {dirty ? (draftSavedAt ? `Draft kept on this device ${new Date(draftSavedAt).toLocaleTimeString("en-GB", { timeStyle: "short" })}` : "Unsaved changes") : "All changes saved"}
                </span>
              </>
            }
          />
          </div>

          <details open className="rounded-[5px] border border-line bg-white">
            <summary className="flex cursor-pointer list-none items-center gap-2 px-5 py-4 font-display text-[15px] font-semibold text-ink-900">
              <Search className="h-4 w-4 text-muted" />
              SEO and search appearance
            </summary>
            <div className="space-y-4 border-t border-line px-5 py-4">
              <Field label="SEO title">
                <input className={inputClass} value={form.meta_title} placeholder="Defaults to the article title" onChange={(e) => set("meta_title", e.target.value)} />
                <span className="mt-1 block text-xs text-muted">Pre-filled from the title. Override it when the search result should read differently.</span>
                <span className="mt-1 block text-right text-xs"><Meter value={(form.meta_title || form.title).length} max={60} min={30} /></span>
              </Field>
              <Field label="Meta description">
                <textarea className={inputClass} rows={3} value={form.meta_description} placeholder="Shown in Google results and social shares." onChange={(e) => set("meta_description", e.target.value)} />
                <span className="mt-1 block text-right text-xs"><Meter value={(form.meta_description || form.excerpt).length} max={160} min={70} /></span>
              </Field>
              <Field label="Focus keyword">
                <input className={inputClass} value={form.focus_keyword} placeholder="e.g. M-Pesa checkout for shops" onChange={(e) => set("focus_keyword", e.target.value)} />
                <span className="mt-1 block text-xs text-muted">The main phrase this page should rank for.</span>
              </Field>
              <div>
                <span className="mb-1.5 block text-[13px] font-medium text-ink-900">Supporting keywords ({form.keywords.length}/5)</span>
                <ChipsInput value={form.keywords.slice(0, 5)} onChange={(v) => set("keywords", v.slice(0, 5))} placeholder="Type and press Enter" />
                <span className="mt-1 block text-xs text-muted">Related phrases. Use them in the article so the page can be cited for more than one query.</span>
              </div>
              <Field label="Canonical URL">
                <input className={inputClass} value={form.canonical_url} placeholder={`${company.domain}/blogs/${form.slug || "slug"}`} onChange={(e) => set("canonical_url", e.target.value)} />
              </Field>
              <label className="flex items-center justify-between gap-2 text-sm text-ink-900">
                Hide from search engines
                <Toggle checked={form.noindex} onChange={(v) => set("noindex", v)} />
              </label>
              <GooglePreview title={form.title} metaTitle={form.meta_title} description={form.meta_description || form.excerpt} slug={form.slug} />
            </div>
          </details>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-4">
          <SeoScore
            report={report}
            titleLength={(form.meta_title || form.title).length}
            metaLength={(form.meta_description || form.excerpt).length}
          />

          <Panel title="Publish" action={<Pill tone={savedStatus === "live" ? "success" : savedStatus === "scheduled" ? "warning" : "neutral"}>{STATUS_LABEL[savedStatus]}</Pill>}>
            <Field label="Status">
              <select className={inputClass} value={form.status} onChange={(e) => set("status", e.target.value as FormState["status"])}>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="live">Live</option>
              </select>
            </Field>
            {form.status === "scheduled" ? (
              <div className="mt-3">
                <Field label="Publish on">
                  <input
                    type="datetime-local"
                    className={inputClass}
                    value={form.scheduleAt}
                    min={toLocalInput(new Date().toISOString())}
                    onChange={(e) => set("scheduleAt", e.target.value)}
                  />
                </Field>
              </div>
            ) : null}
            <label className="mt-3 flex items-start gap-2 text-sm text-ink-900">
              <input type="checkbox" className="mt-1 accent-brand-500" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} />
              <span>
                Featured on the blog
                <span className="mt-0.5 block text-xs font-normal text-muted">Shown ahead of the latest posts.</span>
              </span>
            </label>
            {err ? <p className="mt-3 text-sm text-red-600">{err}</p> : null}
            {notice && !dirty ? <p className="mt-3 text-sm text-emerald-600">{notice}</p> : null}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <AdminBtn variant="ghost" onClick={() => save(form.status)} disabled={busy} pending={saving === "save"}>
                {saving === "save" ? "Saving..." : form.status === "scheduled" ? "Schedule" : form.status === "live" ? "Save" : "Save draft"}
              </AdminBtn>
              <AdminBtn variant="ink" onClick={() => save("live")} disabled={busy} pending={saving === "live"}>
                {saving === "live" ? "Publishing..." : savedStatus === "live" ? "Update" : "Publish"}
              </AdminBtn>
            </div>
            {previewHref ? (
              <a href={previewHref} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-[13px] font-medium text-brand-600 hover:underline">
                {savedStatus === "live" ? "View" : "Preview"} <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ) : null}
          </Panel>

          <Panel title="Featured image" meta="Used as the cover and the social share image.">
            <div className="space-y-4">
              <ImageSlot label="Image" value={form.cover_path} onChange={(v) => set("cover_path", v)} />
              <ImageSlot label="Open Graph image" value={form.og_image_path} onChange={(v) => set("og_image_path", v)} aspect="aspect-[1200/630]" />
            </div>
          </Panel>

          <Panel title="Category">
            <CategoryField value={form.category} options={categoryOptions} onChange={chooseCategory} />
          </Panel>

          <Panel title="Tags">
            <ChipsInput value={form.tags} suggestions={tags} onChange={(v) => set("tags", v)} placeholder="Add a tag" />
          </Panel>

          <Panel title="Excerpt" meta="Short summary on listing cards and in search results.">
            <textarea className={inputClass} rows={4} value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} />
            <span className="mt-1 block text-right text-xs"><Meter value={form.excerpt.length} max={160} min={70} /></span>
          </Panel>

          <Panel title="Byline">
            <div className="grid gap-3">
              <Field label="Author">
                <input className={inputClass} value={form.author_name} onChange={(e) => set("author_name", e.target.value)} />
              </Field>
              {form.author_name.trim() === operatorName.trim() && operatorName.trim() ? (
                <p className="flex items-center gap-2 text-xs text-muted">
                  {publicMediaUrl(operatorPhoto) ? (
                    <img src={publicMediaUrl(operatorPhoto) ?? ""} alt="" className="h-8 w-8 rounded-full object-cover" />
                  ) : null}
                  Your profile photo is used on this article. Change it in Settings.
                </p>
              ) : null}
              <Field label="Audience">
                <select className={inputClass} value={form.audience} onChange={(e) => set("audience", e.target.value)}>
                  <option value="general">General</option>
                  <option value="founders">Founders</option>
                </select>
              </Field>
            </div>
          </Panel>

          <Panel
            title="Gallery"
            meta={form.gallery.length ? `${form.gallery.length} images under the article` : undefined}
            action={
              <button type="button" onClick={() => setGalleryOpen(true)} className="inline-flex items-center gap-1 text-[13px] font-medium text-brand-600 hover:underline">
                <ImagePlus className="h-3.5 w-3.5" /> Add
              </button>
            }
          >
            {form.gallery.length === 0 ? (
              <p className="text-sm text-muted">No gallery images.</p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {form.gallery.map((path, i) => (
                  <div key={`${path}-${i}`} className="group relative">
                    <img src={publicMediaUrl(path) ?? ""} alt="" className="aspect-square w-full rounded-[5px] border border-line object-cover" />
                    <div className="absolute inset-x-1 bottom-1 flex justify-between opacity-0 transition-opacity group-hover:opacity-100">
                      <MiniBtn label="Move left" disabled={i === 0} onClick={() => set("gallery", swap(form.gallery, i, i - 1))}>
                        <ArrowLeft className="h-3 w-3" />
                      </MiniBtn>
                      <MiniBtn label="Remove" onClick={() => set("gallery", form.gallery.filter((_, k) => k !== i))}>
                        <X className="h-3 w-3" />
                      </MiniBtn>
                      <MiniBtn label="Move right" disabled={i === form.gallery.length - 1} onClick={() => set("gallery", swap(form.gallery, i, i + 1))}>
                        <ArrowRight className="h-3 w-3" />
                      </MiniBtn>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <MediaPicker
              open={galleryOpen}
              multiple
              title="Gallery images"
              onClose={() => setGalleryOpen(false)}
              onPick={(items) => {
                setGalleryOpen(false);
                set("gallery", [...form.gallery, ...items.map((i) => i.path).filter((p) => !form.gallery.includes(p))]);
              }}
            />
          </Panel>

        </aside>
      </div>
    </div>
  );
}

function swap<T>(list: T[], a: number, b: number) {
  const next = [...list];
  [next[a], next[b]] = [next[b], next[a]];
  return next;
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn("relative h-5 w-9 shrink-0 rounded-full transition-colors", checked ? "bg-brand-500" : "bg-line")}
    >
      <span className={cn("absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-[left]", checked ? "left-[18px]" : "left-0.5")} />
    </button>
  );
}

function MiniBtn({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="flex h-6 w-6 items-center justify-center rounded-[4px] bg-white/95 text-ink-900 shadow-sm hover:text-brand-600 disabled:opacity-30"
    >
      {children}
    </button>
  );
}
