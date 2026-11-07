"use client";

import { useState, useTransition } from "react";
import { Download, Plus, Send, Trash2 } from "lucide-react";
import { AdminBtn, AdminTable, Pill, inputClass } from "@/components/admin/ui";
import { fullDate } from "@/components/admin/leads/data";
import { addSubscriber, deleteSubscribers, setSubscriberStatus } from "@/app/console/(console)/newsletter/actions";

export type SubscriberRow = {
  id: string;
  email: string;
  status: string;
  source: string;
  created_at: string;
  unsubscribed_at: string | null;
};

const SOURCE: Record<string, string> = { footer: "Footer", console: "Console" };

export function MailingList({
  rows,
  empty,
  exportHref,
}: {
  rows: SubscriberRow[];
  empty: string;
  exportHref: string;
}) {
  const [picked, setPicked] = useState<string[]>([]);
  const [email, setEmail] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const all = rows.length > 0 && picked.length === rows.length;

  function run(task: () => Promise<{ ok: boolean; error?: string }>, done?: () => void) {
    setNotice(null);
    start(async () => {
      const result = await task();
      if (!result.ok) {
        setNotice(result.error ?? "Could not update the list.");
        return;
      }
      done?.();
    });
  }

  function toggle(id: string) {
    setPicked((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  return (
    <div className="space-y-4">
      <form
        className="flex flex-col gap-2 sm:flex-row sm:items-center"
        onSubmit={(event) => {
          event.preventDefault();
          const value = email;
          run(
            () => addSubscriber(value),
            () => setEmail(""),
          );
        }}
      >
        <label htmlFor="mailing-email" className="sr-only">
          Email address
        </label>
        <input
          id="mailing-email"
          type="email"
          required
          maxLength={320}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Add an email address"
          className={`${inputClass} sm:max-w-sm`}
        />
        <AdminBtn type="submit" pending={pending} icon={<Plus />}>
          Add
        </AdminBtn>
        <AdminBtn href="/console/newsletter/compose" icon={<Send />}>
          Send
        </AdminBtn>
        <AdminBtn href={exportHref} variant="ghost" icon={<Download />}>
          Export CSV
        </AdminBtn>
      </form>

      {notice ? (
        <p className="text-sm text-red-700" role="alert">
          {notice}
        </p>
      ) : null}

      {picked.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-body">{picked.length} selected</span>
          <AdminBtn
            variant="ghost"
            pending={pending}
            onClick={() => run(() => setSubscriberStatus(picked, "subscribed"), () => setPicked([]))}
          >
            Subscribe
          </AdminBtn>
          <AdminBtn
            variant="ghost"
            pending={pending}
            onClick={() => run(() => setSubscriberStatus(picked, "unsubscribed"), () => setPicked([]))}
          >
            Unsubscribe
          </AdminBtn>
          <AdminBtn
            variant="danger"
            pending={pending}
            icon={<Trash2 />}
            onClick={() => {
              if (!window.confirm(`Remove ${picked.length} ${picked.length === 1 ? "address" : "addresses"} from the mailing list?`)) return;
              run(() => deleteSubscribers(picked), () => setPicked([]));
            }}
          >
            Remove
          </AdminBtn>
        </div>
      ) : null}

      <AdminTable
        minWidth={720}
        empty={empty}
        headers={[
          <input
            key="all"
            type="checkbox"
            className="accent-brand-500"
            aria-label="Select all"
            checked={all}
            onChange={() => setPicked(all ? [] : rows.map((row) => row.id))}
          />,
          "Email",
          "Status",
          "Source",
          "Joined",
          "",
        ]}
        rows={rows.map((row) => {
          const live = row.status === "subscribed";
          return [
            <input
              key="pick"
              type="checkbox"
              className="accent-brand-500"
              aria-label={`Select ${row.email}`}
              checked={picked.includes(row.id)}
              onChange={() => toggle(row.id)}
            />,
            <span key="email" className="font-medium">
              {row.email}
            </span>,
            <Pill key="status" tone={live ? "success" : "neutral"}>
              {live ? "Subscribed" : "Unsubscribed"}
            </Pill>,
            SOURCE[row.source] ?? row.source,
            <span key="date" className="whitespace-nowrap text-body">
              {fullDate(row.created_at)}
            </span>,
            <span key="actions" className="flex justify-end gap-2">
              <button
                type="button"
                className="cursor-pointer text-[13px] font-medium text-ink-900 underline-offset-2 hover:underline"
                onClick={() => run(() => setSubscriberStatus([row.id], live ? "unsubscribed" : "subscribed"))}
              >
                {live ? "Unsubscribe" : "Resubscribe"}
              </button>
              <button
                type="button"
                className="cursor-pointer text-[13px] font-medium text-red-700 underline-offset-2 hover:underline"
                onClick={() => {
                  if (!window.confirm(`Remove ${row.email} from the mailing list?`)) return;
                  run(() => deleteSubscribers([row.id]), () => setPicked((current) => current.filter((id) => id !== row.id)));
                }}
              >
                Remove
              </button>
            </span>,
          ];
        })}
      />
    </div>
  );
}
