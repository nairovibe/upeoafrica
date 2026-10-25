import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { OpenInquiry } from "@/components/site/OpenInquiry";
import { company } from "@/lib/content";

export function CTA({
  title = "Let's build something that lasts",
  intro = "Tell us where you want to take your business. We'll help you get there.",
}: {
  title?: string;
  intro?: string;
}) {
  return (
    <section className="bg-ink-950 py-20 text-white lg:py-24">
      <Container>
        <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
          <Reveal>
            <div className="max-w-xl">
              <h2 className="text-3xl font-bold leading-[1.08] text-white sm:text-4xl md:text-[2.75rem]">
                {title}
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-white/70">{intro}</p>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="flex shrink-0 flex-col items-start gap-3 sm:flex-row sm:items-center">
              <OpenInquiry className="group inline-flex cursor-pointer items-center gap-2 bg-brand-500 px-6 py-3.5 text-sm font-medium text-white transition-[background-color,box-shadow,transform] duration-300 ease-out-expo hover:-translate-y-0.5 hover:bg-brand-600 hover:shadow-[0_14px_34px_-12px_rgba(249,115,22,0.85)] active:translate-y-0 active:duration-100">
                Start a project
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-300 ease-out-expo group-hover:translate-x-0.5"
                  aria-hidden
                />
              </OpenInquiry>
              <a
                href={`mailto:${company.email}`}
                className="text-sm font-medium text-white/70 underline decoration-transparent underline-offset-4 transition-[color,text-decoration-color] duration-300 ease-out-expo hover:text-white hover:decoration-brand-500"
              >
                or email us
              </a>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
