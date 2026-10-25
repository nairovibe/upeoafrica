"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { stagger } from "@/components/ui/stagger";
import { LogoMark } from "@/components/brand/Logo";

const EASE = [0.16, 1, 0.3, 1] as const;

// Coordinate space: 1000 x 520 (container uses matching aspect ratio, so no distortion)
const VB_W = 1000;
const VB_H = 520;
const pct = (v: number, total: number) => `${(v / total) * 100}%`;

const inputs = [
  { label: "A rough idea", y: 55 },
  { label: "An outdated website", y: 160 },
  { label: "No leads coming in", y: 260 },
  { label: "Manual, messy processes", y: 360 },
  { label: "A brand that blends in", y: 465 },
];

const groups = [
  { cat: "Build", labelY: 24, items: [{ label: "Web & mobile apps", y: 60 }, { label: "Payment integrations", y: 140 }] },
  { cat: "Design", labelY: 198, items: [{ label: "A brand you're proud of", y: 234 }, { label: "Interfaces users love", y: 312 }] },
  { cat: "Grow", labelY: 372, items: [{ label: "SEO & campaigns that convert", y: 408 }, { label: "Content that ranks", y: 480 }] },
];
const rightItems = groups.flatMap((g) => g.items);

const HUB = { x: 500, y: 260, r: 46 };
const L_ANCHOR = 215; // right edge of left cards
const R_ANCHOR = 785; // left edge of right cards

const leftPath = (y: number) =>
  `M ${L_ANCHOR} ${y} C 360 ${y} 415 ${HUB.y} ${HUB.x - HUB.r + 8} ${HUB.y}`;
const rightPath = (y: number) =>
  `M ${HUB.x + HUB.r - 8} ${HUB.y} C 610 ${HUB.y} 640 ${y} ${R_ANCHOR} ${y}`;

