import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { OpenInquiry } from "@/components/site/OpenInquiry";
import { services } from "@/lib/services";

/** Shown while no case study is published: points visitors at what we build instead of a blank page. */
export function WorkEmpty() {
  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-20">
      <div className="max-w-lg">
        <h2 className="font-display text-2xl font-bold leading-tight text-ink-900 sm:text-3xl">
          Case studies are being written up from live projects.
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-body">
          Each one will show the brief, what we built, and the numbers after launch. Until they are up, we can walk you
          through comparable work on a call.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <OpenInquiry className="group inline-flex cursor-pointer items-center gap-2 rounded-[5px] bg-brand-500 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-600">
            Start a project
            <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out-expo group-hover:translate-x-0.5" aria-hidden />
          </OpenInquiry>
          <Link href="/contact" className="text-sm font-medium text-ink-900 underline decoration-line underline-offset-4 hover:decoration-brand-500">
            Ask for references
          </Link>
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">What we build</p>
        <ul className="mt-4 divide-y divide-line border-y border-line">
          {services.map((s) => (
            <li key={s.slug}>
              <Link
                href={`/services/${s.slug}`}
                className="group -mx-3 flex items-center gap-4 px-3 py-4 transition-colors hover:bg-surface-2"
              >
                <s.icon className="h-5 w-5 shrink-0 text-brand-600" aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-ink-900">{s.title}</span>
                  <span className="block truncate text-sm text-muted">{s.short}</span>
                </span>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-muted transition-colors group-hover:text-brand-600" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
