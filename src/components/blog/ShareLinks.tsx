"use client";

import { useState } from "react";
import { Check, Link2 } from "lucide-react";
import { FaFacebookF, FaLinkedinIn, FaWhatsapp, FaXTwitter } from "react-icons/fa6";

const buttonCls =
  "inline-flex h-9 w-9 items-center justify-center rounded-full text-white transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-900 sm:h-10 sm:w-10";

export function ShareLinks({ url, title, stacked = false }: { url: string; title: string; stacked?: boolean }) {
  const [copied, setCopied] = useState(false);
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const networks = [
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}`, icon: FaFacebookF, color: "bg-[#1877F2]" },
    { label: "X", href: `https://x.com/intent/post?url=${u}&text=${t}`, icon: FaXTwitter, color: "bg-black" },
    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`, icon: FaLinkedinIn, color: "bg-[#0A66C2]" },
    { label: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`, icon: FaWhatsapp, color: "bg-[#25D366]" },
  ];

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className={stacked ? undefined : "w-full sm:ml-auto sm:w-auto"}>
      {stacked ? <p className="text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">Share</p> : null}
      <div className={stacked ? "mt-3 flex flex-col items-center gap-2" : "flex items-center gap-2"} role="group" aria-label="Share this article">
        {networks.map((item) => (
          <a key={item.label} className={`${buttonCls} ${item.color}`} href={item.href} target="_blank" rel="noopener noreferrer" aria-label={`Share on ${item.label}`}>
            <item.icon className="h-4 w-4" aria-hidden />
          </a>
        ))}
        <button type="button" className={`${buttonCls} bg-ink-900`} onClick={copy} aria-label={copied ? "Link copied" : "Copy link"}>
          {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
