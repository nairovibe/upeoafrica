"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ExternalLink, LogOut, SlidersHorizontal, Users } from "lucide-react";
import { Spinner } from "@/components/admin/pending";
import { startNavProgress } from "@/components/ui/NavProgress";
import { createClient } from "@/lib/supabase/client";
import { clearRemember } from "@/lib/supabase/remember";
import { cn } from "@/lib/utils";
import type { Profile } from "@/lib/cms";
import { popoverPanel, usePopover } from "@/components/admin/shell/usePopover";

const itemClass =
  "flex w-full cursor-pointer items-center gap-2.5 px-4 py-2 text-left text-[13px] text-ink-900 hover:bg-surface-2 focus-visible:bg-surface-2 focus-visible:outline-none";

function focusFirstItem(node: HTMLDivElement | null) {
  node?.querySelector<HTMLElement>("[role=menuitem]")?.focus();
}

export function AccountMenu({
  profile,
  open,
  onToggle,
  onClose,
}: {
  profile: Profile;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const { rootRef, triggerRef } = usePopover(open, onClose);
  const name = profile.full_name || profile.email;

  async function signOut() {
    setSigningOut(true);
    const supabase = createClient();
    clearRemember();
    await supabase.auth.signOut();
    startNavProgress();
    router.replace("/console/login");
    router.refresh();
  }

  function moveFocus(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const items = [...e.currentTarget.querySelectorAll<HTMLElement>("[role=menuitem]")];
    const at = items.indexOf(document.activeElement as HTMLElement);
    const next = e.key === "ArrowDown" ? (at + 1) % items.length : (at - 1 + items.length) % items.length;
    items[next]?.focus();
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={onToggle}
        aria-label="Account"
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-[5px] px-1.5 hover:bg-surface-3 focus-visible:outline-2 focus-visible:outline-brand-500 aria-expanded:bg-surface-3"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink-900 font-display text-[11px] font-semibold text-white">
          {name.slice(0, 1).toUpperCase()}
        </span>
        <ChevronDown className="hidden h-3.5 w-3.5 text-muted md:block" aria-hidden />
      </button>
      {open ? (
        <div
          role="menu"
          aria-label="Account"
          onKeyDown={moveFocus}
          ref={focusFirstItem}
          className={cn(popoverPanel, "w-60 overflow-hidden")}
        >
          <div className="border-b border-line px-4 py-3">
            <p className="truncate text-[13px] font-medium text-ink-900">{profile.full_name || "Operator"}</p>
            <p className="truncate text-[12px] capitalize text-muted">
              {profile.role} · <span className="normal-case">{profile.email}</span>
            </p>
          </div>
          <div className="py-1">
            <Link role="menuitem" href="/console/settings" onClick={onClose} className={itemClass}>
              <SlidersHorizontal className="h-3.5 w-3.5 text-muted" aria-hidden />
              Settings
            </Link>
            <Link role="menuitem" href="/console/team" onClick={onClose} className={itemClass}>
              <Users className="h-3.5 w-3.5 text-muted" aria-hidden />
              Team
            </Link>
            <Link role="menuitem" href="/" target="_blank" rel="noreferrer" onClick={onClose} className={itemClass}>
              <ExternalLink className="h-3.5 w-3.5 text-muted" aria-hidden />
              View site
            </Link>
          </div>
          <div className="border-t border-line py-1">
            <button
              role="menuitem"
              type="button"
              onClick={signOut}
              disabled={signingOut}
              aria-busy={signingOut || undefined}
              className={cn(itemClass, "disabled:cursor-wait disabled:opacity-70")}
            >
              {signingOut ? <Spinner className="text-muted" /> : <LogOut className="h-3.5 w-3.5 text-muted" aria-hidden />}
              {signingOut ? "Signing out..." : "Sign out"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
