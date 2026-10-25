import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";
import { FaGithub, FaLinkedinIn, FaXTwitter } from "react-icons/fa6";
import { Logo } from "@/components/brand/Logo";
import { Container } from "@/components/ui/Container";
import { company, nav, services, legalNav } from "@/lib/content";

export function Footer({
  linkedin,
  xUrl,
  github,
}: {
  linkedin?: string | null;
  xUrl?: string | null;
  github?: string | null;
}) {
  const year = 2026;
  const socials = [
    { icon: FaLinkedinIn, label: "LinkedIn", href: linkedin },
    { icon: FaXTwitter, label: "X / Twitter", href: xUrl },
    { icon: FaGithub, label: "GitHub", href: github },
  ].filter((s) => s.href);
  return (
    <footer className="bg-ink-950 text-white/70">
      <Container className="py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-6">
          <div className="lg:col-span-2 max-w-sm">
            <Logo variant="light" />
            <p className="mt-5 text-sm leading-relaxed text-white/60">
              A full-service digital agency building tailored software, brands, and
              marketing that help businesses across Africa build, launch, and grow.
            </p>
            {socials.length > 0 && (
            <div className="mt-6 flex items-center gap-2.5">
              {socials.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href!}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="inline-flex h-10 w-10 items-center justify-center border border-white/10 text-white/70 transition-[color,background-color,border-color,transform] duration-300 ease-out-expo hover:-translate-y-0.5 hover:border-brand-500 hover:bg-brand-500 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
            )}
          </div>

          <FooterCol title="Company" links={nav} />

          <div className="min-w-0">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Services
            </h3>
            <ul className="mt-5 space-y-3 text-sm">
              {services.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/services/${s.slug}`}
                    className="transition-colors duration-300 ease-out-expo hover:text-brand-400"
                  >
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <FooterCol title="Legal" links={legalNav} />

          <div className="min-w-0">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Get in touch
            </h3>
            <ul className="mt-5 space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                <span>{company.addressLine}</span>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                <a
                  href={`mailto:${company.email}`}
                  className="min-w-0 break-all transition-colors duration-300 ease-out-expo hover:text-brand-400"
                >
                  {company.email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                <a
                  href={`tel:${company.phone.replace(/\s/g, "")}`}
                  className="transition-colors duration-300 ease-out-expo hover:text-brand-400"
                >
                  {company.phone}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center gap-4 border-t border-white/10 pt-8 text-center text-sm text-white/50 sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <p>
            © {year} {company.legalName}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 sm:justify-start">
            {legalNav.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="transition-colors duration-300 ease-out-expo hover:text-brand-400"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div className="min-w-0">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-white">{title}</h3>
      <ul className="mt-5 space-y-3 text-sm">
        {links.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="transition-colors duration-300 ease-out-expo hover:text-brand-400"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
