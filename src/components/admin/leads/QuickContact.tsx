import { Mail, Phone } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { telHref, whatsappHref } from "@/components/admin/leads/data";

const linkClass =
  "inline-flex h-8 items-center gap-1.5 rounded-[5px] border border-line bg-white px-2.5 text-xs font-medium text-ink-900 hover:border-brand-300";

export function QuickContact({ email, phone }: { email: string; phone: string | null }) {
  const tel = telHref(phone);
  const wa = whatsappHref(phone);
  return (
    <div className="flex flex-wrap gap-1.5">
      <a href={`mailto:${email}`} className={linkClass} title={email}>
        <Mail className="h-3.5 w-3.5 text-muted" aria-hidden />
        Email
      </a>
      {tel ? (
        <a href={tel} className={linkClass} title={phone ?? ""}>
          <Phone className="h-3.5 w-3.5 text-muted" aria-hidden />
          Call
        </a>
      ) : null}
      {wa ? (
        <a href={wa} target="_blank" rel="noreferrer noopener" className={linkClass}>
          <FaWhatsapp className="h-3.5 w-3.5 text-[#25D366]" aria-hidden />
          WhatsApp
        </a>
      ) : null}
    </div>
  );
}
