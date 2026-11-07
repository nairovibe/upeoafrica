"use client";

import { useMemo, useState, useTransition } from "react";
import { Send } from "lucide-react";
import { AdminBtn, inputClass } from "@/components/admin/ui";
import { sendCampaign } from "@/app/console/(console)/newsletter/actions";

export type MailPiece = { id: string; title: string; detail: string };

export function ComposeForm({
  articles,
  events,
  subscribers,
  canSend,
}: {
  articles: MailPiece[];
  events: MailPiece[];
  subscribers: number;
  canSend: boolean;
}) {
  const [kind, setKind] = useState<"article" | "event" | "note">("article");
  const [refId, setRefId] = useState(articles[0]?.id ?? "");
  const [subject, setSubject] = useState("");
  const [intro, setIntro] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [notice, setNotice] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [pending, start] = useTransition();

  const choices = kind === "article" ? articles : kind === "event" ? events : [];
  const selected = useMemo(() => choices.find((item) => item.id === refId) ?? choices[0], [choices, refId]);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setNotice(null);
    start(async () => {
      const result = await sendCampaign({
        kind,
        refId: kind === "note" ? undefined : selected?.id,
        subject: subject || selected?.title || "",
        intro,
      });
      if (!result.ok) {
        setNotice({ tone: "error", text: result.error });
        return;
      }
      setConfirm(false);
      setNotice({
        tone: "ok",
        text: `Sent to ${result.sent}${result.failed ? `. ${result.failed} could not be delivered` : ""}.`,
      });
    });
  }

  if (!canSend) {
    return <p className="rounded-[5px] border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">Only an editor can send to the list. You can still export it.</p>;
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <fieldset className="space-y-2">
        <legend className="text-[13px] font-medium text-ink-900">What to send</legend>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["article", "Article"],
              ["event", "Event"],
              ["note", "A short note"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={kind === id}
              onClick={() => {
                setKind(id);
                setRefId(id === "article" ? (articles[0]?.id ?? "") : id === "event" ? (events[0]?.id ?? "") : "");
              }}
              className={`inline-flex h-10 cursor-pointer items-center rounded-[5px] border px-3 text-sm font-medium ${
                kind === id ? "border-brand-500 bg-brand-50 text-brand-700" : "border-line bg-white text-ink-900"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </fieldset>

      {kind !== "note" ? (
        choices.length ? (
          <label className="block text-[13px] font-medium text-ink-900">
            {kind === "article" ? "Article" : "Event"}
            <select
              className={`${inputClass} mt-1.5`}
              value={selected?.id ?? ""}
              onChange={(event) => setRefId(event.target.value)}
            >
              {choices.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
            {selected?.detail ? <span className="mt-1 block text-xs font-normal text-muted">{selected.detail}</span> : null}
          </label>
        ) : (
          <p className="text-sm text-body">
            {kind === "article" ? "No live article to send yet." : "No live event to send yet."}
          </p>
        )
      ) : null}

      <label className="block text-[13px] font-medium text-ink-900">
        Subject
        <input
          className={`${inputClass} mt-1.5`}
          value={subject}
          maxLength={140}
          placeholder={selected?.title || "Subject line"}
          onChange={(event) => setSubject(event.target.value)}
        />
      </label>
      <label className="block text-[13px] font-medium text-ink-900">
        Note above the link
        <textarea
          className={`${inputClass} mt-1.5`}
          rows={5}
          maxLength={800}
          required={kind === "note"}
          value={intro}
          placeholder="A short note for the list. The article or event link sits under it."
          onChange={(event) => setIntro(event.target.value)}
        />
      </label>

      <label className="flex items-start gap-2 text-sm text-ink-900">
        <input
          type="checkbox"
          className="mt-1"
          checked={confirm}
          onChange={(event) => setConfirm(event.target.checked)}
        />
        <span>Send now to {subscribers} subscribed {subscribers === 1 ? "address" : "addresses"}. Each message includes an unsubscribe link.</span>
      </label>

      {notice ? (
        <p className={`rounded-[5px] border px-3 py-2 text-sm ${notice.tone === "ok" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-700"}`}>
          {notice.text}
        </p>
      ) : null}

      <AdminBtn type="submit" pending={pending} disabled={!confirm || subscribers === 0 || (kind !== "note" && !selected)} icon={<Send />}>
        {pending ? "Sending..." : "Send"}
      </AdminBtn>
    </form>
  );
}
