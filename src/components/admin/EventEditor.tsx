"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { AdminBtn, Field, Panel, Pill, inputClass } from "@/components/admin/ui";
import { FileField } from "@/components/admin/FileField";
import { GalleryField } from "@/components/admin/events/GalleryField";
import { SpeakersEditor, type SpeakerDraft } from "@/components/admin/events/SpeakersEditor";
import { AgendaEditor, type AgendaDraft } from "@/components/admin/events/AgendaEditor";
import { TicketsEditor, emptyTicket, type TicketDraft } from "@/components/admin/events/TicketsEditor";
import { defaultStartInput, fromNairobiInput, toNairobiInput } from "@/components/admin/events/time";
import { newKey } from "@/components/admin/events/RowTools";
import { EVENT_CATEGORIES, EVENT_MODES, isEventOver, parseAgenda, parseSpeakers } from "@/components/events/utils";
import { createClient } from "@/lib/supabase/client";
import { formatKes, slugify } from "@/lib/constants";
import { company } from "@/lib/content";
import { cn } from "@/lib/utils";
import type { Event, TicketType } from "@/lib/cms";
import { refreshSite } from "@/lib/refresh-site";
import { startNavProgress } from "@/components/ui/NavProgress";

const META_TITLE_MAX = 60;
const META_DESC_MAX = 160;

function Counter({ value, max }: { value: string; max: number }) {
  return (
    <span className={cn("tabular-nums", value.length > max ? "text-brand-600" : "text-muted")}>
      {value.length}/{max}
    </span>
  );
}

function intOrNull(value: string) {
  return value.trim() === "" ? null : Number(value);
}

