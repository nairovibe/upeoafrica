import Link from "next/link";
import { ArrowUpRight, Mail, Phone, MapPin } from "lucide-react";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaXTwitter } from "react-icons/fa6";
import { Logo } from "@/components/brand/Logo";
import { Container } from "@/components/ui/Container";
import { NewsletterForm } from "@/components/site/NewsletterForm";
import { company, legalNav } from "@/lib/content";

const quickLinks = [
  { label: "Founder Zone", href: "/founders" },
  { label: "Our Work", href: "/work" },
  { label: "Products", href: "/products" },
  { label: "Blogs", href: "/blogs" },
  { label: "Events", href: "/events" },
  { label: "Contact Us", href: "/contact" },
];

export function Footer({
  linkedin,
  xUrl,
}: {
  linkedin?: string | null;
  xUrl?: string | null;
}) {
  const year = 2026;
  const socials = [
    { icon: FaFacebookF, label: "Facebook", href: company.social.facebook },
    { icon: FaXTwitter, label: "X", href: xUrl || company.social.x },
    { icon: FaLinkedinIn, label: "LinkedIn", href: linkedin || company.social.linkedin },
    { icon: FaInstagram, label: "Instagram", href: company.social.instagram },
  ];

  return (
    <footer className="bg-ink-950 text-white/70">
      <Container className="py-14 pb-28 lg:py-16 lg:pb-32">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="max-w-sm lg:col-span-4">
            <Logo variant="light" />
            <p className="mt-5 text-sm leading-relaxed text-white/60">
              A full-service digital agency building tailored software, brands, and
              marketing that help businesses across Africa build, launch, and grow.
            </p>
            <div className="mt-6 flex items-center gap-2.5">
              {socials.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-[5px] border border-white/10 text-white/70 transition-[color,background-color,border-color,transform] duration-300 ease-out-expo hover:-translate-y-0.5 hover:border-brand-500 hover:bg-brand-500 hover:text-white"
                >
                  <Icon className="h-4 w-4" aria-hidden />
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white">Quick links</h2>
            <ul className="mt-5 space-y-3 text-sm">
              {quickLinks.map((item) => (
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

          <div className="lg:col-span-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white">Newsletter</h2>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-white/60">
              Short notes on software, payments, and the work we ship. No filler.
            </p>
            <NewsletterForm />
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8 text-center">
          <ul className="flex flex-col items-center gap-3 text-sm sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-8 sm:gap-y-3">
            <li className="flex items-center gap-2.5">
              <MapPin className="h-4 w-4 shrink-0 text-brand-500" aria-hidden />
              <span>{company.addressLine}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 shrink-0 text-brand-500" aria-hidden />
              <a
                href={`mailto:${company.email}`}
                className="transition-colors duration-300 ease-out-expo hover:text-brand-400"
              >
                {company.email}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 shrink-0 text-brand-500" aria-hidden />
              <a
                href={`tel:${company.phone.replace(/\s/g, "")}`}
                className="transition-colors duration-300 ease-out-expo hover:text-brand-400"
              >
                {company.phone}
              </a>
            </li>
          </ul>

          <p className="mt-8 text-sm text-white/55">
            © {year} {company.name}. All rights reserved.
          </p>
          <p className="mt-2 text-xs text-white/40">
            A subsidiary of{" "}
            <a
              href="https://averissystems.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-0.5 text-white/60 underline-offset-2 transition-colors duration-300 ease-out-expo hover:text-brand-400 hover:underline"
            >
              Averis Systems Limited
              <ArrowUpRight className="h-3 w-3" aria-hidden />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </p>
          <nav aria-label="Legal" className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/50">
            {legalNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition-colors duration-300 ease-out-expo hover:text-brand-400"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </Container>
    </footer>
  );
}
