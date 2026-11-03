"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, Mail, MessageSquare, Phone, Plus, RefreshCw, Inbox, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AdminBtn, Field, Panel, inputClass } from "@/components/admin/ui";
import { Spinner } from "@/components/admin/pending";
import { LeadStatus } from "@/components/admin/LeadStatus";
import { LeadAnswers, SourceInfo } from "@/components/admin/leads/LeadAnswers";
import { QuickContact } from "@/components/admin/leads/QuickContact";
import { logActivity, setLeadStatus, type ActivityKind } from "@/components/admin/leads/actions";
import { formName, leadAnswers, leadMessage, leadUtm } from "@/components/admin/leads/data";
import type { Lead } from "@/lib/cms";
import { cn } from "@/lib/utils";

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

const LOG_KINDS: { id: Extract<ActivityKind, "note" | "call" | "meeting">; label: string; placeholder: string }[] = [
  { id: "note", label: "Add note", placeholder: "What the team should know" },
  { id: "call", label: "Log call", placeholder: "What was agreed on the call" },
  { id: "meeting", label: "Log meeting", placeholder: "Who met and what comes next" },
];

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  note: MessageSquare,
  status: RefreshCw,
  email: Mail,
  mail: Mail,
  call: Phone,
  meeting: CalendarClock,
  received: Inbox,
};

export type TimelineItem = {
  id: string;
  kind: string;
  title: string;
  body: string;
  who: string | null;
  at: string;
  when: string;
};