export function EventEditor({
  initial,
  tickets: initialTickets = [],
  orderCounts = {},
  summary,
}: {
  initial?: Event;
  tickets?: TicketType[];
  orderCounts?: Record<string, number>;
  summary?: { sold: number; revenue: number; checkedIn: number };
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [summaryText, setSummaryText] = useState(initial?.summary ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [startsAt, setStartsAt] = useState(() => toNairobiInput(initial?.starts_at) || defaultStartInput());
  const [endsAt, setEndsAt] = useState(toNairobiInput(initial?.ends_at));
  const [regCloses, setRegCloses] = useState(toNairobiInput(initial?.registration_closes_at));
  const [mode, setMode] = useState(initial?.mode ?? "mombasa");
  const [venue, setVenue] = useState(initial?.venue ?? "");
  const [capacity, setCapacity] = useState(initial?.capacity != null ? String(initial.capacity) : "");
  const [cover, setCover] = useState(initial?.cover_path ?? "");
  const [gallery, setGallery] = useState<string[]>(initial?.gallery ?? []);
  const [speakers, setSpeakers] = useState<SpeakerDraft[]>(() =>
    parseSpeakers(initial?.speakers).map((s) => ({ key: newKey(), name: s.name, role: s.role, photo_path: s.photo_path ?? "" })),
  );
  const [agenda, setAgenda] = useState<AgendaDraft[]>(() =>
    parseAgenda(initial?.agenda).map((a) => ({ key: newKey(), time: a.time, title: a.title, detail: a.detail ?? "" })),
  );
  const [tickets, setTickets] = useState<TicketDraft[]>(() =>
    initialTickets.length
      ? initialTickets.map((t) => ({
          key: t.id,
          id: t.id,
          name: t.name,
          description: t.description,
          price_kes: String(t.price_kes),
          quota: t.quota != null ? String(t.quota) : "",
          sales_start: toNairobiInput(t.sales_start),
          sales_end: toNairobiInput(t.sales_end),
          max_per_order: String(t.max_per_order),
        }))
      : [emptyTicket("General")],
  );
  const [savedTicketIds, setSavedTicketIds] = useState(() => initialTickets.map((t) => t.id));
  const [metaTitle, setMetaTitle] = useState(initial?.meta_title ?? "");
  const [metaDescription, setMetaDescription] = useState(initial?.meta_description ?? "");
  const [published, setPublished] = useState(Boolean(initial?.published_at));
  const [publishedAt, setPublishedAt] = useState(initial?.published_at ?? null);
  const [eventId, setEventId] = useState(initial?.id);
  const [err, setErr] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const past = initial ? isEventOver(initial.starts_at) : false;
  const status = !publishedAt ? "Draft" : past ? "Past" : "Live";

  function validate() {
    if (!title.trim()) return "Add a title.";
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return "Use lowercase letters, numbers and dashes in the slug.";
    const start = fromNairobiInput(startsAt);
    if (!start) return "Set a start date and time.";
    const end = fromNairobiInput(endsAt);
    if (end && end <= start) return "The end must be after the start.";
    const reg = fromNairobiInput(regCloses);
    if (reg && end && reg > end) return "Registration must close before the event ends.";
    for (const t of tickets) {
      if (!t.name.trim()) return "Every ticket type needs a name.";
      if (t.max_per_order === "" || Number(t.max_per_order) < 1) return `${t.name}: max per order must be at least 1.`;
      const s = fromNairobiInput(t.sales_start);
      const e = fromNairobiInput(t.sales_end);
      if (s && e && e <= s) return `${t.name}: sales must end after they start.`;
    }
    if (published && tickets.length === 0) return "Add at least one ticket type before publishing.";
    return null;
  }

  async function save() {
    setErr(null);
    setNotice(null);
    const problem = validate();
    if (problem) return setErr(problem);
    setBusy(true);
    const supabase = createClient();
    const nextPublishedAt = published ? publishedAt || new Date().toISOString() : null;
    const row = {
      title: title.trim(),
      slug,
      category: category.trim() || null,
      summary: summaryText.trim(),
      body,
      starts_at: fromNairobiInput(startsAt)!,
      ends_at: fromNairobiInput(endsAt),
      registration_closes_at: fromNairobiInput(regCloses),
      mode,
      venue: venue.trim() || null,
      capacity: intOrNull(capacity),
      cover_path: cover || null,
      gallery,
      speakers: speakers
        .filter((s) => s.name.trim())
        .map((s) => ({ name: s.name.trim(), role: s.role.trim(), ...(s.photo_path ? { photo_path: s.photo_path } : {}) })),
      agenda: agenda
        .filter((a) => a.title.trim())
        .map((a) => ({ time: a.time.trim(), title: a.title.trim(), ...(a.detail.trim() ? { detail: a.detail.trim() } : {}) })),
      meta_title: metaTitle.trim() || null,
      meta_description: metaDescription.trim() || null,
      published_at: nextPublishedAt,
    };

    let id = eventId;
    if (id) {
      const { error } = await supabase.from("events").update(row).eq("id", id);
      if (error) {
        setBusy(false);
        return setErr(error.code === "23505" ? "Another event already uses this slug." : error.message);
      }
    } else {
      const { data, error } = await supabase.from("events").insert(row).select("id").single();
      if (error || !data) {
        setBusy(false);
        return setErr(error?.code === "23505" ? "Another event already uses this slug." : error?.message || "Could not save the event.");
      }
      id = data.id;
      setEventId(id);
    }

    const problems: string[] = [];
    const keptIds = tickets.map((t) => t.id).filter(Boolean) as string[];
    for (const oldId of savedTicketIds) {
      if (keptIds.includes(oldId) || (orderCounts[oldId] ?? 0) > 0) continue;
      const { error } = await supabase.from("ticket_types").delete().eq("id", oldId);
      if (error) problems.push(error.message);
    }
    const nextTickets = [...tickets];
    for (let i = 0; i < nextTickets.length; i++) {
      const t = nextTickets[i];
      const payload = {
        event_id: id!,
        name: t.name.trim(),
        description: t.description.trim(),
        price_kes: Number(t.price_kes) || 0,
        quota: intOrNull(t.quota),
        sales_start: fromNairobiInput(t.sales_start),
        sales_end: fromNairobiInput(t.sales_end),
        max_per_order: Math.max(1, Number(t.max_per_order) || 1),
        sort_order: i,
      };
      if (t.id) {
        const { error } = await supabase.from("ticket_types").update(payload).eq("id", t.id);
        if (error) problems.push(`${t.name}: ${error.message}`);
      } else {
        const { data, error } = await supabase.from("ticket_types").insert(payload).select("id").single();
        if (error || !data) problems.push(`${t.name}: ${error?.message ?? "not saved"}`);
        else nextTickets[i] = { ...t, id: data.id };
      }
    }
    setTickets(nextTickets);
    setSavedTicketIds(nextTickets.map((t) => t.id).filter(Boolean) as string[]);

    if (nextPublishedAt && !publishedAt) {
      await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "event",
          title: row.title,
          url: `${company.domain}/events/${row.slug}`,
          excerpt: row.summary,
        }),
      }).catch(() => {});
    }
    setPublishedAt(nextPublishedAt);
    setBusy(false);

    if (problems.length) {
      setErr(`Event saved. Some tickets did not save: ${problems.join("; ")}`);
    } else {
      setNotice("Saved.");
    }
    refreshSite();
    if (!initial) {
      startNavProgress();
      router.replace(`/console/events/${id}`);
    }
    router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="min-w-0 space-y-6">
        <Panel title="Details">
          <div className="space-y-4">
            <Field label="Title">
              <input
                className={inputClass}
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (!initial) setSlug(slugify(e.target.value));
                }}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Slug">
                <input className={inputClass} value={slug} onChange={(e) => setSlug(slugify(e.target.value))} />
              </Field>
              <Field label="Category">
                <input
                  className={inputClass}
                  list="event-categories"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
                <datalist id="event-categories">
                  {EVENT_CATEGORIES.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </Field>
            </div>
            <Field label="Summary">
              <textarea
                className={inputClass + " min-h-20"}
                value={summaryText}
                onChange={(e) => setSummaryText(e.target.value)}
              />
            </Field>
            <Field label="Body">
              <textarea className={inputClass + " min-h-48"} value={body} onChange={(e) => setBody(e.target.value)} />
            </Field>
          </div>
        </Panel>

        <Panel title="Schedule" meta="Nairobi time (EAT)">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Starts">
              <input className={inputClass} type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
            </Field>
            <Field label="Ends">
              <input className={inputClass} type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
            </Field>
            <Field label="Registration closes">
              <input className={inputClass} type="datetime-local" value={regCloses} onChange={(e) => setRegCloses(e.target.value)} />
            </Field>
          </div>
        </Panel>

        <Panel title="Place">
          <div className="grid gap-4 sm:grid-cols-[180px_minmax(0,1fr)]">
            <Field label="Mode">
              <select className={inputClass} value={mode} onChange={(e) => setMode(e.target.value)}>
                {EVENT_MODES.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={mode === "online" ? "Platform" : "Venue"}>
              <input
                className={inputClass}
                value={venue}
                placeholder={mode === "online" ? "Google Meet" : "Upeo Africa Technologies, Moi Avenue, Mombasa"}
                onChange={(e) => setVenue(e.target.value)}
              />
            </Field>
          </div>
        </Panel>

        <Panel title="Media">
          <div className="space-y-5">
            <FileField label="Cover" folder="events" value={cover} onChange={setCover} accept="image/*" />
            <GalleryField value={gallery} onChange={setGallery} />
          </div>
        </Panel>

        <Panel title="Speakers">
          <SpeakersEditor value={speakers} onChange={setSpeakers} />
        </Panel>

        <Panel title="Agenda">
          <AgendaEditor value={agenda} onChange={setAgenda} />
        </Panel>

        <Panel title="Tickets">
          <div className="mb-4 max-w-[200px]">
            <Field label="Event capacity">
              <input
                className={inputClass}
                inputMode="numeric"
                placeholder="No limit"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value.replace(/[^\d]/g, ""))}
              />
            </Field>
          </div>
          <TicketsEditor value={tickets} onChange={setTickets} orderCounts={orderCounts} />
        </Panel>

        <Panel title="SEO">
          <div className="space-y-4">
            <Field label="Meta title">
              <input className={inputClass} value={metaTitle} placeholder={title} onChange={(e) => setMetaTitle(e.target.value)} />
              <span className="mt-1 block text-right text-xs">
                <Counter value={metaTitle} max={META_TITLE_MAX} />
              </span>
            </Field>
            <Field label="Meta description">
              <textarea
                className={inputClass + " min-h-20"}
                value={metaDescription}
                placeholder={summaryText}
                onChange={(e) => setMetaDescription(e.target.value)}
              />
              <span className="mt-1 block text-right text-xs">
                <Counter value={metaDescription} max={META_DESC_MAX} />
              </span>
            </Field>
          </div>
        </Panel>
      </div>

      <aside className="lg:sticky lg:top-6 lg:self-start">
        <Panel
          title="Publish"
          action={
            <Pill tone={status === "Live" ? "success" : status === "Past" ? "ink" : "neutral"}>{status}</Pill>
          }
        >
          <div className="space-y-4">
            <label className="flex cursor-pointer items-center justify-between gap-3">
              <span className="text-sm font-medium text-ink-900">Show on /events</span>
              <button
                type="button"
                role="switch"
                aria-checked={published}
                onClick={() => setPublished((v) => !v)}
                className={cn(
                  "relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200",
                  published ? "bg-brand-500" : "bg-surface-3",
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200",
                    published ? "translate-x-5" : "translate-x-0.5",
                  )}
                />
              </button>
            </label>

            {summary ? (
              <dl className="grid grid-cols-3 gap-2 border-y border-line py-3 text-center">
                <div>
                  <dt className="text-[11px] text-muted">Sold</dt>
                  <dd className="font-display text-base font-semibold tabular-nums text-ink-900">{summary.sold}</dd>
                </div>
                <div>
                  <dt className="text-[11px] text-muted">Checked in</dt>
                  <dd className="font-display text-base font-semibold tabular-nums text-ink-900">{summary.checkedIn}</dd>
                </div>
                <div>
                  <dt className="text-[11px] text-muted">Revenue</dt>
                  <dd className="truncate font-display text-base font-semibold tabular-nums text-ink-900">
                    {formatKes(summary.revenue).replace("KES ", "")}
                  </dd>
                </div>
              </dl>
            ) : null}

            {err ? <p className="text-sm text-red-600">{err}</p> : null}
            {notice ? <p className="text-sm text-emerald-700">{notice}</p> : null}

            <div className="flex flex-col gap-2">
              <AdminBtn onClick={save} pending={busy}>
                {busy ? "Saving..." : published && !publishedAt ? "Save and publish" : "Save"}
              </AdminBtn>
              {publishedAt && slug ? (
                <a
                  href={`/events/${slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 text-[13px] font-medium text-brand-600 hover:underline"
                >
                  View public page
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                </a>
              ) : null}
            </div>
          </div>
        </Panel>
      </aside>
    </div>
  );
}
