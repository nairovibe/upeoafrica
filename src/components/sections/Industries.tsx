import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { stagger } from "@/components/ui/stagger";
import { industries } from "@/lib/content";

export function Industries() {
  return (
    <section className="bg-white py-24 lg:py-32">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          {/* Left: statement */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeading
              eyebrow="Industries we serve"
              intro="We have already shipped software in these sectors. The first conversation starts from how your business runs."
            />
            <p className="mt-8 font-display text-5xl font-bold text-ink-900 sm:text-6xl">
              {industries.length}
              <span className="text-brand-500">+</span>
            </p>
            <p className="mt-1 text-sm text-muted">core industries, and growing</p>
          </div>

          {/* Right: clean divided list */}
          <div className="divide-y divide-line border-y border-line">
            {industries.map((ind, i) => (
              <Reveal key={ind.title} delay={stagger(i, 2)}>
                {/* The rows are a divided list, so the hover tint bleeds out to
                    the gutters with a negative margin: the hairline dividers
                    stay exactly where they were. */}
                <div className="group -mx-4 flex items-center gap-5 px-4 py-6 transition-colors duration-300 ease-out-expo hover:bg-surface-2">
                  <span className="font-display text-sm tabular-nums text-ink-900/25 transition-colors duration-300 ease-out-expo group-hover:text-brand-500">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center border border-line text-brand-600 transition-[color,background-color,border-color] duration-300 ease-out-expo group-hover:border-brand-500 group-hover:bg-brand-500 group-hover:text-white">
                    <ind.icon className="h-5 w-5" />
                  </span>
                  <span className="text-lg font-semibold text-ink-900 transition-transform duration-300 ease-out-expo group-hover:translate-x-0.5">
                    {ind.title}
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
