"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X, ChevronDown, ArrowRight, ArrowUpRight, MapPin, Phone, Mail } from "lucide-react";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaXTwitter } from "react-icons/fa6";
import { Logo } from "@/components/brand/Logo";
import { Container } from "@/components/ui/Container";
import { OPEN_INQUIRY_EVENT } from "@/components/site/InquiryModal";
import { services, company, nav } from "@/lib/content";
import { cn } from "@/lib/utils";

const navItems: { label: string; href: string; menu?: boolean }[] = nav.map((item) =>
  item.href === "/services" ? { ...item, menu: true } : item,
);

const serviceLinks = services.map((service) => ({
  href: `/services/${service.slug}`,
  label: service.title,
}));

const openInquiry = () => window.dispatchEvent(new Event(OPEN_INQUIRY_EVENT));
const tel = company.phone.replace(/\s/g, "");

const navLinkClass = (active: boolean) =>
  cn(
    "inline-flex items-center gap-1 px-2 py-2 text-[14px] leading-5 font-medium transition-colors duration-300 xl:gap-1.5 xl:px-3 xl:text-[15px]",
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
  color,
  children,
}: {
  href: string;
  label: string;
  color?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="inline-flex h-12 w-7 items-center justify-center transition-opacity duration-300 hover:opacity-70"
      style={color ? { color } : undefined}
    >
      {children}
    </a>
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
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServices, setMobileServices] = useState(false);
  const pathname = usePathname();

  // Navigating closes both menus. This is React's documented "reset state when
  // an input changes" pattern rather than an effect: adjusting during render
  // re-renders immediately, before the browser paints, so an open panel never
  // flashes onto the new page the way an effect-based reset does.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
    setServicesOpen(false);
    setMobileServices(false);
  }

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-white font-display">
      <div className="hidden border-b border-[#ececec] bg-[#F5F5F5] md:block">
        <Container className="flex h-12 items-center justify-between gap-6 text-[12px] leading-4 font-normal text-[#1c1c1c]">
          <span className="inline-flex min-w-0 items-center gap-2">
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="truncate">{company.addressLine}</span>
          </span>
          <span className="flex shrink-0 items-center gap-4">
            <a
              href={`tel:${tel}`}
              className="inline-flex h-12 items-center gap-1.5 transition-colors duration-300 hover:text-brand-600"
            >
              <Phone className="h-3.5 w-3.5" aria-hidden />
              {company.phone}
            </a>
            <a
              href={`mailto:${company.email}`}
              className="hidden h-12 items-center gap-1.5 transition-colors duration-300 hover:text-brand-600 xl:inline-flex"
            >
              <Mail className="h-3.5 w-3.5" aria-hidden />
              {company.email}
            </a>
            <span className="inline-flex items-center gap-0.5">
              <svg width="0" height="0" className="absolute" aria-hidden>
                <defs>
                  <linearGradient id="instagram-official" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#fccc63" />
                    <stop offset="20%" stopColor="#f77737" />
                    <stop offset="45%" stopColor="#e1306c" />
                    <stop offset="70%" stopColor="#c13584" />
                    <stop offset="100%" stopColor="#833ab4" />
                  </linearGradient>
                </defs>
              </svg>
              <SocialIcon href={company.social.facebook} label="Facebook" color="#1877F2">
                <FaFacebookF className="h-3.5 w-3.5" aria-hidden />
              </SocialIcon>
              <SocialIcon href={xUrl || company.social.x} label="X" color="#000000">
                <FaXTwitter className="h-3.5 w-3.5" aria-hidden />
              </SocialIcon>
              <SocialIcon href={linkedin || company.social.linkedin} label="LinkedIn" color="#0A66C2">
                <FaLinkedinIn className="h-3.5 w-3.5" aria-hidden />
              </SocialIcon>
              <SocialIcon href={company.social.instagram} label="Instagram">
                <FaInstagram className="h-3.5 w-3.5 [&>path]:fill-[url(#instagram-official)]" aria-hidden />
              </SocialIcon>
            </span>
          </span>
        </Container>
      </div>

      <Container className="relative flex h-[72px] items-center gap-6">
        <Logo priority className="relative z-10 shrink-0" />

        <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex" aria-label="Primary">
          {navItems.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            if (item.menu) {
              return (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => setServicesOpen(true)}
                  onMouseLeave={() => setServicesOpen(false)}
                >
                  <Link
                    href={item.href}
                    aria-expanded={servicesOpen}
                    aria-haspopup="true"
                    aria-current={active ? "page" : undefined}
                    className={navLinkClass(active)}
                    onClick={(event) => {
                      if (!servicesOpen) {
                        event.preventDefault();
                        setServicesOpen(true);
                      }
                    }}
                  >
                    <NavLabel active={active}>{item.label}</NavLabel>
                    <ChevronDown
                      className={cn("h-3.5 w-3.5 transition-transform duration-300", servicesOpen && "rotate-180")}
                      aria-hidden
                    />
                  </Link>
                  {servicesOpen && <ServicesMenu />}
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

        <div className="relative z-10 ml-auto hidden items-center lg:flex">
          <button
            type="button"
            onClick={openInquiry}
            className="inline-flex h-11 cursor-pointer items-center justify-center rounded-full bg-brand-500 px-7 text-[15px] leading-5 font-semibold text-white transition-colors duration-300 hover:bg-brand-600"
          >
            Start a project
          </button>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="relative z-10 ml-auto inline-flex h-11 w-11 cursor-pointer items-center justify-center text-ink-900 transition-colors duration-300 ease-out-expo hover:bg-surface-3 lg:ml-0 lg:hidden"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </Container>

      {/* Mobile menu */}
      <div
        className={cn(
          "overflow-y-auto transition-[max-height] duration-300 ease-out lg:hidden",
          open
            ? "max-h-[80vh] border-t border-line bg-white"
            : "max-h-0 border-t-0 border-transparent bg-transparent",
        )}
      >
        <Container className="flex flex-col py-2">
          {navItems.map((item) => {
            if (item.menu) {
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
                      onClick={() => setMobileServices((value) => !value)}
                      aria-label={`${mobileServices ? "Collapse" : "Expand"} ${item.label}`}
                      aria-expanded={mobileServices}
                      className="inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center text-ink-900"
                    >
                      <ChevronDown className={cn("h-5 w-5 transition-transform duration-300", mobileServices && "rotate-180")} />
                    </button>
                  </div>
                  <div className={cn("overflow-hidden transition-[max-height] duration-300", mobileServices ? "max-h-[800px]" : "max-h-0")}>
                    <div className="flex flex-col gap-2 pb-4">
                      {serviceLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="flex items-center justify-between rounded-lg border border-[#ececec] px-4 py-3 text-sm font-medium text-ink-900"
                        >
                          {link.label}
                          <ArrowUpRight className="h-4 w-4 text-muted" aria-hidden />
                        </Link>
                      ))}
                    </div>
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

function ServicesMenu() {
  const midpoint = Math.ceil(serviceLinks.length / 2);
  const columns = [serviceLinks.slice(0, midpoint), serviceLinks.slice(midpoint)];

  return (
    <div className="absolute left-1/2 top-full z-50 w-[640px] -translate-x-1/2 pt-3">
      <div className="grid grid-cols-2 gap-2 rounded-2xl border border-[#ececec] bg-white p-3 shadow-[0_18px_40px_-24px_rgba(0,0,0,0.35)]">
        {columns.map((column, index) => (
          <div key={index} className="flex flex-col gap-2">
            {column.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex min-h-11 items-center justify-between gap-3 rounded-lg border border-[#ececec] bg-white px-4 py-3 text-sm font-medium text-[#1c1c1c] transition-colors duration-300 hover:border-brand-200 hover:text-brand-600"
              >
                <span>{link.label}</span>
                <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden />
              </Link>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
