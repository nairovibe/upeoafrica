"use client";

import { useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X, ChevronDown, ArrowRight, MapPin, Phone, Mail } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaXTwitter } from "react-icons/fa6";
import { Logo } from "@/components/brand/Logo";
import { Container } from "@/components/ui/Container";
import { OPEN_INQUIRY_EVENT } from "@/components/site/InquiryModal";
import { services, company, nav, productMenu, processMenu } from "@/lib/content";
import { cn } from "@/lib/utils";

type MenuId = "services" | "products" | "process";

type MenuLink = { href: string; title: string; description: string; icon: LucideIcon };

const serviceLinks: MenuLink[] = services.map((service) => ({
  href: `/services/${service.slug}`,
  title: service.title,
  description: service.short,
  icon: service.icon,
}));

const menus: Record<MenuId, { links: MenuLink[]; wide?: boolean }> = {
  services: { links: serviceLinks, wide: true },
  products: { links: productMenu },
  process: { links: processMenu },
};

const openInquiry = () => window.dispatchEvent(new Event(OPEN_INQUIRY_EVENT));
const tel = company.phone.replace(/\s/g, "");

function pathOf(href: string) {
  return href.split("?")[0];
}

function isCurrent(href: string, pathname: string) {
  const path = pathOf(href);
  if (path === "/") return pathname === "/";
  return pathname === path || pathname.startsWith(`${path}/`);
}

function itemActive(item: (typeof nav)[number], pathname: string) {
  if (item.menu && menus[item.menu]) {
    return menus[item.menu].links.some((link) => isCurrent(link.href, pathname)) || isCurrent(item.href, pathname);
  }
  return isCurrent(item.href, pathname);
}

const navLinkClass = (active: boolean) =>
  cn(
    "inline-flex items-center gap-1 px-1.5 py-2 text-[13px] leading-5 font-medium transition-colors duration-300 xl:gap-1.5 xl:px-2.5 xl:text-[14.5px]",
    active ? "text-brand-500" : "text-ink-700 hover:text-brand-500",
  );

function NavLabel({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <span className="relative">
      {children}
      <span
        className={cn(
          "absolute -bottom-2 left-0 right-0 h-0.5 bg-brand-500",
          active ? "opacity-100" : "opacity-0",
        )}
        aria-hidden
      />
    </span>
  );
}

function SocialIcon({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="inline-flex h-12 w-7 items-center justify-center transition-opacity duration-300 hover:opacity-70"
    >
      {children}
    </a>
  );
}

