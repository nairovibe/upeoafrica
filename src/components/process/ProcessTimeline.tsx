"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";

export type ProcessStep = { n: string; title: string; body: string };

export function ProcessTimeline({ steps }: { steps: ProcessStep[] }) {
  const listRef = useRef<HTMLOListElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ["start 75%", "end 55%"],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 80, damping: 24, restDelta: 0.001 });

  return (
    <ol ref={listRef} className="relative mt-16">
      <div className="pointer-events-none absolute bottom-6 left-5 top-5 w-px -translate-x-1/2 bg-[#d5dee6] sm:left-7" aria-hidden />
      <motion.div
        style={{ scaleY: reduce ? 1 : progress }}
        className="pointer-events-none absolute bottom-6 left-5 top-5 w-px origin-top -translate-x-1/2 bg-brand-500 sm:left-7"
        aria-hidden
      />

      {steps.map((step, index) => (
        <li key={step.n} className="relative grid grid-cols-[2.5rem_minmax(0,1fr)] gap-4 pb-6 last:pb-0 sm:grid-cols-[3.5rem_minmax(0,1fr)] sm:gap-8 sm:pb-8">
          <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border border-brand-200 bg-white font-display text-sm font-bold text-brand-600 shadow-[0_0_0_6px_#edf3f8] sm:h-14 sm:w-14 sm:text-base">
            {step.n}
          </div>
          <motion.article
            initial={reduce ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-12% 0px -12% 0px" }}
            transition={{ duration: 0.45, delay: reduce ? 0 : 0.04, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-2xl border border-white bg-white px-6 py-6 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.45)] sm:px-8 sm:py-7"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">
              Stage {index + 1} of {steps.length}
            </p>
            <h3 className="mt-2 text-xl font-semibold text-ink-900">{step.title}</h3>
            <p className="mt-3 max-w-3xl text-lg leading-relaxed text-body">
              {step.body}
              {step.n === "02" && (
                <>
                  {" "}
                  Founders who prefer to start here can use the{" "}
                  <Link href="/founders#share" className="font-medium text-brand-600 hover:underline">
                    Founder Zone
                  </Link>
                  .
                </>
              )}
            </p>
          </motion.article>
        </li>
      ))}
    </ol>
  );
}
