"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Inbox,
  Briefcase,
  Newspaper,
  Package,
  Receipt,
  Handshake,
  Building2,
  ImageIcon,
  Users,
  SlidersHorizontal,
  PanelLeft,
  LogOut,
  ExternalLink,
  LayoutGrid,
  Clapperboard,
  FileText,
  CalendarDays,
  Search,
  Bell,
  ChevronDown,
} from "lucide-react";
import { Logo, LogoMark } from "@/components/brand/Logo";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { Profile } from "@/lib/cms";
import type { DeskBadges } from "@/lib/desk";

const GROUPS: {
  label: string;
  items: { href: string; label: string; icon: typeof Inbox; badge?: keyof DeskBadges }[];
}[] = [
  { label: "Today", items: [{ href: "/admin", label: "Desk", icon: LayoutGrid }] },
  { label: "Inbox", items: [{ href: "/admin/leads", label: "Leads", icon: Inbox, badge: "inbox" }] },
  {
    label: "Money",
    items: [
      { href: "/admin/orders", label: "Orders", icon: Receipt, badge: "money" },
      { href: "/admin/invoices", label: "Invoices", icon: FileText, badge: "invoices" },
    ],
  },
  {
    label: "Shop",
    items: [
      { href: "/admin/products", label: "Products", icon: Package },
      { href: "/admin/events", label: "Events", icon: CalendarDays },
    ],
  },
  {
    label: "Studio",
    items: [
      { href: "/admin/work", label: "Work", icon: Briefcase },
      { href: "/admin/insights", label: "Insights", icon: Newspaper },
      { href: "/admin/media", label: "Media", icon: ImageIcon },
      { href: "/admin/videos", label: "Videos", icon: Clapperboard },
    ],
  },
  {
    label: "House",
    items: [
      { href: "/admin/clients", label: "Clients", icon: Building2 },
      { href: "/admin/partners", label: "Partners", icon: Handshake },
      { href: "/admin/team", label: "Team", icon: Users },
      { href: "/admin/settings", label: "Settings", icon: SlidersHorizontal },
    ],
  },
];

const TITLES: Record<string, string> = {
  "/admin": "Today",
  "/admin/leads": "Inbox",
  "/admin/work": "Work",
  "/admin/insights": "Insights",
  "/admin/products": "Products",
  "/admin/orders": "Orders",
  "/admin/invoices": "Invoices",
  "/admin/events": "Events",
  "/admin/partners": "Partners",
  "/admin/clients": "Clients",
  "/admin/media": "Media",
  "/admin/videos": "Videos",
  "/admin/team": "Team",
  "/admin/settings": "Settings",
};

