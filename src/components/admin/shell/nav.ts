import {
  Inbox,
  Mail,
  Briefcase,
  Newspaper,
  Package,
  PackagePlus,
  Receipt,
  Handshake,
  Building2,
  ImageIcon,
  ImageUp,
  Users,
  UserRound,
  SlidersHorizontal,
  LayoutGrid,
  Clapperboard,
  FileText,
  FilePlus,
  CalendarDays,
  Ticket,
  PenLine,
  Globe,
  type LucideIcon,
} from "lucide-react";
import type { DeskBadges } from "@/lib/desk";

export type NavItem = { href: string; label: string; icon: LucideIcon; badge?: keyof DeskBadges };

export const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  { label: "Today", items: [{ href: "/console", label: "Overview", icon: LayoutGrid }] },
  {
    label: "Inbox",
    items: [
      { href: "/console/leads", label: "Enquiries", icon: Inbox, badge: "inbox" },
      { href: "/console/newsletter", label: "Mailing list", icon: Mail },
    ],
  },
  {
    label: "Money",
    items: [
      { href: "/console/orders", label: "Orders", icon: Receipt, badge: "money" },
      { href: "/console/invoices", label: "Invoices", icon: FileText, badge: "invoices" },
    ],
  },
  {
    label: "Shop",
    items: [
      { href: "/console/products", label: "Products", icon: Package },
      { href: "/console/events", label: "Events", icon: CalendarDays },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/console/work", label: "Work", icon: Briefcase },
      { href: "/console/insights", label: "Blog", icon: Newspaper },
      { href: "/console/media", label: "Media", icon: ImageIcon },
      { href: "/console/videos", label: "Videos", icon: Clapperboard },
    ],
  },
  {
    label: "House",
    items: [
      { href: "/console/clients", label: "Clients", icon: Building2 },
      { href: "/console/partners", label: "Partners", icon: Handshake },
      { href: "/console/team", label: "Team", icon: Users },
      { href: "/console/experts", label: "Experts", icon: UserRound },
      { href: "/console/settings", label: "Settings", icon: SlidersHorizontal },
    ],
  },
];

export const NAV_ITEMS = NAV_GROUPS.flatMap((group) => group.items.map((item) => ({ ...item, group: group.label })));

export const MOBILE_NAV = ["/console", "/console/leads", "/console/orders", "/console/invoices", "/console/events", "/console/insights"]
  .map((href) => NAV_ITEMS.find((item) => item.href === href))
  .filter((item): item is (typeof NAV_ITEMS)[number] => Boolean(item));

export function isActive(pathname: string, href: string) {
  return href === "/console" ? pathname === "/console" : pathname === href || pathname.startsWith(`${href}/`);
}

export function pageTitle(pathname: string) {
  const match = [...NAV_ITEMS]
    .sort((a, b) => b.href.length - a.href.length)
    .find((item) => isActive(pathname, item.href));
  return match?.label ?? "Console";
}

export type Shortcut = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  icon: LucideIcon;
  external?: boolean;
  create?: boolean;
};

export const SHORTCUTS: Shortcut[] = [
  { id: "new-invoice", title: "Invoice", subtitle: "Bill a client", href: "/console/invoices/new", icon: FilePlus, create: true },
  { id: "new-event", title: "Event", subtitle: "Tickets and RSVPs", href: "/console/events/new", icon: Ticket, create: true },
  { id: "new-post", title: "Blog post", subtitle: "Write and publish", href: "/console/insights/new", icon: PenLine, create: true },
  { id: "enquiries", title: "Enquiries", subtitle: "Reply to briefs", href: "/console/leads", icon: Inbox },
  { id: "mailing-list", title: "Mailing list", subtitle: "Newsletter opt-ins", href: "/console/newsletter", icon: Mail },
  { id: "orders", title: "Orders", subtitle: "Payments in", href: "/console/orders", icon: Receipt },
  { id: "media", title: "Media", subtitle: "Upload files", href: "/console/media", icon: ImageUp },
  { id: "new-product", title: "Product", subtitle: "Sell a download", href: "/console/products/new", icon: PackagePlus, create: true },
  { id: "new-work", title: "Case study", subtitle: "Show the work", href: "/console/work/new", icon: Briefcase, create: true },
  { id: "clients", title: "Clients", subtitle: "Accounts", href: "/console/clients", icon: Building2 },
  { id: "team", title: "Team", subtitle: "Roles", href: "/console/team", icon: Users },
  { id: "experts", title: "Experts", subtitle: "Public team", href: "/console/experts", icon: UserRound },
  { id: "settings", title: "Settings", subtitle: "Company and billing", href: "/console/settings", icon: SlidersHorizontal },
  { id: "site", title: "Website", subtitle: "Open the live site", href: "/", icon: Globe, external: true },
];

export const DEFAULT_SHORTCUTS = ["new-invoice", "new-event", "new-post", "enquiries", "orders", "media"];

export const MAX_SHORTCUTS = 8;

function pick(ids: string[]) {
  return ids.map((id) => SHORTCUTS.find((s) => s.id === id)).filter((s): s is Shortcut => Boolean(s));
}

export function resolveShortcuts(ids: string[] | null | undefined) {
  const chosen = pick(ids ?? []).slice(0, MAX_SHORTCUTS);
  return chosen.length ? chosen : pick(DEFAULT_SHORTCUTS);
}
