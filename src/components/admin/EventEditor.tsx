"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminBtn, Field, inputClass } from "@/components/admin/ui";
import { FileField } from "@/components/admin/FileField";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/constants";
import { company } from "@/lib/content";
import type { Event, TicketType } from "@/lib/cms";

const MODES = [
  { value: "mombasa", label: "Mombasa" },
  { value: "online", label: "Online" },
  { value: "hybrid", label: "Hybrid" },
];

function toLocalInput(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function defaultStart() {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  d.setHours(9, 0, 0, 0);
  return toLocalInput(d.toISOString());
}

type TicketDraft = { key: string; id?: string; name: string; price_kes: string; quota: string };

export function EventEditor({
  initial,
  tickets: initialTickets,
}: {
  initial?: Event;
  tickets?: TicketType[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [summary, setSummary] = useState(initial?.summary ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [venue, setVenue] = useState(initial?.venue ?? "");
  const [mode, setMode] = useState(initial?.mode ?? "mombasa");
  const [startsAt, setStartsAt] = useState(toLocalInput(initial?.starts_at) || defaultStart());
  const [endsAt, setEndsAt] = useState(toLocalInput(initial?.ends_at));
  const [cover, setCover] = useState(initial?.cover_path ?? "");
  const [capacity, setCapacity] = useState(initial?.capacity != null ? String(initial.capacity) : "");
  const [published, setPublished] = useState(Boolean(initial?.published_at));
  const [tickets, setTickets] = useState<TicketDraft[]>(
    initialTickets?.length
      ? initialTickets.map((t) => ({
          key: t.id,
          id: t.id,
          name: t.name,
          price_kes: String(t.price_kes),
          quota: t.quota != null ? String(t.quota) : "",
        }))
      : [{ key: "new", name: "General", price_kes: "0", quota: "" }],
  );
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function setTicket(i: number, patch: Partial<TicketDraft>) {
    setTickets((rows) => rows.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
  }

  async function save() {
    setBusy(true);
    setErr(null);
    if (!title.trim() || !startsAt) {
      setBusy(false);
      return setErr("Title and start time are required.");
    }
    const supabase = createClient();
    const row = {
      title: title.trim(),
      slug: slug || slugify(title),
      summary,
      body,
      venue: venue || null,
      mode,
      starts_at: new Date(startsAt).toISOString(),
      ends_at: endsAt ? new Date(endsAt).toISOString() : null,
      cover_path: cover || null,
      capacity: capacity ? Number(capacity) : null,
      published_at: published ? initial?.published_at || new Date().toISOString() : null,
    };

    let eventId = initial?.id;
    if (initial) {
      const { error } = await supabase.from("events").update(row).eq("id", initial.id);
      if (error) {
        setBusy(false);
        return setErr(error.message);
      }
    } else {
      const { data, error } = await supabase.from("events").insert(row).select("id").single();
      if (error || !data) {
        setBusy(false);
        return setErr(error?.message || "Could not save the event.");
      }
      eventId = data.id;
    }

    const kept = tickets.filter((t) => t.name.trim());
    const keptIds = kept.map((t) => t.id).filter(Boolean) as string[];
    if (initialTickets) {
      for (const old of initialTickets) {
        if (!keptIds.includes(old.id)) {
          await supabase.from("ticket_types").delete().eq("id", old.id);
        }
      }
    }
    for (let i = 0; i < kept.length; i++) {
      const t = kept[i];
      const payload = {
        event_id: eventId!,
        name: t.name.trim(),
        price_kes: Number(t.price_kes) || 0,
        quota: t.quota ? Number(t.quota) : null,
        sort_order: i,
      };
      if (t.id) {
        await supabase.from("ticket_types").update(payload).eq("id", t.id);
      } else {
        await supabase.from("ticket_types").insert(payload);
      }
    }

    setBusy(false);
    if (published) {
      await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "event",
          title,
          url: `${company.domain}/events/${row.slug}`,
          excerpt: summary,
        }),
      });
    }
    router.push(`/admin/events/${eventId}`);
    router.refresh();
  }

  return (
    <div className="max-w-3xl space-y-4">
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
      <Field label="Slug">
        <input className={inputClass} value={slug} onChange={(e) => setSlug(e.target.value)} />
      </Field>
      <Field label="Summary">
        <textarea className={inputClass + " min-h-20"} value={summary} onChange={(e) => setSummary(e.target.value)} />
      </Field>
      <Field label="Details">
        <textarea className={inputClass + " min-h-32"} value={body} onChange={(e) => setBody(e.target.value)} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Mode">
          <select className={inputClass} value={mode} onChange={(e) => setMode(e.target.value)}>
            {MODES.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Venue">
          <input className={inputClass} value={venue} onChange={(e) => setVenue(e.target.value)} />
        </Field>
        <Field label="Starts">
          <input className={inputClass} type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
        </Field>
        <Field label="Ends">
          <input className={inputClass} type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
        </Field>
        <Field label="Capacity" hint="Leave empty for no hard cap.">
          <input className={inputClass} value={capacity} onChange={(e) => setCapacity(e.target.value)} />
        </Field>
      </div>
      <FileField label="Cover" folder="events" value={cover} onChange={setCover} accept="image/*" />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
        Publish on /events
      </label>

      <section className="border border-line bg-white p-4 rounded-[5px] space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Ticket types</p>
        {tickets.map((t, i) => (
          <div key={t.key} className="grid gap-2 sm:grid-cols-[1fr_120px_100px_auto]">
            <input
              className={inputClass}
              placeholder="Name"
              value={t.name}
              onChange={(e) => setTicket(i, { name: e.target.value })}
            />
            <input
              className={inputClass}
              placeholder="KES"
              value={t.price_kes}
              onChange={(e) => setTicket(i, { price_kes: e.target.value })}
            />
            <input
              className={inputClass}
              placeholder="Quota"
              value={t.quota}
              onChange={(e) => setTicket(i, { quota: e.target.value })}
            />
            <AdminBtn
              variant="ghost"
              onClick={() => setTickets((rows) => rows.filter((_, idx) => idx !== i))}
            >
              Remove
            </AdminBtn>
          </div>
        ))}
        <AdminBtn
          variant="ghost"
          onClick={() =>
            setTickets((rows) => [
              ...rows,
              { key: `t-${Date.now()}`, name: "", price_kes: "0", quota: "" },
            ])
          }
        >
          Add ticket type
        </AdminBtn>
      </section>

      {err && <p className="text-sm text-brand-600">{err}</p>}
      <AdminBtn variant="ink" onClick={save} disabled={busy}>
        {busy ? "Saving..." : "Save event"}
      </AdminBtn>
    </div>
  );
}