function MenuPanel({ links, wide, labelledBy }: { links: MenuLink[]; wide?: boolean; labelledBy: string }) {
  return (
    <div className="absolute left-0 top-full z-50 pt-2">
      <div
        role="region"
        aria-labelledby={labelledBy}
        className={cn(
          "rounded-[5px] border border-line bg-white p-2 shadow-[0_24px_50px_-28px_rgba(11,14,20,0.45)]",
          wide ? "w-[min(40rem,calc(100vw-3rem))]" : "w-[min(22rem,calc(100vw-3rem))]",
        )}
      >
        <ul className={cn("grid gap-1", wide && "sm:grid-cols-2")}>
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="flex min-h-11 items-start gap-3 rounded-[5px] px-3 py-3 transition-colors duration-300 hover:bg-surface-3 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
              >
                <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center bg-brand-50 text-brand-600">
                  <link.icon className="h-4 w-4" aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-ink-900">{link.title}</span>
                  <span className="mt-0.5 block text-xs leading-5 text-muted">{link.description}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function Navbar({
  linkedin,
  xUrl,
}: {
  linkedin?: string | null;
  xUrl?: string | null;
  github?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState<MenuId | null>(null);
  const [mobileMenu, setMobileMenu] = useState<MenuId | null>(null);
  const pinned = useRef<MenuId | null>(null);
  const [compact, setCompact] = useState(false);
  const pathname = usePathname();
  const menuBaseId = useId();

  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
    setMenu(null);
    setMobileMenu(null);
    pinned.current = null;
  }

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!menu) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        pinned.current = null;
        setMenu(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menu]);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setCompact(window.scrollY > 24));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-white font-display">
      <div
        className={cn(
          "hidden transition-[grid-template-rows] duration-300 ease-out-expo motion-reduce:transition-none md:grid",
          compact ? "grid-rows-[0fr]" : "grid-rows-[1fr]",
        )}
      >
        <div className={cn("overflow-hidden", compact && "pointer-events-none")} aria-hidden={compact || undefined}>
          <div className="border-b border-black/10 bg-brand-500">
            <Container className="flex h-12 items-center justify-between gap-6 text-[12px] leading-4 font-medium text-ink-950">
              <span className="inline-flex min-w-0 items-center gap-2">
                <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
                <span className="truncate">{company.addressLine}</span>
              </span>
              <span className="flex shrink-0 items-center gap-4">
                <a
                  href={`tel:${tel}`}
                  className="inline-flex h-12 items-center gap-1.5 transition-opacity duration-300 hover:opacity-70"
                >
                  <Phone className="h-3.5 w-3.5" aria-hidden />
                  {company.phone}
                </a>
                <a
                  href={`mailto:${company.email}`}
                  className="hidden h-12 items-center gap-1.5 transition-opacity duration-300 hover:opacity-70 xl:inline-flex"
                >
                  <Mail className="h-3.5 w-3.5" aria-hidden />
                  {company.email}
                </a>
                <span className="inline-flex items-center gap-0.5">
                  <SocialIcon href={company.social.facebook} label="Facebook">
                    <FaFacebookF className="h-3.5 w-3.5" aria-hidden />
                  </SocialIcon>
                  <SocialIcon href={xUrl || company.social.x} label="X">
                    <FaXTwitter className="h-3.5 w-3.5" aria-hidden />
                  </SocialIcon>
                  <SocialIcon href={linkedin || company.social.linkedin} label="LinkedIn">
                    <FaLinkedinIn className="h-3.5 w-3.5" aria-hidden />
                  </SocialIcon>
                  <SocialIcon href={company.social.instagram} label="Instagram">
                    <FaInstagram className="h-3.5 w-3.5" aria-hidden />
                  </SocialIcon>
                </span>
              </span>
            </Container>
          </div>
        </div>
      </div>

      <Container className="relative flex h-[72px] items-center gap-4">
        <Logo priority className="relative z-10 shrink-0" />

        <nav className="hidden flex-1 items-center justify-center xl:flex" aria-label="Primary">
          {nav.map((item) => {
            const active = itemActive(item, pathname);
            if (item.menu) {
              const panelId = `${menuBaseId}-${item.menu}`;
              const labelId = `${panelId}-label`;
              const shown = menu === item.menu;
              return (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => {
                    if (!pinned.current) setMenu(item.menu!);
                  }}
                  onMouseLeave={() => {
                    if (pinned.current !== item.menu) {
                      setMenu((current) => (current === item.menu ? null : current));
                    }
                  }}
                  onBlur={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget)) {
                      if (pinned.current === item.menu) pinned.current = null;
                      setMenu((current) => (current === item.menu ? null : current));
                    }
                  }}
                >
                  <Link
                    id={labelId}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={navLinkClass(active)}
                  >
                    <NavLabel active={active}>{item.label}</NavLabel>
                  </Link>
                  <button
                    type="button"
                    aria-expanded={shown}
                    aria-controls={panelId}
                    aria-label={`${shown ? "Close" : "Open"} ${item.label} menu`}
                    onClick={() => {
                      if (pinned.current === item.menu) {
                        pinned.current = null;
                        setMenu(null);
                        return;
                      }
                      pinned.current = item.menu!;
                      setMenu(item.menu!);
                    }}
                    className="inline-flex h-11 w-7 cursor-pointer items-center justify-center text-ink-700 hover:text-brand-500"
                  >
                    <ChevronDown
                      className={cn("h-3.5 w-3.5 transition-transform duration-300", shown && "rotate-180")}
                      aria-hidden
                    />
                  </button>
                  {shown && (
                    <div id={panelId}>
                      <MenuPanel links={menus[item.menu].links} wide={menus[item.menu].wide} labelledBy={labelId} />
                    </div>
                  )}
                </div>
              );
            }
            return (
              <Link
                key={item.label}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={navLinkClass(active)}
              >
                <NavLabel active={active}>{item.label}</NavLabel>
              </Link>
            );
          })}
        </nav>

        <div className="relative z-10 ml-auto hidden items-center xl:flex">
          <button
            type="button"
            onClick={openInquiry}
            className="group inline-flex h-11 cursor-pointer items-center justify-center gap-2 bg-brand-500 px-5 text-[14px] leading-5 font-semibold text-white transition-colors duration-300 hover:bg-brand-600"
          >
            Start a project
            <ArrowRight
              className="h-4 w-4 transition-transform duration-300 ease-out-expo group-hover:translate-x-0.5"
              aria-hidden
            />
          </button>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="relative z-10 ml-auto inline-flex h-11 w-11 cursor-pointer items-center justify-center text-ink-900 transition-colors duration-300 ease-out-expo hover:bg-surface-3 xl:ml-0 xl:hidden"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </Container>

      <div
        inert={!open}
        className={cn(
          "overflow-y-auto transition-[max-height] duration-300 ease-out xl:hidden",
          open ? "max-h-[80vh] border-t border-line bg-white" : "max-h-0 border-t-0 border-transparent bg-transparent",
        )}
      >
        <Container className="flex flex-col py-2">
          {nav.map((item) => {
            if (item.menu) {
              const expanded = mobileMenu === item.menu;
              return (
                <div key={item.label} className="border-b border-line">
                  <div className="flex items-center justify-between">
                    <Link
                      href={item.href}
                      className="flex-1 py-3.5 text-base font-semibold text-ink-900 transition-colors duration-300 hover:text-brand-600"
                    >
                      {item.label}
                    </Link>
                    <button
                      type="button"
                      onClick={() => setMobileMenu((current) => (current === item.menu ? null : item.menu!))}
                      aria-label={`${expanded ? "Collapse" : "Expand"} ${item.label}`}
                      aria-expanded={expanded}
                      className="inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center text-ink-900"
                    >
                      <ChevronDown className={cn("h-5 w-5 transition-transform duration-300", expanded && "rotate-180")} />
                    </button>
                  </div>
                  <div
                    inert={!expanded}
                    className={cn("overflow-hidden transition-[max-height] duration-300", expanded ? "max-h-[920px]" : "max-h-0")}
                  >
                    <ul className="flex flex-col gap-1 pb-4">
                      {menus[item.menu].links.map((link) => (
                        <li key={link.href}>
                          <Link
                            href={link.href}
                            className="flex items-start gap-3 rounded-[5px] px-2 py-2.5 hover:bg-surface-3"
                          >
                            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center bg-brand-50 text-brand-600">
                              <link.icon className="h-4 w-4" aria-hidden />
                            </span>
                            <span>
                              <span className="block text-sm font-semibold text-ink-900">{link.title}</span>
                              <span className="mt-0.5 block text-xs leading-5 text-muted">{link.description}</span>
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                className="border-b border-line py-3.5 text-base font-semibold text-ink-900 transition-colors duration-300 ease-out-expo hover:text-brand-600"
              >
                {item.label}
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              openInquiry();
            }}
            className="group mt-4 inline-flex w-full cursor-pointer items-center justify-center gap-2 bg-brand-500 px-5 py-3 text-sm font-medium text-white transition-colors duration-300 ease-out-expo hover:bg-brand-600"
          >
            Start a project
            <ArrowRight
              className="h-4 w-4 transition-transform duration-300 ease-out-expo group-hover:translate-x-0.5"
              aria-hidden
            />
          </button>
        </Container>
      </div>
    </header>
  );
}