type SearchHit = { href: string; title: string; hint: string };

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
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [notices, setNotices] = useState<{ id: string; title: string; body: string; href: string | null; read_at: string | null; created_at: string }[]>([]);
  const unread = notices.filter((n) => !n.read_at).length || badges.notices;

  useEffect(() => {
    const stored = window.localStorage.getItem("upeo-admin-nav");
    if (stored === "1") setCollapsed(true);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdOpen(true);
      }
      if (e.key === "Escape") setCmdOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(12)
      .then(({ data }) => setNotices(data ?? []));
  }, [pathname]);

  function toggle() {
    setCollapsed((v) => {
      const next = !v;
      window.localStorage.setItem("upeo-admin-nav", next ? "1" : "0");
      return next;
    });
  }

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  async function markAllRead() {
    const supabase = createClient();
    await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .is("read_at", null);
    setNotices((rows) => rows.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() })));
    router.refresh();
  }

  const title =
    Object.entries(TITLES)
      .sort((a, b) => b[0].length - a[0].length)
      .find(([href]) => pathname === href || pathname.startsWith(`${href}/`))?.[1] ?? "Studio";

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
            <Link href="/admin" aria-label="Desk" className="inline-flex">
              <LogoMark size={28} />
            </Link>
          ) : (
            <Logo variant="light" href="/admin" />
          )}
        </div>
        <nav className="flex-1 overflow-y-auto py-3" aria-label="Studio">
          {GROUPS.map((group) => (
            <div key={group.label} className="mb-3">
              {!collapsed ? (
                <p className="px-4 pb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">
                  {group.label}
                </p>
              ) : null}
              {group.items.map((item) => {
                const Icon = item.icon;
                const active =
                  item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
                const count = item.badge ? badges[item.badge] : 0;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "mx-2 mb-0.5 flex items-center gap-3 rounded-[5px] px-2.5 py-2 text-[13px] font-medium transition-colors duration-150",
                      collapsed && "justify-center px-0",
                      active
                        ? "bg-brand-500 text-white"
                        : "text-white/65 hover:bg-white/10 hover:text-white",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden />
                    {!collapsed && <span className="flex-1">{item.label}</span>}
                    {!collapsed && count > 0 ? (
                      <span className="min-w-5 rounded-[5px] bg-white/15 px-1.5 text-center text-[10px] font-semibold">
                        {count}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="desk-chrome sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-line bg-white px-3 lg:px-6">
          <button
            type="button"
            onClick={toggle}
            aria-label={collapsed ? "Expand menu" : "Collapse menu"}
            className="hidden h-9 w-9 cursor-pointer items-center justify-center rounded-[5px] text-ink-900 hover:bg-surface-3 md:inline-flex"
          >
            <PanelLeft className="h-4 w-4" />
          </button>
          <p className="min-w-0 truncate font-display text-[15px] font-semibold text-ink-900">{title}</p>
          <button
            type="button"
            onClick={() => setCmdOpen(true)}
            className="ml-auto hidden h-9 max-w-xs flex-1 cursor-pointer items-center gap-2 rounded-[5px] border border-line px-3 text-left text-[13px] text-muted hover:border-brand-300 sm:inline-flex"
          >
            <Search className="h-3.5 w-3.5" aria-hidden />
            Jump to a lead, invoice, or page
            <kbd className="ml-auto text-[10px] tracking-wide text-muted">Ctrl K</kbd>
          </button>
          <button
            type="button"
            onClick={() => setCmdOpen(true)}
            aria-label="Search"
            className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-[5px] hover:bg-surface-3 sm:hidden"
          >
            <Search className="h-4 w-4" />
          </button>
          <Link
            href="/"
            target="_blank"
            className="hidden items-center gap-1.5 text-[13px] font-medium text-body hover:text-brand-600 lg:inline-flex"
          >
            View site
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
          <div className="relative">
            <button
              type="button"
              aria-label="Notifications"
              onClick={() => {
                setBellOpen((v) => !v);
                setMenuOpen(false);
              }}
              className="relative inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-[5px] hover:bg-surface-3"
            >
              <Bell className="h-4 w-4" />
              {unread > 0 ? (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-brand-500" />
              ) : null}
            </button>
            {bellOpen ? (
              <div className="absolute right-0 z-30 mt-2 w-80 border border-line bg-white p-2 shadow-lg">
                <div className="mb-2 flex items-center justify-between px-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Inbox</p>
                  <button type="button" onClick={markAllRead} className="cursor-pointer text-xs text-brand-600">
                    Mark all read
                  </button>
                </div>
                {notices.length === 0 ? (
                  <p className="px-2 py-6 text-center text-sm text-muted">Quiet for now.</p>
                ) : (
                  notices.map((n) => (
                    <Link
                      key={n.id}
                      href={n.href || "/admin"}
                      onClick={() => setBellOpen(false)}
                      className={cn("block rounded-[5px] px-2 py-2 hover:bg-surface-2", !n.read_at && "bg-brand-50")}
                    >
                      <p className="text-sm font-medium text-ink-900">{n.title}</p>
                      {n.body ? <p className="mt-0.5 line-clamp-2 text-xs text-muted">{n.body}</p> : null}
                    </Link>
                  ))
                )}
              </div>
            ) : null}
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setMenuOpen((v) => !v);
                setBellOpen(false);
              }}
              className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-[5px] px-2 hover:bg-surface-3"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-[5px] bg-ink-900 text-[11px] font-semibold text-white">
                {(profile.full_name || profile.email).slice(0, 1).toUpperCase()}
              </span>
              <span className="hidden text-left text-[12px] leading-tight md:block">
                <span className="block font-medium text-ink-900">{profile.full_name || "Operator"}</span>
                <span className="block capitalize text-muted">{profile.role}</span>
              </span>
              <ChevronDown className="hidden h-3.5 w-3.5 text-muted md:block" />
            </button>
            {menuOpen ? (
              <div className="absolute right-0 z-30 mt-2 w-48 border border-line bg-white py-1 shadow-lg">
                <Link href="/admin/settings" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm hover:bg-surface-2">
                  Settings
                </Link>
                <Link href="/admin/team" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm hover:bg-surface-2">
                  Team
                </Link>
                <button
                  type="button"
                  onClick={signOut}
                  className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm hover:bg-surface-2"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign out
                </button>
              </div>
            ) : null}
          </div>
        </header>
        <nav className="flex gap-1 overflow-x-auto border-b border-line bg-white px-3 py-2 md:hidden" aria-label="Studio mobile">
          {[
            { href: "/admin", label: "Today" },
            { href: "/admin/leads", label: "Inbox" },
            { href: "/admin/invoices", label: "Invoices" },
            { href: "/admin/events", label: "Events" },
            { href: "/admin/work", label: "Work" },
            { href: "/admin/settings", label: "Settings" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "shrink-0 rounded-[5px] px-3 py-1.5 text-[12px] font-medium",
                (item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href))
                  ? "bg-brand-500 text-white"
                  : "text-body hover:bg-surface-2",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</div>
      </div>
      {cmdOpen ? <CommandPalette onClose={() => setCmdOpen(false)} /> : null}
    </div>
  );
}

function CommandPalette({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const pages = useMemo<SearchHit[]>(
    () => [
      { href: "/admin", title: "Today", hint: "Desk" },
      { href: "/admin/leads", title: "Leads", hint: "Inbox" },
      { href: "/admin/invoices", title: "Invoices", hint: "Money" },
      { href: "/admin/orders", title: "Orders", hint: "Money" },
      { href: "/admin/events", title: "Events", hint: "Shop" },
      { href: "/admin/products", title: "Products", hint: "Shop" },
      { href: "/admin/work", title: "Work", hint: "Studio" },
      { href: "/admin/settings", title: "Settings", hint: "House" },
    ],
    [],
  );

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const t = window.setTimeout(async () => {
      if (q.trim().length < 2) {
        setHits(pages.filter((p) => p.title.toLowerCase().includes(q.toLowerCase())));
        return;
      }
      const res = await fetch(`/api/admin/search?q=${encodeURIComponent(q)}`);
      const json = (await res.json()) as { hits?: SearchHit[] };
      setHits(json.hits ?? []);
    }, 160);
    return () => window.clearTimeout(t);
  }, [q, pages]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-ink-950/40 px-4 pt-[15vh]" onClick={onClose}>
      <div
        className="w-full max-w-lg border border-line bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search leads, invoices, work, events"
          className="w-full border-b border-line px-4 py-3 text-sm outline-none"
        />
        <ul className="max-h-80 overflow-y-auto py-1">
          {hits.map((hit) => (
            <li key={hit.href}>
              <button
                type="button"
                className="flex w-full cursor-pointer items-center justify-between px-4 py-2.5 text-left hover:bg-surface-2"
                onClick={() => {
                  router.push(hit.href);
                  onClose();
                }}
              >
                <span className="text-sm font-medium text-ink-900">{hit.title}</span>
                <span className="text-xs text-muted">{hit.hint}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
