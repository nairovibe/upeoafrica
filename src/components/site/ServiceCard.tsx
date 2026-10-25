import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Service } from "@/lib/content";

/**
 * One service, as a card with its own call to action.
 *
 * Shared by the services index and the "related services" rail on each service
 * page, so the two can never drift apart. The card always links somewhere: a
 * service the reader cannot act on is just a paragraph.
 */
export function ServiceCard({ service }: { service: Service }) {
  return (
    <article className="group flex h-full flex-col border border-line bg-white p-8 transition-[border-color,box-shadow] duration-300 ease-out-expo hover:border-brand-300 hover:shadow-[0_24px_60px_-32px_rgba(11,14,20,0.28)]">
      <span className="inline-flex h-12 w-12 items-center justify-center border border-ink-900/12 text-ink-900 transition-[color,background-color,border-color] duration-300 ease-out-expo group-hover:border-brand-500 group-hover:bg-brand-500 group-hover:text-white">
        <service.icon className="h-6 w-6 transition-transform duration-300 ease-out-expo group-hover:scale-110" />
      </span>

      <h3 className="mt-6 font-display text-lg font-semibold text-ink-900">
        {service.title}
      </h3>

      {/* The short rule under the heading, as in the reference layout. */}
      <span className="mt-3 block h-0.5 w-10 bg-brand-500 transition-[width] duration-300 ease-out-expo group-hover:w-16" aria-hidden />

      <p className="mt-4 flex-1 text-[15px] leading-relaxed text-body">
        {service.description}
      </p>

      <Link
        href={`/services/${service.slug}`}
        className="mt-6 inline-flex items-center gap-2 border-t border-line pt-5 text-sm font-semibold text-ink-900 transition-colors duration-300 ease-out-expo hover:text-brand-600"
      >
        Get this service
        <ArrowRight className="h-4 w-4 text-brand-500 transition-transform duration-300 ease-out-expo group-hover:translate-x-1" />
        <span className="sr-only">, {service.title}</span>
      </Link>
    </article>
  );
}
