import { FaEnvelope, FaFacebookF, FaGithub, FaInstagram, FaLinkedinIn, FaXTwitter } from "react-icons/fa6";
import { safeHttpUrl } from "@/lib/stack";

export type ExpertContacts = {
  email?: string | null;
  linkedin_url?: string | null;
  x_url?: string | null;
  facebook_url?: string | null;
  instagram_url?: string | null;
  github_url?: string | null;
};

const LINKS: {
  label: string;
  color: string;
  tile?: boolean;
  icon: typeof FaEnvelope;
  href: (person: ExpertContacts) => string | null;
}[] = [
  {
    label: "Email",
    color: "#0b0e14",
    icon: FaEnvelope,
    href: (person) => (person.email ? `mailto:${person.email}` : null),
  },
  {
    label: "LinkedIn",
    color: "#0A66C2",
    icon: FaLinkedinIn,
    href: (person) => safeHttpUrl(person.linkedin_url),
  },
  {
    label: "X",
    color: "#000000",
    icon: FaXTwitter,
    href: (person) => safeHttpUrl(person.x_url),
  },
  {
    label: "Facebook",
    color: "#1877F2",
    icon: FaFacebookF,
    href: (person) => safeHttpUrl(person.facebook_url),
  },
  {
    label: "Instagram",
    color: "#ffffff",
    tile: true,
    icon: FaInstagram,
    href: (person) => safeHttpUrl(person.instagram_url),
  },
  {
    label: "GitHub",
    color: "#181717",
    icon: FaGithub,
    href: (person) => safeHttpUrl(person.github_url),
  },
];

export function ExpertSocials({ person }: { person: ExpertContacts }) {
  const links = LINKS.flatMap((item) => {
    const href = item.href(person);
    return href ? [{ ...item, href }] : [];
  });
  if (!links.length) return null;

  return (
    <ul className="flex flex-wrap items-center gap-1">
      {links.map((item) => {
        const external = item.href.startsWith("http");
        const Icon = item.icon;
        return (
          <li key={item.label}>
            <a
              href={item.href}
              {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              aria-label={external ? `${item.label} (opens in a new tab)` : item.label}
              className="inline-flex h-11 w-11 items-center justify-center rounded-[5px] transition-opacity duration-200 hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
              style={
                item.tile
                  ? {
                      color: item.color,
                      background:
                        "radial-gradient(circle at 30% 107%, #fdf497 0%, #fd5949 45%, #d6249f 60%, #285AEB 90%)",
                    }
                  : { color: item.color }
              }
            >
              <Icon className="h-5 w-5" aria-hidden />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
