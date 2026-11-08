"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { Menu, PanelLeft, Search, X } from "lucide-react";
import { Logo, LogoMark } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";
import type { Profile } from "@/lib/cms";
import type { DeskBadges } from "@/lib/desk";
import { LinkPending } from "@/components/admin/pending";
import { Shortcuts } from "@/components/admin/Shortcuts";
import { AccountMenu } from "@/components/admin/shell/AccountMenu";
import { CommandPalette } from "@/components/admin/shell/CommandPalette";
import { Notifications } from "@/components/admin/shell/Notifications";
import { NAV_GROUPS, isActive, pageTitle } from "@/components/admin/shell/nav";
import type { PopoverId } from "@/components/admin/shell/usePopover";

const NAV_KEY = "upeo-admin-nav";
const NAV_EVENT = "upeo-admin-nav";

function subscribeNav(onChange: () => void) {
  window.addEventListener(NAV_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(NAV_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function readNav() {
  return window.localStorage.getItem(NAV_KEY) === "1";
}

export function AdminShell({
  profile,
  badges,
  children,
}: {
  profile: Profile;
  badges: DeskBadges;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const collapsed = useSyncExternalStore(subscribeNav, readNav, () => false);
  const [popover, setPopover] = useState<PopoverId | null>(null);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const closePopover = useCallback(() => setPopover(null), []);
  const togglePopover = (id: PopoverId) => setPopover((v) => (v === id ? null : id));

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPopover(null);
        setMobileNav(false);
        setCmdOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    setMobileNav(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileNav) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileNav(false);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileNav]);

  function toggleNav() {
    window.localStorage.setItem(NAV_KEY, collapsed ? "0" : "1");
    window.dispatchEvent(new Event(NAV_EVENT));
  }

  function openPalette() {
    setPopover(null);
    setCmdOpen(true);
  }

  return (
    <div className="flex min-h-screen bg-surface-2 text-ink-900">
      <aside
        className={cn(
          "desk-chrome sticky top-0 hidden h-screen shrink-0 flex-col bg-ink-950 text-white transition-[width] duration-200 md:flex",
          collapsed ? "w-16" : "w-[232px]",
        )}
      >
        <div className={cn("flex h-14 items-center border-b border-white/10", collapsed ? "justify-center px-2" : "px-4")}>
          {collapsed ? (
            <Link href="/console" aria-label="Overview" className="inline-flex">
              <LogoMark size={28} />
            </Link>
          ) : (
            <Logo variant="light" href="/console" />
          )}
        </div>
        <ConsoleNav pathname={pathname} badges={badges} collapsed={collapsed} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="desk-chrome sticky top-0 z-20 flex h-14 items-center gap-1.5 border-b border-line bg-white px-3 lg:px-6">
          <button
            type="button"
            onClick={() => setMobileNav(true)}
            aria-label="Open menu"
            className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-[5px] text-ink-900 hover:bg-surface-3 md:hidden"
          >
            <Menu className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={toggleNav}
            aria-label={collapsed ? "Expand menu" : "Collapse menu"}
            className="hidden h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-[5px] text-ink-900 hover:bg-surface-3 md:inline-flex"
          >
            <PanelLeft className="h-4 w-4" />
          </button>
          <p className="min-w-0 truncate pl-1 font-display text-[15px] font-semibold text-ink-900">{pageTitle(pathname)}</p>
          <button
            type="button"
            onClick={openPalette}
            className="ml-auto hidden h-9 w-full max-w-xs cursor-pointer items-center gap-2 rounded-[5px] border border-line px-3 text-left text-[13px] text-muted transition-colors hover:border-brand-300 sm:inline-flex"
          >
            <Search className="h-3.5 w-3.5" aria-hidden />
            Search
            <kbd className="ml-auto rounded-[4px] border border-line px-1.5 py-0.5 text-[10px] text-muted">Ctrl K</kbd>
          </button>
          <button
            type="button"
            onClick={openPalette}
            aria-label="Search"
            className="ml-auto inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-[5px] hover:bg-surface-3 sm:hidden"
          >
            <Search className="h-4 w-4" />
          </button>
          <Shortcuts
            profile={profile}
            open={popover === "shortcuts"}
            onToggle={() => togglePopover("shortcuts")}
            onClose={closePopover}
          />
          <Notifications
            unreadHint={badges.notices}
            open={popover === "notices"}
            onToggle={() => togglePopover("notices")}
            onClose={closePopover}
          />
          <AccountMenu
            profile={profile}
            open={popover === "account"}
            onToggle={() => togglePopover("account")}
            onClose={closePopover}
          />
        </header>
        <div className="min-w-0 flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</div>
      </div>
      {mobileNav ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <button type="button" aria-label="Close menu" className="absolute inset-0 bg-ink-950/50" onClick={() => setMobileNav(false)} />
          <aside className="relative flex h-full w-[min(18.5rem,calc(100vw-3rem))] flex-col bg-ink-950 text-white">
            <div className="flex h-14 items-center justify-between border-b border-white/10 px-4">
              <Logo variant="light" href="/console" onClick={() => setMobileNav(false)} />
              <button
                type="button"
                onClick={() => setMobileNav(false)}
                aria-label="Close menu"
                className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-[5px] text-white hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <ConsoleNav pathname={pathname} badges={badges} collapsed={false} onNavigate={() => setMobileNav(false)} />
          </aside>
        </div>
      ) : null}
      {cmdOpen ? <CommandPalette onClose={() => setCmdOpen(false)} /> : null}
    </div>
  );
}

function ConsoleNav({
  pathname,
  badges,
  collapsed,
  onNavigate,
}: {
  pathname: string;
  badges: DeskBadges;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex-1 overflow-y-auto py-3" aria-label="Console">
      {NAV_GROUPS.map((group) => (
        <div key={group.label} className="mb-3">
          {collapsed ? null : (
            <p className="px-4 pb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">{group.label}</p>
          )}
          {group.items.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            const count = item.badge ? badges[item.badge] : 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                aria-current={active ? "page" : undefined}
                onClick={onNavigate}
                className={cn(
                  "relative mx-2 mb-0.5 flex items-center gap-3 rounded-[5px] px-2.5 py-2 text-[13px] font-medium transition-colors duration-150",
                  collapsed && "justify-center px-0",
                  onNavigate && "min-h-11",
                  active ? "bg-brand-500 text-white" : "text-white/65 hover:bg-white/10 hover:text-white",
                )}
              >
                <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                  <LinkPending icon={<Icon className="h-4 w-4" aria-hidden />} />
                </span>
                {collapsed ? (
                  count > 0 ? <span className="absolute right-2.5 top-1.5 h-1.5 w-1.5 rounded-full bg-brand-400" aria-hidden /> : null
                ) : (
                  <>
                    <span className="flex-1">{item.label}</span>
                    {count > 0 ? (
                      <span className="min-w-5 rounded-[5px] bg-white/15 px-1.5 text-center font-display text-[10px] font-semibold tabular-nums">
                        {count}
                      </span>
                    ) : null}
                  </>
                )}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
