"use client";

import { Fragment, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminBtn, Pill, inputClass } from "@/components/admin/ui";
import { seoTone, type ArticleStatus } from "@/components/blog/analysis";
import {
  deleteArticles,
  emptyTrash,
  quickEditArticle,
  restoreArticles,
  setArticlesStatus,
  trashArticles,
} from "@/app/console/(console)/insights/actions";

export type ArticleListRow = {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  tags: string[];
  featured: boolean;
  published_at: string | null;
  seo_score: number | null;
  reading_minutes: number | null;
  updated_at: string;
  status: ArticleStatus;
};

type QuickState = {
  id: string;
  title: string;
  slug: string;
  category: string;
  tags: string;
  featured: boolean;
  status: ArticleStatus;
  scheduleAt: string;
};

const STATUS_TONE: Record<ArticleStatus, "success" | "warning" | "neutral"> = {
  live: "success",
  scheduled: "warning",
  draft: "neutral",
};

function toLocalInput(iso: string | null) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function publicPath(slug: string) {
  return slug.replace(/__trashed(?:-\d+)?$/, "");
}

export function ArticleTable({
  rows,
  categories,
  canEdit,
  trash,
  publicOrigin,
  empty,
}: {
  rows: ArticleListRow[];
  categories: string[];
  canEdit: boolean;
  trash: boolean;
  publicOrigin: string;
  empty: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulk, setBulk] = useState("");
  const [quick, setQuick] = useState<QuickState | null>(null);
  const [quickError, setQuickError] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const allRef = useRef<HTMLInputElement>(null);

  const selectedIds = rows.filter((row) => selected.has(row.id)).map((row) => row.id);
  const allChecked = rows.length > 0 && selectedIds.length === rows.length;

  useEffect(() => {
    if (allRef.current) allRef.current.indeterminate = selectedIds.length > 0 && !allChecked;
  }, [allChecked, selectedIds.length]);

  function toggle(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function run(action: () => Promise<{ ok: true; note?: string } | { ok: false; error: string }>, after?: () => void) {
    setError("");
    setNote("");
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setNote(result.note ?? "");
      setSelected(new Set());
      setBulk("");
      after?.();
      router.refresh();
    });
  }

  function applyBulk() {
    if (!selectedIds.length) {
      setError("Select at least one article.");
      return;
    }
    if (bulk === "trash") run(() => trashArticles(selectedIds));
    else if (bulk === "restore") run(() => restoreArticles(selectedIds));
    else if (bulk === "delete") {
      if (!window.confirm(`Delete ${selectedIds.length === 1 ? "this article" : `these ${selectedIds.length} articles`} permanently?`)) return;
      run(() => deleteArticles(selectedIds));
    } else if (bulk === "live" || bulk === "draft") run(() => setArticlesStatus(selectedIds, bulk));
    else setError("Choose a bulk action.");
  }

  function saveQuick(event: React.FormEvent) {
    event.preventDefault();
    if (!quick) return;
    const published_at = quick.status === "draft" || !quick.scheduleAt ? null : new Date(quick.scheduleAt).toISOString();
    if (quick.status !== "draft" && quick.scheduleAt && Number.isNaN(new Date(quick.scheduleAt).getTime())) {
      setQuickError("That date is not valid.");
      return;
    }
    setQuickError("");
    run(
      () =>
        quickEditArticle({
          id: quick.id,
          title: quick.title,
          slug: quick.slug,
          category: quick.category,
          tags: quick.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
          featured: quick.featured,
          status: quick.status,
          published_at,
        }),
      () => setQuick(null),
    );
  }

  const headers = canEdit
    ? ["", "Title", "Category", "Status", "SEO", "Read", "Updated"]
    : ["Title", "Category", "Status", "SEO", "Read", "Updated"];

  return (
    <div>
      {canEdit ? (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <select value={bulk} onChange={(event) => setBulk(event.target.value)} className={`${inputClass} h-9 w-auto min-w-44 py-0`} aria-label="Bulk actions">
            <option value="">Bulk actions</option>
            {trash ? (
              <>
                <option value="restore">Restore</option>
                <option value="delete">Delete permanently</option>
              </>
            ) : (
              <>
                <option value="live">Publish</option>
                <option value="draft">Move to draft</option>
                <option value="trash">Move to trash</option>
              </>
            )}
          </select>
          <AdminBtn variant="ghost" onClick={applyBulk} disabled={pending} pending={pending && !quick}>
            Apply
          </AdminBtn>
          {trash && rows.length ? (
            <AdminBtn
              variant="danger"
              disabled={pending}
              onClick={() => {
                if (!window.confirm("Empty the trash? Every article in it will be deleted.")) return;
                run(() => emptyTrash());
              }}
            >
              Empty trash
            </AdminBtn>
          ) : null}
          {note ? <p className="text-sm text-emerald-700">{note}</p> : null}
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-[5px] border border-line bg-white">
        <table className="w-full text-left text-sm" style={{ minWidth: 760 }}>
          <thead>
            <tr className="border-b border-line bg-surface-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
              {headers.map((header) => (
                <th key={header || "select"} className="whitespace-nowrap px-4 py-3 font-semibold">
                  {header === "" ? (
                    <input
                      ref={allRef}
                      type="checkbox"
                      className="accent-brand-500"
                      checked={allChecked}
                      disabled={!rows.length || pending}
                      aria-label="Select all articles"
                      onChange={() => setSelected(allChecked ? new Set() : new Set(rows.map((row) => row.id)))}
                    />
                  ) : (
                    header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={headers.length} className="px-4 py-14 text-center text-sm text-muted">
                  {empty}
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const liveUrl = `${publicOrigin}/blogs/${row.slug}`;
                const open = quick?.id === row.id;
                return (
                  <Fragment key={row.id}>
                  <tr className="group border-b border-line align-top last:border-0">
                    {canEdit ? (
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          className="accent-brand-500"
                          checked={selected.has(row.id)}
                          disabled={pending}
                          aria-label={`Select ${row.title}`}
                          onChange={() => toggle(row.id)}
                        />
                      </td>
                    ) : null}
                    <td className="max-w-md px-4 py-3">
                      {canEdit && !trash ? (
                        <Link href={`/console/insights/${row.id}`} className="block truncate font-medium text-ink-900 hover:text-brand-600">
                          {row.title}
                        </Link>
                      ) : (
                        <span className="block truncate font-medium text-ink-900">{row.title}</span>
                      )}
                      <span className="mt-0.5 block truncate text-xs text-muted">/blogs/{publicPath(row.slug)}</span>
                      {canEdit ? (
                        <div className={`${open ? "flex" : "hidden"} mt-1 flex-wrap items-center text-[12px] group-hover:flex group-focus-within:flex max-sm:flex`}>
                          {trash ? (
                            <>
                              <button type="button" className="font-medium text-brand-700 hover:underline" disabled={pending} onClick={() => run(() => restoreArticles([row.id]))}>
                                Restore
                              </button>
                              <span className="px-1.5 text-muted" aria-hidden>|</span>
                              <button
                                type="button"
                                className="font-medium text-red-700 hover:underline"
                                disabled={pending}
                                onClick={() => {
                                  if (!window.confirm(`Delete "${row.title}" permanently?`)) return;
                                  run(() => deleteArticles([row.id]));
                                }}
                              >
                                Delete permanently
                              </button>
                            </>
                          ) : (
                            <>
                              <Link href={`/console/insights/${row.id}`} className="font-medium text-ink-900 hover:text-brand-600">
                                Edit
                              </Link>
                              <span className="px-1.5 text-muted" aria-hidden>|</span>
                              <button
                                type="button"
                                className="font-medium text-ink-900 hover:text-brand-600"
                                disabled={pending}
                                onClick={() => {
                                  setQuickError("");
                                  setQuick({
                                    id: row.id,
                                    title: row.title,
                                    slug: row.slug,
                                    category: row.category ?? "",
                                    tags: row.tags.join(", "),
                                    featured: row.featured,
                                    status: row.status,
                                    scheduleAt: toLocalInput(row.published_at),
                                  });
                                }}
                              >
                                Quick edit
                              </button>
                              <span className="px-1.5 text-muted" aria-hidden>|</span>
                              <button type="button" className="font-medium text-red-700 hover:underline" disabled={pending} onClick={() => run(() => trashArticles([row.id]))}>
                                Trash
                              </button>
                              {row.status === "live" ? (
                                <>
                                  <span className="px-1.5 text-muted" aria-hidden>|</span>
                                  <a href={liveUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-ink-900 hover:text-brand-600">
                                    View
                                  </a>
                                </>
                              ) : (
                                <>
                                  <span className="px-1.5 text-muted" aria-hidden>|</span>
                                  <a href={`/blogs/${row.slug}/preview`} target="_blank" rel="noopener noreferrer" className="font-medium text-ink-900 hover:text-brand-600">
                                    Preview
                                  </a>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      ) : row.status === "live" && !trash ? (
                        <a href={liveUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex text-[12px] font-medium text-brand-700 hover:underline">
                          View
                        </a>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-body">{row.category || <span className="text-muted">—</span>}</td>
                    <td className="px-4 py-3">
                      {trash ? <Pill tone="danger">Trash</Pill> : <Pill tone={STATUS_TONE[row.status]}>{row.status}</Pill>}
                    </td>
                    <td className="px-4 py-3">
                      {row.seo_score == null ? <span className="text-muted">—</span> : <Pill tone={seoTone(row.seo_score)}>{row.seo_score}</Pill>}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-body">{row.reading_minutes ? `${row.reading_minutes} min` : "—"}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-body">
                      {new Date(row.updated_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                  </tr>
                  {open && quick ? (
                    <tr className="border-b border-line bg-surface-2 last:border-0">
                      <td colSpan={headers.length} className="px-4 py-4">
                        <form onSubmit={saveQuick}>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <label className="block sm:col-span-2">
                              <span className="mb-1.5 block text-[13px] font-medium text-ink-900">Title</span>
                              <input className={inputClass} value={quick.title} onChange={(event) => setQuick({ ...quick, title: event.target.value })} />
                            </label>
                            <label className="block">
                              <span className="mb-1.5 block text-[13px] font-medium text-ink-900">Slug</span>
                              <input className={inputClass} value={quick.slug} onChange={(event) => setQuick({ ...quick, slug: event.target.value })} />
                            </label>
                            <label className="block">
                              <span className="mb-1.5 block text-[13px] font-medium text-ink-900">Status</span>
                              <select className={inputClass} value={quick.status} onChange={(event) => setQuick({ ...quick, status: event.target.value as ArticleStatus })}>
                                <option value="draft">Draft</option>
                                <option value="scheduled">Scheduled</option>
                                <option value="live">Live</option>
                              </select>
                            </label>
                            {quick.status !== "draft" ? (
                              <label className="block">
                                <span className="mb-1.5 block text-[13px] font-medium text-ink-900">{quick.status === "scheduled" ? "Goes live" : "Published"}</span>
                                <input type="datetime-local" className={inputClass} value={quick.scheduleAt} onChange={(event) => setQuick({ ...quick, scheduleAt: event.target.value })} />
                              </label>
                            ) : null}
                            <label className="block">
                              <span className="mb-1.5 block text-[13px] font-medium text-ink-900">Category</span>
                              <input className={inputClass} list="article-categories" value={quick.category} onChange={(event) => setQuick({ ...quick, category: event.target.value })} />
                              <datalist id="article-categories">
                                {categories.map((category) => (
                                  <option key={category} value={category} />
                                ))}
                              </datalist>
                            </label>
                            <label className="block sm:col-span-2">
                              <span className="mb-1.5 block text-[13px] font-medium text-ink-900">Tags</span>
                              <input className={inputClass} value={quick.tags} placeholder="Separate tags with commas" onChange={(event) => setQuick({ ...quick, tags: event.target.value })} />
                            </label>
                            <label className="flex items-center gap-2 text-sm text-ink-900 sm:col-span-2">
                              <input type="checkbox" className="accent-brand-500" checked={quick.featured} onChange={(event) => setQuick({ ...quick, featured: event.target.checked })} />
                              Featured on the blog
                            </label>
                          </div>
                          {quickError ? <p className="mt-3 text-sm text-red-600">{quickError}</p> : null}
                          <div className="mt-3 flex gap-2">
                            <AdminBtn type="submit" disabled={pending} pending={pending}>
                              Update
                            </AdminBtn>
                            <AdminBtn variant="ghost" disabled={pending} onClick={() => setQuick(null)}>
                              Cancel
                            </AdminBtn>
                          </div>
                        </form>
                      </td>
                    </tr>
                  ) : null}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
