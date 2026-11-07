"use client";

import { useState } from "react";
import { Check, Link2 } from "lucide-react";
import { FaLinkedinIn, FaWhatsapp, FaXTwitter } from "react-icons/fa6";

const rowCls =
  "inline-flex h-9 items-center rounded-[5px] border border-line bg-white px-3 text-[13px] font-medium text-ink-900 transition-colors hover:border-brand-300 hover:text-brand-600";

const stackCls =
  "flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-ink-900 transition-colors hover:border-brand-300 hover:text-brand-600";

export function ShareLinks({ url, title, stacked = false }: { url: string; title: string; stacked?: boolean }) {
  const [copied, setCopied] = useState(false);
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const items = [
    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`, icon: FaLinkedinIn },
    { label: "X", href: `https://x.com/intent/post?url=${u}&text=${t}`, icon: FaXTwitter },
    { label: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`, icon: FaWhatsapp },
  ];

  if (stacked) {
    return (
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Share</p>
        <div className="mt-3 flex flex-col gap-2">
          {items.map((item) => (
            <a key={item.label} className={stackCls} href={item.href} target="_blank" rel="noopener noreferrer" aria-label={`Share on ${item.label}`}>
              <item.icon className="h-4 w-4" aria-hidden />
            </a>
          ))}
          <button type="button" className={stackCls} onClick={copy} aria-label={copied ? "Link copied" : "Copy link"}>
            {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-sm font-medium text-ink-900">Share</span>
      {items.map((item) => (
        <a key={item.label} className={rowCls} href={item.href} target="_blank" rel="noopener noreferrer">
          {item.label}
        </a>
      ))}
      <button type="button" className={rowCls} onClick={copy}>
        {copied ? <Check className="mr-1.5 h-3.5 w-3.5" /> : <Link2 className="mr-1.5 h-3.5 w-3.5" />}
        {copied ? "Copied" : "Copy link"}
      </button>
    </div>
  );
}
