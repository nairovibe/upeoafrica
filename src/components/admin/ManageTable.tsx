"use client";

import { Fragment, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminBtn, Pill, inputClass, type PillTone } from "@/components/admin/ui";
import { Notice } from "@/components/admin/studio/controls";
import { catalogAction, type DeskResource } from "@/app/console/(console)/catalog/actions";

export type DeskItem = {
  id: string;
  title: string;
  path: string;
  editHref: string;
  viewHref: string | null;
  extraHref?: { href: string; label: string } | null;
  status: string;
  tone: PillTone;
  updated: string;
  deleted: boolean;
  details: string[];
  quickName: string;
  quickSlug: string;
  quickLive: boolean;
};

const actionLink = "font-medium text-ink-900 hover:text-brand-600";
const sep = <span className="px-1.5 text-muted" aria-hidden>|</span>;

export function ManageTable({
  resource,
  items,
  canEdit,
  headers,
  hasSlug,
  hasLive,
  nameLabel,
  trashView,
  empty,
}: {
  resource: DeskResource;
  items: DeskItem[];
  canEdit: boolean;
  headers: string[];
  hasSlug: boolean;
  hasLive: boolean;
  nameLabel: string;
  trashView: boolean;
  empty: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [picked, setPicked] = useState<string[]>([]);
  const [quick, setQuick] = useState<string | null>(null);
  const [draft, setDraft] = useState({ name: "", slug: "", live: false });
  const [error, setError] = useState<string | null>(null);

  const ids = items.map((item) => item.id);
  const allOn = ids.length > 0 && ids.every((id) => picked.includes(id));
  const columns = (canEdit ? 1 : 0) + 3 + headers.length;

  function run(op: Parameters<typeof catalogAction>[0]["op"], target = picked, patch?: { name?: string; slug?: string; live?: boolean }) {
    setError(null);
    start(async () => {
      const result = await catalogAction({ resource, op, ids: target, patch });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setPicked([]);
      setQuick(null);
      router.refresh();
    });
  }

  function openQuick(item: DeskItem) {
    setQuick(item.id);
    setDraft({ name: item.quickName, slug: item.quickSlug, live: item.quickLive });
    setError(null);
  }

  return (
    <div className="space-y-3">
      {error ? <Notice tone="error">{error}</Notice> : null}
      <div className="overflow-x-auto rounded-[5px] border border-line bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-surface-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
              {canEdit ? (
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    className="accent-brand-500"
                    aria-label={allOn ? "Clear selection" : "Select all"}
                    checked={allOn}
                    ref={(node) => {
                      if (node) node.indeterminate = picked.length > 0 && !allOn;
                    }}
                    onChange={() => setPicked(allOn ? [] : ids)}
                  />
                </th>
              ) : null}
              <th className="px-4 py-3">{nameLabel}</th>
              {headers.map((header) => (
                <th key={header} className="px-4 py-3">{header}</th>
              ))}
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Updated</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={columns} className="px-4 py-14 text-center text-sm text-muted">{empty}</td>
              </tr>
            ) : (
              items.map((item) => {
                const on = picked.includes(item.id);
                const open = quick === item.id;
                return (
                  <Fragment key={item.id}>
                    <tr className="group border-b border-line align-top last:border-0">
                      {canEdit ? (
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            className="accent-brand-500"
                            aria-label={`Select ${item.title}`}
                            checked={on}
                            onChange={() => setPicked((prev) => (prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id]))}
                          />
                        </td>
                      ) : null}
                      <td className="max-w-md px-4 py-3">
                        <Link href={item.editHref} className="block truncate font-medium text-ink-900 hover:text-brand-600">
                          {item.title}
                        </Link>
                        {item.path ? <span className="mt-0.5 block truncate text-xs text-muted">{item.path}</span> : null}
                        {canEdit ? (
                          <div className={`${open ? "flex" : "hidden"} mt-1 flex-wrap items-center text-[12px] group-hover:flex group-focus-within:flex max-sm:flex`}>
                            {trashView ? (
                              <>
                                <button type="button" className={actionLink} disabled={pending} onClick={() => run("restore", [item.id])}>Restore</button>
                                {sep}
                                <button
                                  type="button"
                                  className="font-medium text-red-700 hover:underline disabled:opacity-50"
                                  disabled={pending}
                                  onClick={() => {
                                    if (!window.confirm(`Delete "${item.title}" permanently?`)) return;
                                    run("delete", [item.id]);
                                  }}
                                >
                                  Delete permanently
                                </button>
                              </>
                            ) : (
                              <>
                                <Link href={item.editHref} className={actionLink}>Edit</Link>
                                {sep}
                                <button type="button" className={actionLink} onClick={() => openQuick(item)}>Quick edit</button>
                                {sep}
                                <button type="button" className="font-medium text-red-700 hover:underline disabled:opacity-50" disabled={pending} onClick={() => run("trash", [item.id])}>
                                  Trash
                                </button>
                                {item.viewHref ? (
                                  <>
                                    {sep}
                                    <Link href={item.viewHref} target="_blank" className={actionLink}>View</Link>
                                  </>
                                ) : null}
                                {item.extraHref ? (
                                  <>
                                    {sep}
                                    <Link href={item.extraHref.href} className={actionLink}>{item.extraHref.label}</Link>
                                  </>
                                ) : null}
                              </>
                            )}
                          </div>
                        ) : null}
                      </td>
                      {item.details.map((detail, index) => (
                        <td key={`${item.id}-${headers[index] ?? index}`} className="max-w-48 truncate px-4 py-3 text-body" title={detail}>
                          {detail || "-"}
                        </td>
                      ))}
                      <td className="px-4 py-3">
                        <Pill tone={item.tone}>{item.status}</Pill>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-body">{item.updated}</td>
                    </tr>
                    {open ? (
                      <tr className="border-b border-line bg-surface-2">
                        <td colSpan={columns} className="px-4 py-4">
                          <form
                            className="grid gap-3 sm:grid-cols-2"
                            onSubmit={(event) => {
                              event.preventDefault();
                              run("quick", [item.id], draft);
                            }}
                          >
                            <label className="block">
                              <span className="mb-1.5 block text-[13px] font-medium text-ink-900">{nameLabel}</span>
                              <input className={inputClass} value={draft.name} onChange={(event) => setDraft((prev) => ({ ...prev, name: event.target.value }))} />
                            </label>
                            {hasSlug ? (
                              <label className="block">
                                <span className="mb-1.5 block text-[13px] font-medium text-ink-900">Slug</span>
                                <input className={inputClass} value={draft.slug} onChange={(event) => setDraft((prev) => ({ ...prev, slug: event.target.value }))} />
                              </label>
                            ) : null}
                            {hasLive ? (
                              <label className="inline-flex items-center gap-2 text-sm text-ink-900 sm:col-span-2">
                                <input type="checkbox" className="accent-brand-500" checked={draft.live} onChange={(event) => setDraft((prev) => ({ ...prev, live: event.target.checked }))} />
                                Live
                              </label>
                            ) : null}
                            <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
                              <AdminBtn type="submit" pending={pending} disabled={pending}>Update</AdminBtn>
                              <button type="button" className="text-sm text-body hover:text-ink-900" onClick={() => setQuick(null)}>Cancel</button>
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

      {canEdit && (picked.length > 0 || trashView) ? (
        <div className="sticky bottom-4 z-10 flex flex-wrap items-center gap-2 rounded-[5px] border border-line bg-white px-3 py-2 shadow-sm">
          {picked.length > 0 ? <span className="text-[13px] text-body">{picked.length} selected</span> : null}
          {trashView ? (
            <>
              {picked.length > 0 ? (
                <>
                  <AdminBtn variant="ghost" disabled={pending} onClick={() => run("restore")}>Restore</AdminBtn>
                  <AdminBtn variant="danger" disabled={pending} onClick={() => { if (window.confirm("Delete the selected rows permanently?")) run("delete"); }}>Delete permanently</AdminBtn>
                </>
              ) : null}
              <AdminBtn variant="ghost" disabled={pending} onClick={() => { if (window.confirm("Empty the trash? This cannot be undone.")) run("empty", []); }}>Empty trash</AdminBtn>
            </>
          ) : (
            <>
              {hasLive ? (
                <>
                  <AdminBtn variant="ghost" disabled={pending} onClick={() => run("publish")}>Publish</AdminBtn>
                  <AdminBtn variant="ghost" disabled={pending} onClick={() => run("unpublish")}>Move to draft</AdminBtn>
                </>
              ) : null}
              <AdminBtn variant="danger" disabled={pending} onClick={() => run("trash")}>Move to trash</AdminBtn>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
