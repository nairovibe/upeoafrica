"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Spinner } from "@/components/admin/pending";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { Notification } from "@/lib/cms";
import { headerIconBtn, popoverPanel, usePopover } from "@/components/admin/shell/usePopover";

type Notice = Pick<Notification, "id" | "title" | "body" | "href" | "read_at" | "created_at">;

const timeFormat = new Intl.DateTimeFormat("en-KE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export function Notifications({
  unreadHint,
  open,
  onToggle,
  onClose,
}: {
  unreadHint: number;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const router = useRouter();
  const { rootRef, triggerRef } = usePopover(open, onClose);
  const [notices, setNotices] = useState<Notice[] | null>(null);
  const [marking, setMarking] = useState(false);
  const unread = notices ? notices.filter((n) => !n.read_at).length : unreadHint;

  useEffect(() => {
    if (!open) return;
    let live = true;
    createClient()
      .from("notifications")
      .select("id, title, body, href, read_at, created_at")
      .order("created_at", { ascending: false })
      .limit(12)
      .then(({ data }) => {
        if (live) setNotices(data ?? []);
      });
    return () => {
      live = false;
    };
  }, [open]);

  async function markAllRead() {
    setMarking(true);
    const now = new Date().toISOString();
    const supabase = createClient();
    const { error } = await supabase.from("notifications").update({ read_at: now }).is("read_at", null);
    setMarking(false);
    if (error) return;
    setNotices((rows) => rows?.map((n) => ({ ...n, read_at: n.read_at || now })) ?? rows);
    router.refresh();
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={onToggle}
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={headerIconBtn}
      >
        <Bell className="h-4 w-4" />
        {unread > 0 ? <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-brand-500 ring-2 ring-white" /> : null}
      </button>
      {open ? (
        <div role="dialog" aria-label="Notifications" className={cn(popoverPanel, "overflow-hidden sm:w-[min(352px,calc(100vw-1.5rem))]")}>
          <div className="flex h-12 items-center justify-between border-b border-line px-4">
            <p className="font-display text-[14px] font-semibold text-ink-900">Notifications</p>
            {unread > 0 ? (
              <button
                type="button"
                onClick={markAllRead}
                disabled={marking}
                aria-busy={marking || undefined}
                className="inline-flex cursor-pointer items-center gap-1.5 text-[12px] font-medium text-brand-600 hover:text-brand-700 disabled:cursor-wait disabled:opacity-70"
              >
                {marking ? <Spinner /> : null}
                {marking ? "Marking..." : "Mark all read"}
              </button>
            ) : null}
          </div>
          {!notices || notices.length === 0 ? (
            <p className="px-4 py-10 text-center text-[13px] text-muted">
              {notices ? "You are all caught up." : "Loading"}
            </p>
          ) : (
            <ul className="max-h-[min(420px,60vh)] divide-y divide-line overflow-y-auto">
              {notices.map((n) => (
                <li key={n.id}>
                  <Link
                    href={n.href || "/console"}
                    onClick={onClose}
                    className="flex gap-3 px-4 py-3 hover:bg-surface-2 focus-visible:bg-surface-2 focus-visible:outline-none"
                  >
                    <span
                      className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", n.read_at ? "bg-transparent" : "bg-brand-500")}
                      aria-hidden
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13px] font-medium text-ink-900">{n.title}</span>
                      {n.body ? <span className="mt-0.5 line-clamp-2 block text-[12px] text-muted">{n.body}</span> : null}
                      <span className="mt-1 block text-[11px] tabular-nums text-muted">{timeFormat.format(new Date(n.created_at))}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
