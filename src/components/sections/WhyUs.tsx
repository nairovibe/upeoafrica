import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { stagger } from "@/components/ui/stagger";
import { OpenInquiry } from "@/components/site/OpenInquiry";
import { differentiators } from "@/lib/content";

export function WhyUs() {
  return (
    <section className="bg-[#edf3f8] py-24 lg:py-32">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] lg:items-stretch lg:gap-16">
          {/* Portrait panel: the emotional half of the argument */}
          <Reveal className="lg:h-full">
            <figure className="group relative h-full overflow-hidden rounded-2xl">
              <div className="relative aspect-[4/5] w-full lg:h-full lg:aspect-auto">
                <Image
                  src="/pages/why-choose-us.jpg"
                  alt="The Upeo Africa Technologies Ltd. office, branded reception wall with the team at work behind it"
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover transition-transform duration-500 ease-out-expo group-hover:scale-[1.03]"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/65 to-transparent"
                  aria-hidden
                />
              </div>

              <figcaption className="absolute inset-x-0 bottom-0 p-7 lg:p-9">
                <h3 className="font-display text-2xl font-bold leading-tight text-white">
                  The Upeo advantage
                </h3>
                <p className="mt-3 max-w-md text-[15px] leading-relaxed text-white/75">
                  Choosing the right technology partner changes everything. We pair senior
                  engineering with sharp design and marketing that performs, so your
                  business doesn&apos;t just launch, it keeps growing.
                </p>
              </figcaption>
            </figure>
          </Reveal>

          {/* The reasons */}
          <div className="lg:pt-2">
            <Reveal>
              <h2 className="text-3xl font-bold leading-[1.08] sm:text-4xl md:text-[2.75rem]">
                Why Choose Upeo Africa Technologies?
              </h2>
            </Reveal>
            <Reveal delay={0.05}>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-body">
                We go beyond the brief to how your staff, customers, and operations
                actually work, then design, build, and market around that. The result is
                a product that keeps performing after launch.
              </p>
            </Reveal>

            <div className="mt-12 grid gap-x-10 gap-y-9 sm:grid-cols-2">
              {differentiators.map((d, i) => (
                <Reveal key={d.title} delay={0.12 + stagger(i, 2)}>
                  <div className="group">
                    <div className="flex items-center gap-2.5">
                      <d.icon className="h-[18px] w-[18px] shrink-0 text-brand-600 transition-transform duration-300 ease-out-expo group-hover:scale-110" />
                      <h3 className="font-display text-[17px] font-semibold text-ink-900 transition-colors duration-300 ease-out-expo group-hover:text-brand-700">
                        {d.title}
                      </h3>
                    </div>
                    <p className="mt-2.5 text-[15px] leading-relaxed text-body">
                      {d.description}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.2}>
              <div className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-4 border-t border-line pt-8">
                <OpenInquiry className="group inline-flex cursor-pointer items-center gap-2 bg-ink-900 px-6 py-3.5 text-sm font-medium text-white transition-[background-color,box-shadow,transform] duration-300 ease-out-expo hover:-translate-y-0.5 hover:bg-brand-500 hover:shadow-[0_14px_34px_-12px_rgba(249,115,22,0.8)] active:translate-y-0 active:duration-100">
                  Start a project
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-300 ease-out-expo group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </OpenInquiry>
                <p className="text-sm text-muted">
                  A short discovery call, a clear plan, and a quote before you commit.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
