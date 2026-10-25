"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { stagger } from "@/components/ui/stagger";
import { process } from "@/lib/content";

if (typeof window !== "undefined") gsap.registerPlugin(useGSAP);

const POS = [10, 30, 50, 70, 90];

const INACTIVE = {
  backgroundColor: "rgba(255,255,255,0.04)",
  borderColor: "rgba(255,255,255,0.15)",
  color: "rgba(255,255,255,0.65)",
  boxShadow: "0 0 0 rgba(0,0,0,0)",
};

export function HowWeWork() {
  const rootRef = useRef<HTMLDivElement>(null);
  const pulseRef = useRef<HTMLSpanElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const nodes = nodeRefs.current;

      if (reduce) {
        nodes.forEach(
          (n) =>
            n &&
            gsap.set(n, {
              backgroundColor: "#f97316",
              borderColor: "#f97316",
              color: "#fff",
            }),
        );
        if (progressRef.current) gsap.set(progressRef.current, { width: "80%" });
        if (pulseRef.current) gsap.set(pulseRef.current, { opacity: 0 });
        return;
      }

      const activate = (el: HTMLDivElement | null) =>
        el &&
        gsap.to(el, {
          backgroundColor: "#f97316",
          borderColor: "#f97316",
          color: "#fff",
          boxShadow: "0 0 26px rgba(249,115,22,0.65)",
          duration: 0.3,
          ease: "power2.out",
        });
      const reset = () =>
        nodes.forEach((n) => n && gsap.to(n, { ...INACTIVE, duration: 0.4 }));

      const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.4 });
      tl.set(pulseRef.current, { left: "10%", opacity: 1 });
      tl.set(progressRef.current, { width: 0 });
      nodes.forEach((n) => n && gsap.set(n, { ...INACTIVE }));

      POS.forEach((p, i) => {
        const dur = i === 0 ? 0.001 : 0.7;
        tl.to(pulseRef.current, { left: `${p}%`, duration: dur, ease: "power1.inOut" });
        tl.to(
          progressRef.current,
          { width: `${p - 10}%`, duration: dur, ease: "power1.inOut" },
          "<",
        );
        tl.call(() => activate(nodes[i]));
      });

      tl.to(pulseRef.current, { opacity: 0, duration: 0.45 }, "+=0.6");
      tl.call(() => reset());
      tl.to(progressRef.current, { width: 0, duration: 0.45 }, "<");
      tl.set(pulseRef.current, { left: "10%" });
      tl.to(pulseRef.current, { opacity: 1, duration: 0.3 });
    },
    { scope: rootRef },
  );

  return (
    <section className="relative overflow-hidden bg-ink-950 py-24 lg:py-32 text-white">
      {/* Studio shot parked behind the section. `bg-fixed` gives the parallax as
          the timeline scrolls past; mobile falls back to `bg-scroll` because iOS
          Safari renders fixed attachment unreliably and repaints cost more there. */}
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center bg-scroll md:bg-fixed"
        style={{ backgroundImage: "url('/how-we-work-bg.jpg')" }}
        aria-hidden
      />
      {/* Scrim tuned by measurement, not eye: at 75% the brightest part of the
          plate (the blown-out windows) still gives white text 9.5:1, well clear
          of the 4.5:1 AA floor, while leaving the studio actually visible. */}
      <div className="pointer-events-none absolute inset-0 bg-ink-950/75" aria-hidden />
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-30" aria-hidden />
      <Container className="relative">
        <SectionHeading
          align="center"
          tone="light"
          eyebrow="How we work"
          intro="Five stages, from the first conversation through launch and support. You see what is in progress, and what comes next."
        />

        {/* Desktop looping node flow */}
        <div ref={rootRef} className="mt-20 hidden lg:block">
          <div className="relative">
            {/* base line */}
            <span className="absolute left-[10%] right-[10%] top-8 h-px -translate-y-1/2 bg-white/12" />
            {/* progress line */}
            <span
              ref={progressRef}
              className="absolute left-[10%] top-8 h-[2px] w-0 -translate-y-1/2 bg-brand-500"
            />
            {/* travelling pulse */}
            <span
              ref={pulseRef}
              className="absolute top-8 left-[10%] z-10 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-400 shadow-[0_0_18px_6px_rgba(249,115,22,0.55)]"
            />

            <div className="relative grid grid-cols-5">
              {process.map((step, i) => (
                /* The reveal wraps the column, never the node itself: GSAP owns
                   the node's own transform for the looping pulse. */
                <Reveal
                  key={step.n}
                  delay={stagger(i, 5)}
                  className="flex flex-col items-center px-3 text-center"
                >
                  <div
                    ref={(el) => {
                      nodeRefs.current[i] = el;
                    }}
                    className="flex h-16 w-16 items-center justify-center rounded-full border"
                    style={{ ...INACTIVE }}
                  >
                    <step.icon className="h-7 w-7" />
                  </div>
                  <span className="mt-5 font-display text-xs font-semibold uppercase tracking-[0.2em] text-brand-400">
                    Step {step.n}
                  </span>
                  <h3 className="mt-1.5 text-lg font-semibold text-white">{step.title}</h3>
                  <p className="mt-2 max-w-[220px] text-sm leading-relaxed text-white/60">
                    {step.description}
                  </p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile vertical timeline */}
        <div className="relative mt-14 lg:hidden">
          <span className="absolute bottom-6 left-8 top-6 w-px bg-white/12" />
          <ol className="flex flex-col gap-8">
            {process.map((step) => (
              <Reveal key={step.n} as="li" className="relative flex gap-5">
                <div className="relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-brand-500/50 bg-ink-900 text-brand-400">
                  <step.icon className="h-6 w-6" />
                </div>
                <div className="pt-1.5">
                  <span className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-brand-400">
                    Step {step.n}
                  </span>
                  <h3 className="mt-1 text-lg font-semibold text-white">{step.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-white/60">
                    {step.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}
