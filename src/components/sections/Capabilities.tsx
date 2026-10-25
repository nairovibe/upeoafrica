"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowUpRight, Check } from "lucide-react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { capabilities } from "@/lib/content";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") gsap.registerPlugin(useGSAP);

export function Capabilities() {
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const blockRef = useRef<HTMLSpanElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const imgRefs = useRef<(HTMLDivElement | null)[]>([]);

  const moveBlock = (animate: boolean) => {
    const btn = tabRefs.current[active];
    const block = blockRef.current;
    if (!btn || !block) return;
    gsap.to(block, {
      x: btn.offsetLeft,
      width: btn.offsetWidth,
      duration: animate ? 0.55 : 0,
      ease: "power3.out",
    });
  };

  // position the sliding block on mount + resize (instant)
  useEffect(() => {
    moveBlock(false);
    const onResize = () => moveBlock(false);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  useGSAP(
    () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      moveBlock(!reduce);

      imgRefs.current.forEach((el, i) => {
        if (!el) return;
        const on = i === active;
        if (reduce) gsap.set(el, { autoAlpha: on ? 1 : 0, scale: 1 });
        else
          gsap.to(el, {
            autoAlpha: on ? 1 : 0,
            scale: on ? 1 : 1.06,
            duration: 0.7,
            ease: "power3.out",
          });
      });

      if (contentRef.current) {
        const items = contentRef.current.querySelectorAll(".cap-anim");
        if (reduce) gsap.set(items, { opacity: 1, y: 0 });
        else
          gsap.fromTo(
            items,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.55, stagger: 0.07, ease: "power3.out" },
          );
      }
    },
    { dependencies: [active], scope: rootRef },
  );

  const cap = capabilities[active];

  return (
    <section className="bg-[#edf3f8] pt-28 pb-24 lg:pt-36 lg:pb-32">
      <Container>
        <SectionHeading
          align="center"
          title="What we do"
          intro="We design, build, and scale as one practice. The interface, the product, and the customers who have to find it stay with the same designers, software engineers, and marketers."
        />

        <div ref={rootRef} className="mt-14">
          {/* Sharp index tabs with sliding orange block */}
          <div className="relative flex overflow-hidden border border-ink-900/12">
            <span
              ref={blockRef}
              className="pointer-events-none absolute inset-y-0 left-0 bg-brand-500"
              aria-hidden
            />
            {capabilities.map((c, i) => {
              const on = i === active;
              return (
                <button
                  key={c.eyebrow}
                  ref={(el) => {
                    tabRefs.current[i] = el;
                  }}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-pressed={on}
                  className={cn(
                    "group relative z-10 flex min-w-0 flex-1 cursor-pointer items-baseline gap-1.5 px-2.5 py-4 text-left transition-colors duration-300 ease-out-expo sm:gap-4 sm:px-8 sm:py-7",
                    i > 0 && "border-l border-ink-900/12",
                    // Only the inactive tabs take a hover tint: the active one
                    // sits on the sliding orange block and must stay clear.
                    !on && "hover:bg-ink-900/[0.04]",
                  )}
                >
                  <span
                    className={cn(
                      "font-display text-base font-light tabular-nums transition-colors duration-300 ease-out-expo sm:text-3xl",
                      on ? "text-white/60" : "text-ink-900/25 group-hover:text-ink-900/45",
                    )}
                  >
                    0{i + 1}
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span
                      className={cn(
                        "font-display text-[13px] font-bold uppercase tracking-wide transition-colors duration-300 ease-out-expo sm:text-xl",
                        on ? "text-white" : "text-ink-900 group-hover:text-brand-600",
                      )}
                    >
                      {c.eyebrow}
                    </span>
                    <span
                      className={cn(
                        "mt-0.5 hidden text-xs transition-colors duration-300 ease-out-expo sm:block",
                        on ? "text-white/70" : "text-muted group-hover:text-slate-ink",
                      )}
                    >
                      {c.cta.label}
                    </span>
                  </span>
                  <ArrowUpRight
                    className={cn(
                      "ml-auto h-5 w-5 shrink-0 self-center transition-[color,opacity,transform] duration-300 ease-out-expo",
                      on
                        ? "text-white opacity-100"
                        : "-translate-x-1 text-ink-900/25 opacity-0 group-hover:translate-x-0 group-hover:text-brand-500 group-hover:opacity-100",
                    )}
                  />
                </button>
              );
            })}
          </div>

          {/* Panel */}
          <div className="mt-10 grid items-stretch gap-8 lg:mt-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
            {/* Sharp image */}
            <div className="relative min-h-[300px] overflow-hidden border border-ink-900/10 sm:min-h-[380px]">
              {capabilities.map((c, i) => (
                <div
                  key={c.eyebrow}
                  ref={(el) => {
                    imgRefs.current[i] = el;
                  }}
                  className="absolute inset-0"
                  style={{ opacity: i === active ? 1 : 0 }}
                >
                  <Image
                    src={c.image}
                    alt={c.imageAlt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-950/55 to-transparent" />
                  <span className="absolute left-0 top-0 bg-brand-500 px-4 py-2 font-display text-xs font-bold uppercase tracking-[0.18em] text-white">
                    0{i + 1} / {c.eyebrow}
                  </span>
                </div>
              ))}
            </div>

            {/* Content */}
            <div ref={contentRef} className="flex flex-col justify-center py-2">
              <h3 className="cap-anim text-3xl font-bold leading-[1.1] text-ink-900 sm:text-4xl">
                {cap.title}
              </h3>
              <p className="cap-anim mt-5 text-[15px] leading-relaxed text-body">
                {cap.description}
              </p>
              <ul className="cap-anim mt-7 flex flex-col divide-y divide-line border-y border-line">
                {cap.bullets.map((b) => (
                  <li
                    key={b}
                    className="flex items-center gap-3 py-3.5 text-[15px] font-medium text-slate-ink"
                  >
                    <Check className="h-4 w-4 shrink-0 text-brand-500" />
                    {b}
                  </li>
                ))}
              </ul>
              <div className="cap-anim mt-8">
                <Button href={cap.cta.href} withArrow>
                  {cap.cta.label}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