export function ConnectedSystem() {
  const reduce = useReducedMotion();

  const drawn = (i: number) =>
    reduce
      ? { initial: false as const, animate: { pathLength: 1, opacity: 1 } }
      : {
          initial: { pathLength: 0, opacity: 0 },
          whileInView: { pathLength: 1, opacity: 1 },
          viewport: { once: true, margin: "-80px" },
          transition: { duration: 1, delay: 0.15 + i * 0.06, ease: EASE },
        };

  const leftPaths = inputs.map((i) => leftPath(i.y));
  const rightPaths = rightItems.map((i) => rightPath(i.y));

  return (
    <section className="bg-white py-24 lg:py-32">
      <Container>
        <SectionHeading
          align="center"
          eyebrow="One team, one system"
          intro="We take an idea, a tired website, or a process still living in spreadsheets, and the same team carries it through to a system that runs."
        />

        {/* Desktop wiring diagram */}
        <div className="mt-16 hidden lg:block">
          <div className="relative mx-auto w-full max-w-5xl aspect-[25/13]">
            <svg
              viewBox={`0 0 ${VB_W} ${VB_H}`}
              className="absolute inset-0 h-full w-full overflow-visible"
              aria-hidden
            >
              {/* wires */}
              {leftPaths.map((d, i) => (
                <motion.path
                  key={`l${i}`}
                  d={d}
                  fill="none"
                  stroke="#0b0e14"
                  strokeOpacity="0.14"
                  strokeWidth={1.5}
                  {...drawn(i)}
                />
              ))}
              {rightPaths.map((d, i) => (
                <motion.path
                  key={`r${i}`}
                  d={d}
                  fill="none"
                  stroke="#0b0e14"
                  strokeOpacity="0.14"
                  strokeWidth={1.5}
                  {...drawn(inputs.length + i)}
                />
              ))}

              {/* anchor dots */}
              {inputs.map((n, i) => (
                <circle key={`la${i}`} cx={L_ANCHOR} cy={n.y} r="3" fill="#cbd0d9" />
              ))}
              {rightItems.map((n, i) => (
                <circle key={`ra${i}`} cx={R_ANCHOR} cy={n.y} r="3" fill="#f97316" />
              ))}

              {/* travelling pulses */}
              {!reduce &&
                leftPaths.map((d, i) => (
                  <circle key={`lp${i}`} r="4" fill="#f97316">
                    <animateMotion
                      dur="3.2s"
                      begin={`${i * 0.5}s`}
                      repeatCount="indefinite"
                      keyPoints="0;1"
                      keyTimes="0;1"
                      calcMode="linear"
                      path={d}
                    />
                    <animate
                      attributeName="opacity"
                      dur="3.2s"
                      begin={`${i * 0.5}s`}
                      repeatCount="indefinite"
                      values="0;1;1;0"
                      keyTimes="0;0.1;0.85;1"
                    />
                  </circle>
                ))}
              {!reduce &&
                rightPaths.map((d, i) => (
                  <circle key={`rp${i}`} r="4" fill="#f97316">
                    <animateMotion
                      dur="3.2s"
                      begin={`${0.4 + i * 0.4}s`}
                      repeatCount="indefinite"
                      keyPoints="0;1"
                      keyTimes="0;1"
                      calcMode="linear"
                      path={d}
                    />
                    <animate
                      attributeName="opacity"
                      dur="3.2s"
                      begin={`${0.4 + i * 0.4}s`}
                      repeatCount="indefinite"
                      values="0;1;1;0"
                      keyTimes="0;0.1;0.85;1"
                    />
                  </circle>
                ))}
            </svg>

            {/* Left inputs (outer wrapper centers on the wire; inner fades in) */}
            {inputs.map((inp, i) => (
              <div
                key={inp.label}
                className="absolute left-0 w-[21.5%]"
                style={{ top: pct(inp.y, VB_H), transform: "translateY(-50%)" }}
              >
                <motion.div
                  initial={reduce ? false : { opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.5, delay: i * 0.06, ease: EASE }}
                  className="border border-ink-900/12 bg-white px-3.5 py-2.5 text-right text-[13px] font-medium leading-tight text-slate-ink"
                >
                  {inp.label}
                </motion.div>
              </div>
            ))}

            {/* Hub (outer wrapper centers; inner scales in) */}
            <div
              className="absolute left-1/2 top-1/2"
              style={{ transform: "translate(-50%, -50%)" }}
            >
              <motion.div
                className="relative flex h-[92px] w-[92px] items-center justify-center rounded-full border border-brand-500/40 bg-ink-950"
                initial={reduce ? false : { opacity: 0, scale: 0.7 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
              >
                <div className="absolute inset-0 rounded-full bg-brand-500/25 blur-xl" aria-hidden />
                <LogoMark size={44} className="relative" />
                {!reduce && (
                  <motion.span
                    className="absolute inset-0 rounded-full border border-brand-500/50"
                    animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
                    aria-hidden
                  />
                )}
                <span className="absolute left-1/2 top-full mt-3 -translate-x-1/2 whitespace-nowrap font-display text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">
                  The Upeo team
                </span>
              </motion.div>
            </div>

            {/* Group labels */}
            {groups.map((g) => (
              <div
                key={g.cat}
                className="absolute right-0 w-[24%] text-left"
                style={{ top: pct(g.labelY, VB_H) }}
              >
                <span className="font-display text-[11px] font-bold uppercase tracking-[0.2em] text-brand-600">
                  {g.cat}
                </span>
              </div>
            ))}

            {/* Right outputs */}
            {rightItems.map((it, i) => (
              <div
                key={it.label}
                className="absolute right-0 w-[21.5%]"
                style={{ top: pct(it.y, VB_H), transform: "translateY(-50%)" }}
              >
                <motion.div
                  initial={reduce ? false : { opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.5, delay: 0.35 + i * 0.06, ease: EASE }}
                  className="border border-ink-900/12 bg-white px-3.5 py-2.5 text-left text-[13px] font-medium leading-tight text-ink-900"
                >
                  {it.label}
                </motion.div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile stacked flow */}
        <div className="mt-14 flex flex-col items-stretch gap-6 lg:hidden">
          <div>
            <p className="mb-3 text-center font-display text-[11px] font-bold uppercase tracking-[0.2em] text-muted">
              You bring
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {inputs.map((inp, i) => (
                <Reveal key={inp.label} delay={stagger(i, 2)}>
                  <div className="border border-ink-900/12 bg-white px-4 py-3 text-sm font-medium text-slate-ink">
                    {inp.label}
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center py-2">
            <div className="h-8 w-px bg-ink-900/15" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-brand-500/40 bg-ink-950">
              <div className="absolute inset-0 rounded-full bg-brand-500/20 blur-lg" aria-hidden />
              <LogoMark size={36} className="relative" />
            </div>
            <span className="mt-2 font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
              The Upeo team
            </span>
            <div className="mt-2 h-8 w-px bg-brand-500/40" />
          </div>

          <div>
            <p className="mb-3 text-center font-display text-[11px] font-bold uppercase tracking-[0.2em] text-brand-600">
              You get
            </p>
            <div className="flex flex-col gap-4">
              {groups.map((g) => (
                <Reveal key={g.cat}>
                  <div>
                    <span className="font-display text-[11px] font-bold uppercase tracking-[0.2em] text-brand-600">
                      {g.cat}
                    </span>
                    <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {g.items.map((it) => (
                        <div
                          key={it.label}
                          className="border border-ink-900/12 bg-white px-4 py-3 text-sm font-medium text-ink-900"
                        >
                          {it.label}
                        </div>
                      ))}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
