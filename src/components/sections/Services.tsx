import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { stagger } from "@/components/ui/stagger";
import { Button } from "@/components/ui/Button";
import { services } from "@/lib/content";

export function Services({ limit }: { limit?: number }) {
  const list = limit ? services.slice(0, limit) : services;
  return (
    <section id="services" className="bg-white py-24 lg:py-32">
      <Container>
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            title="Our services"
            intro="Built for businesses across Africa that need the work held by one team. Every service we deliver is scoped with you and carried through launch and support."
          />
          <Reveal>
            <Button href="/services" variant="outline" withArrow className="shrink-0">
              All services
            </Button>
          </Reveal>
        </div>

        {/* Sharp bordered cards with breathing room */}
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((s, i) => (
            <Reveal key={s.slug} delay={stagger(i, 3)} className="flex">
              <Link
                href={`/services/${s.slug}`}
                className="group relative flex h-full w-full flex-col border border-ink-900/12 p-8 transition-colors duration-300 ease-out-expo hover:bg-ink-950"
              >
                <span className="pointer-events-none absolute right-6 top-6 font-display text-5xl font-light leading-none text-ink-900/[0.06] transition-colors duration-300 ease-out-expo group-hover:text-white/15">
                  {String(i + 1).padStart(2, "0")}
                </span>

                <span className="inline-flex h-12 w-12 items-center justify-center border border-ink-900/12 text-ink-900 transition-[color,background-color,border-color] duration-300 ease-out-expo group-hover:border-brand-500 group-hover:bg-brand-500 group-hover:text-white">
                  <s.icon className="h-6 w-6 transition-transform duration-300 ease-out-expo group-hover:scale-110" />
                </span>

                <h3 className="mt-6 text-lg font-semibold text-ink-900 transition-colors duration-300 ease-out-expo group-hover:text-white">
                  {s.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-body transition-colors duration-300 ease-out-expo group-hover:text-white/65">
                  {s.short}
                </p>

                <div className="mt-6 flex items-center justify-between border-t border-ink-900/10 pt-4 transition-colors duration-300 ease-out-expo group-hover:border-white/15">
                  <div className="flex flex-wrap gap-x-3 gap-y-1">
                    {s.features.slice(0, 2).map((f) => (
                      <span
                        key={f}
                        className="text-xs font-medium text-muted transition-colors duration-300 ease-out-expo group-hover:text-white/50"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                  <ArrowUpRight className="h-5 w-5 -translate-x-1 text-ink-900/20 opacity-0 transition-[color,opacity,transform] duration-300 ease-out-expo group-hover:translate-x-0 group-hover:text-brand-400 group-hover:opacity-100" />
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