export function LeadWorkspace({
  lead,
  timeline,
  staff,
  received,
  lastContacted,
}: {
  lead: Lead;
  timeline: TimelineItem[];
  staff: { id: string; name: string }[];
  received: string;
  lastContacted: string | null;
}) {
  const router = useRouter();
  const [body, setBody] = useState(TEMPLATES[0].body);
  const [replyMsg, setReplyMsg] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [logKind, setLogKind] = useState<(typeof LOG_KINDS)[number]["id"]>("note");
  const [entry, setEntry] = useState("");
  const [saving, setSaving] = useState(false);
  const [sideMsg, setSideMsg] = useState<string | null>(null);
  const [assignee, setAssignee] = useState(lead.assigned_to ?? "");
  const [assigning, setAssigning] = useState(false);
  const [marking, setMarking] = useState(false);

  async function touch() {
    const stamp = { last_contacted_at: new Date().toISOString() };
    if (lead.status === "new") return setLeadStatus(lead.id, lead.status, "contacted", stamp);
    const { error } = await createClient().from("leads").update(stamp).eq("id", lead.id);
    return !error;
  }

  async function sendReply() {
    setSending(true);
    setReplyMsg(null);
    try {
      const res = await fetch("/api/admin/leads/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: lead.id, body }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) return setReplyMsg(json.error || "Could not send.");
      setReplyMsg("Sent.");
      router.refresh();
    } catch {
      setReplyMsg("Could not send. Check your connection.");
    } finally {
      setSending(false);
    }
  }

  async function saveEntry() {
    const text = entry.trim();
    if (!text) return;
    setSaving(true);
    const ok = await logActivity(lead.id, logKind, text);
    if (ok && logKind !== "note") await touch();
    setSaving(false);
    if (!ok) return;
    setEntry("");
    router.refresh();
  }

  async function markContacted() {
    setSideMsg(null);
    setMarking(true);
    const ok = await touch();
    if (ok && lead.status !== "new") await logActivity(lead.id, "note", "Marked as contacted.");
    setMarking(false);
    setSideMsg(ok ? "Marked contacted." : "Could not save.");
    router.refresh();
  }

  async function assign(next: string) {
    const prev = assignee;
    setAssignee(next);
    setSideMsg(null);
    setAssigning(true);
    const { error } = await createClient()
      .from("leads")
      .update({ assigned_to: next || null })
      .eq("id", lead.id);
    if (error) {
      setAssigning(false);
      setAssignee(prev);
      return setSideMsg("Could not assign.");
    }
    const who = staff.find((s) => s.id === next)?.name;
    await logActivity(lead.id, "note", who ? `Assigned to ${who}.` : "Unassigned.");
    setAssigning(false);
    router.refresh();
  }

  const kind = LOG_KINDS.find((k) => k.id === logKind) ?? LOG_KINDS[0];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="min-w-0 space-y-4">
        <Panel title={formName(lead)}>
          <LeadAnswers answers={leadAnswers(lead)} message={leadMessage(lead)} />
        </Panel>

        <section id="reply" className="scroll-mt-6">
          <Panel title="Reply" meta={`To ${lead.email}`}>
            <div className="flex flex-wrap gap-1">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setBody(t.body)}
                  className={cn(
                    "cursor-pointer rounded-[5px] border px-2.5 py-1 text-xs",
                    body === t.body ? "border-brand-500 text-brand-700" : "border-line hover:border-brand-300",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <textarea
              aria-label="Reply"
              className={inputClass + " mt-3 min-h-32"}
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
            <div className="mt-3 flex items-center gap-3">
              <AdminBtn
                variant="primary"
                onClick={sendReply}
                disabled={!body.trim()}
                pending={sending}
                icon={<Send aria-hidden />}
              >
                {sending ? "Sending..." : "Send reply"}
              </AdminBtn>
              {replyMsg ? <p className="text-xs text-body">{replyMsg}</p> : null}
            </div>
          </Panel>
        </section>

        <Panel title="Activity">
          <div className="flex flex-wrap gap-1" role="group" aria-label="Entry type">
            {LOG_KINDS.map((k) => (
              <button
                key={k.id}
                type="button"
                aria-pressed={logKind === k.id}
                onClick={() => setLogKind(k.id)}
                className={cn(
                  "cursor-pointer rounded-[5px] px-2.5 py-1 text-xs font-medium",
                  logKind === k.id ? "bg-ink-900 text-white" : "border border-line text-body hover:border-brand-300",
                )}
              >
                {k.label}
              </button>
            ))}
          </div>
          <textarea
            aria-label={kind.label}
            className={inputClass + " mt-3 min-h-20"}
            placeholder={kind.placeholder}
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
          />
          <div className="mt-3">
            <AdminBtn variant="ink" onClick={saveEntry} disabled={!entry.trim()} pending={saving}>
              {saving ? "Saving..." : "Save"}
            </AdminBtn>
          </div>

          <ol className="mt-6 space-y-4 border-t border-line pt-5">
            {timeline.map((item) => {
              const Icon = ICONS[item.kind] ?? MessageSquare;
              return (
                <li key={item.id} className="flex gap-3">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-[5px] bg-surface-3 text-body">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink-900">{item.title}</p>
                    <p className="text-xs text-muted">
                      {item.when}
                      {item.who ? ` · ${item.who}` : ""}
                    </p>
                    {item.body ? (
                      <p className="mt-1 whitespace-pre-wrap break-words text-sm text-body">{item.body}</p>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>
        </Panel>
      </div>

      <aside className="space-y-4">
        <Panel title="Status" meta={lastContacted ? `Last contacted ${lastContacted}` : "Not contacted yet"}>
          <div className="space-y-3">
            <Field label="Status">
              <LeadStatus id={lead.id} value={lead.status} className="w-full" />
            </Field>
            <Field label="Assigned to">
              <span className="relative block" aria-busy={assigning || undefined}>
                <select
                  className={cn(inputClass, "disabled:opacity-70", assigning && "pr-14")}
                  value={assignee}
                  disabled={assigning}
                  onChange={(e) => assign(e.target.value)}
                >
                  <option value="">Nobody</option>
                  {staff.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                {assigning ? (
                  <Spinner className="pointer-events-none absolute right-8 top-1/2 -translate-y-1/2 text-brand-500" />
                ) : null}
              </span>
            </Field>
            <div className="flex flex-wrap gap-2 pt-1">
              <AdminBtn variant="ghost" onClick={markContacted} pending={marking}>
                {marking ? "Saving..." : "Mark contacted"}
              </AdminBtn>
              {lead.status === "qualified" || lead.status === "won" ? (
                <AdminBtn href={`/console/invoices/new?lead=${lead.id}`} icon={<Plus aria-hidden />}>
                  Raise invoice
                </AdminBtn>
              ) : null}
            </div>
            {sideMsg ? <p className="text-xs text-body">{sideMsg}</p> : null}
          </div>
        </Panel>

        <Panel title="Contact">
          <div className="space-y-3">
            <div className="text-sm">
              <a href={`mailto:${lead.email}`} className="block truncate text-ink-900 hover:text-brand-600">
                {lead.email}
              </a>
              {lead.phone ? <p className="mt-0.5 text-body">{lead.phone}</p> : null}
            </div>
            <QuickContact email={lead.email} phone={lead.phone} />
          </div>
        </Panel>

        <Panel title="Source">
          <SourceInfo pageUrl={lead.page_url} referrer={lead.referrer} utm={leadUtm(lead)} received={received} />
        </Panel>

        {lead.notes ? (
          <Panel title="Earlier notes">
            <p className="whitespace-pre-wrap text-sm text-body">{lead.notes}</p>
          </Panel>
        ) : null}
      </aside>
    </div>
  );
}
