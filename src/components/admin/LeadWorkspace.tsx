"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AdminBtn, Field, inputClass } from "@/components/admin/ui";
import { LEAD_STATUSES } from "@/lib/constants";
import type { EmailLog, Lead } from "@/lib/cms";

const TEMPLATES = [
  {
    id: "thanks",
    label: "Thanks, we will call",
    body: "Thank you for writing in. We have your brief and will call you within 24 hours to agree next steps.",
  },
  {
    id: "more",
    label: "Need a bit more",
    body: "Thank you. To scope this properly we need a little more: timeline, the systems you already use, and who signs off. Reply to this email and we will come back the same day.",
  },
  {
    id: "invoice",
    label: "Proposal / invoice next",
    body: "Thank you. We are putting the next step in writing. Watch for an invoice or a short proposal from this address.",
  },
];

export function LeadWorkspace({ lead, logs }: { lead: Lead; logs: EmailLog[] }) {
  const router = useRouter();
  const [notes, setNotes] = useState(lead.notes ?? "");
  const [status, setStatus] = useState(lead.status);
  const [body, setBody] = useState(TEMPLATES[0].body);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function saveNotes() {
    const supabase = createClient();
    await supabase.from("leads").update({ notes, status }).eq("id", lead.id);
    setMsg("Saved.");
    router.refresh();
  }

  async function sendReply() {
    setBusy(true);
    setMsg(null);
    const res = await fetch("/api/admin/leads/reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId: lead.id, body }),
    });
    const json = (await res.json()) as { error?: string };
    setBusy(false);
    if (!res.ok) return setMsg(json.error || "Could not send.");
    setMsg("Sent.");
    router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <section className="border border-line bg-white p-4 rounded-[5px]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Brief</p>
          <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-muted">Email</dt>
              <dd className="font-medium">{lead.email}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Phone</dt>
              <dd>{lead.phone || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Company</dt>
              <dd>{lead.company || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Budget</dt>
              <dd>{lead.budget || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Stage</dt>
              <dd>{lead.stage || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Timeline</dt>
              <dd>{lead.timeline || "—"}</dd>
            </div>
          </dl>
          <p className="mt-4 text-sm leading-relaxed text-body whitespace-pre-wrap">
            {(lead.services ?? []).join(", ") || ""}
            {lead.message ? `\n\n${lead.message}` : "No written brief."}
          </p>
        </section>

        <section className="border border-line bg-white p-4 rounded-[5px]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Reply</p>
          <div className="mt-3 flex flex-wrap gap-1">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setBody(t.body)}
                className="cursor-pointer rounded-[5px] border border-line px-2.5 py-1 text-xs hover:border-brand-300"
              >
                {t.label}
              </button>
            ))}
          </div>
          <textarea
            className={inputClass + " mt-3 min-h-32"}
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <div className="mt-3">
            <AdminBtn variant="primary" onClick={sendReply} disabled={busy}>
              {busy ? "Sending..." : "Send from the desk"}
            </AdminBtn>
          </div>
        </section>
      </div>

      <aside className="space-y-4">
        <section className="border border-line bg-white p-4 rounded-[5px] space-y-3">
          <Field label="Status">
            <select className={inputClass} value={status} onChange={(e) => setStatus(e.target.value)}>
              {LEAD_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Notes">
            <textarea className={inputClass + " min-h-28"} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </Field>
          <AdminBtn variant="ink" onClick={saveNotes}>
            Save
          </AdminBtn>
          {status === "won" ? (
            <a href={`/admin/invoices/new?lead=${lead.id}`} className="block text-sm font-medium text-brand-600">
              Raise invoice
            </a>
          ) : null}
          {msg ? <p className="text-xs text-body">{msg}</p> : null}
        </section>
        <section className="border border-line bg-white p-4 rounded-[5px]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Mail log</p>
          {logs.length === 0 ? (
            <p className="mt-3 text-xs text-muted">Nothing sent yet.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {logs.map((log) => (
                <li key={log.id} className="text-xs text-body">
                  <span className="font-medium text-ink-900">{log.template}</span>
                  <span className="mt-0.5 block text-muted">
                    {new Date(log.created_at).toLocaleString("en-KE")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </aside>
    </div>
  );
}
