"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X, ArrowRight, ArrowLeft, Check, Sparkles, PartyPopper } from "lucide-react";
import { company } from "@/lib/content";
import { BUDGET_BANDS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { TurnstileField } from "@/components/security/TurnstileField";
import { answer, captureLeadContext, leadContext } from "@/lib/lead-context";

export const OPEN_INQUIRY_EVENT = "open-inquiry";

type Answers = {
  services: string[];
  stage: string;
  timeline: string;
  budget: string;
  name: string;
  email: string;
  phone: string;
  companyName: string;
};

const empty: Answers = {
  services: [],
  stage: "",
  timeline: "",
  budget: "",
  name: "",
  email: "",
  phone: "",
  companyName: "",
};

const Q = {
  services: "What can we help you with?",
  stage: "Where are you starting from?",
  timeline: "What's your ideal timeline?",
  budget: "A rough budget range?",
  name: "Full name",
  email: "Email",
  phone: "Phone / WhatsApp",
  company: "Company",
};

const SERVICES = [
  "Website", "Web app", "Mobile app", "Branding", "UI/UX design",
  "Digital marketing", "SEO", "E-commerce", "Payments (M-Pesa)", "Not sure yet",
];
const STAGES = [
  "Just an idea", "I have a brief or designs", "Improving an existing product", "A rebrand or refresh",
];
const TIMELINES = ["As soon as possible", "1-3 months", "3-6 months", "Flexible / exploring"];
const BUDGETS = [...BUDGET_BANDS, "Let's discuss"];

const STEP_LABELS = ["Warming up", "Getting specific", "Timing", "Investment", "Final stretch"];
const TOTAL = 5;

export function InquiryModal() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0); // 0..4 steps, 5 = success
  const [dir, setDir] = useState(1);
  const [a, setA] = useState<Answers>(empty);
  const [err, setErr] = useState<string | null>(null);
  const [captcha, setCaptcha] = useState("");
  const [captchaReset, setCaptchaReset] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    captureLeadContext();
  }, []);

  useEffect(() => {
    const onOpen = () => {
      setA(empty);
      setStep(0);
      setErr(null);
      setOpen(true);
      setCaptcha("");
      setCaptchaReset((n) => n + 1);
    };
    window.addEventListener(OPEN_INQUIRY_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_INQUIRY_EVENT, onOpen);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const go = (d: number) => {
    setErr(null);
    setDir(d);
    setStep((s) => Math.min(Math.max(s + d, 0), TOTAL));
  };

  const pickSingle = (key: keyof Answers, value: string) => {
    setA((p) => ({ ...p, [key]: value }));
    setTimeout(() => go(1), reduce ? 0 : 240);
  };

  const toggleService = (s: string) =>
    setA((p) => ({
      ...p,
      services: p.services.includes(s)
        ? p.services.filter((x) => x !== s)
        : [...p.services, s],
    }));

  const submit = async () => {
    if (!a.name.trim()) return setErr("Please add your name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.email)) return setErr("Add a valid email.");
    if (!captcha) return setErr("Complete the verification check before sending.");
    setErr(null);
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "inquiry",
        name: a.name,
        email: a.email,
        phone: a.phone,
        company: a.companyName,
        services: a.services,
        stage: a.stage,
        timeline: a.timeline,
        budget: a.budget,
        details: {
          form: "Project wizard",
          answers: [
            answer(Q.services, a.services),
            answer(Q.stage, a.stage),
            answer(Q.timeline, a.timeline),
            answer(Q.budget, a.budget || "Skipped"),
            answer(Q.name, a.name),
            answer(Q.email, a.email),
            answer(Q.phone, a.phone),
            answer(Q.company, a.companyName),
          ],
        },
        ...leadContext(),
        turnstileToken: captcha,
      }),
    });
    if (!res.ok) {
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      setCaptcha("");
      setCaptchaReset((n) => n + 1);
      return setErr(json.error || "Could not send. Try again, or email us.");
    }
    setDir(1);
    setStep(TOTAL);
  };

  const progress = Math.round((Math.min(step, TOTAL) / TOTAL) * 100);
  const canNext =
    step === 0
      ? a.services.length > 0
      : step === 1
        ? Boolean(a.stage)
        : step === 2
          ? Boolean(a.timeline)
          : true;

  const slideVariants = {
    enter: (d: number) => ({ opacity: 0, x: reduce ? 0 : d * 40 }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, x: reduce ? 0 : d * -40 }),
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div
            className="absolute inset-0 bg-ink-950/80 backdrop-blur-md"
            onClick={() => setOpen(false)}
            aria-hidden
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Start a project"
            className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden border border-line bg-white shadow-2xl"
            initial={{ y: reduce ? 0 : 30, opacity: 0, scale: reduce ? 1 : 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: reduce ? 0 : 20, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Header / progress */}
            <div className="flex items-center justify-between border-b border-line px-6 py-4 sm:px-8">
              <div className="flex items-center gap-2 text-sm font-medium text-ink-900">
                <Sparkles className="h-4 w-4 text-brand-500" />
                {step < TOTAL ? (
                  <span>
                    <span className="text-brand-600">Step {step + 1}</span>
                    <span className="text-muted"> / {TOTAL}</span>
                    <span className="ml-2 hidden text-muted sm:inline">
                      · {STEP_LABELS[step]}
                    </span>
                  </span>
                ) : (
                  <span className="text-brand-600">All done</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="inline-flex h-9 w-9 cursor-pointer items-center justify-center text-muted transition-colors duration-300 ease-out-expo hover:bg-surface-3 hover:text-ink-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="h-1 w-full bg-surface-3">
              <motion.div
                className="h-full bg-brand-500"
                animate={{ width: `${step < TOTAL ? progress : 100}%` }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-8 sm:px-10 sm:py-10">
              <motion.div
                  key={step}
                  custom={dir}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  {step === 0 && (
                    <Step
                      title={Q.services}
                      hint="Pick all that apply. This shapes who from our team joins the call."
                    >
                      <div className="flex flex-wrap gap-2.5">
                        {SERVICES.map((s) => {
                          const on = a.services.includes(s);
                          return (
                            <button
                              key={s}
                              type="button"
                              onClick={() => toggleService(s)}
                              className={cn(
                                "inline-flex cursor-pointer items-center gap-2 border px-4 py-2.5 text-sm font-medium transition-[color,background-color,border-color,box-shadow,transform] duration-300 ease-out-expo active:duration-100",
                                on
                                  ? "border-brand-500 bg-brand-500 text-white shadow-[0_10px_24px_-14px_rgba(249,115,22,0.9)]"
                                  : "border-line bg-white text-slate-ink hover:-translate-y-0.5 hover:border-brand-300 hover:text-brand-600",
                              )}
                            >
                              {on && <Check className="h-4 w-4" />}
                              {s}
                            </button>
                          );
                        })}
                      </div>
                      {a.services.length > 0 && (
                        <p className="mt-5 text-sm font-medium text-brand-600">
                          Great fit. We do all of this in-house.
                        </p>
                      )}
                    </Step>
                  )}

                  {step === 1 && (
                    <Step title={Q.stage}>
                      <Options
                        options={STAGES}
                        value={a.stage}
                        onPick={(v) => pickSingle("stage", v)}
                      />
                    </Step>
                  )}

                  {step === 2 && (
                    <Step title={Q.timeline}>
                      <Options
                        options={TIMELINES}
                        value={a.timeline}
                        onPick={(v) => pickSingle("timeline", v)}
                      />
                    </Step>
                  )}

                  {step === 3 && (
                    <Step
                      title={Q.budget}
                      hint="Optional. It helps us tailor the right proposal. You can skip this."
                    >
                      <Options
                        options={BUDGETS}
                        value={a.budget}
                        onPick={(v) => pickSingle("budget", v)}
                      />
                    </Step>
                  )}

                  {step === 4 && (
                    <Step title="Last step. Where do we send the plan?">
                      <div className="flex flex-col gap-4">
                        <Field label={Q.name} required>
                          <input
                            value={a.name}
                            onChange={(e) => setA((p) => ({ ...p, name: e.target.value }))}
                            className="w-full border border-line bg-white px-4 py-3 text-[15px] text-ink-900 outline-none transition-colors focus:border-brand-400 focus:ring-4 focus:ring-brand-500/15"
                            placeholder="Amina Hassan"
                          />
                        </Field>
                        <Field label={Q.email} required>
                          <input
                            type="email"
                            value={a.email}
                            onChange={(e) => setA((p) => ({ ...p, email: e.target.value }))}
                            className="w-full border border-line bg-white px-4 py-3 text-[15px] text-ink-900 outline-none transition-colors focus:border-brand-400 focus:ring-4 focus:ring-brand-500/15"
                            placeholder="you@company.com"
                          />
                        </Field>
                        <Field label={Q.phone}>
                          <input
                            type="tel"
                            autoComplete="tel"
                            value={a.phone}
                            onChange={(e) => setA((p) => ({ ...p, phone: e.target.value }))}
                            className="w-full border border-line bg-white px-4 py-3 text-[15px] text-ink-900 outline-none transition-colors focus:border-brand-400 focus:ring-4 focus:ring-brand-500/15"
                            placeholder="+254 …"
                          />
                        </Field>
                        <Field label={Q.company}>
                          <input
                            value={a.companyName}
                            onChange={(e) =>
                              setA((p) => ({ ...p, companyName: e.target.value }))
                            }
                            className="w-full border border-line bg-white px-4 py-3 text-[15px] text-ink-900 outline-none transition-colors focus:border-brand-400 focus:ring-4 focus:ring-brand-500/15"
                            placeholder="Your organisation"
                          />
                        </Field>
                        <TurnstileField
                          action="inquiry"
                          theme="light"
                          onToken={setCaptcha}
                          resetSignal={captchaReset}
                        />
                        {err && (
                          <p className="text-sm font-medium text-red-500" role="alert">
                            {err}
                          </p>
                        )}
                      </div>
                    </Step>
                  )}

                  {step === TOTAL && (
                    <div className="py-4 text-center">
                      <span className="mx-auto flex h-16 w-16 items-center justify-center bg-brand-500 text-white">
                        <PartyPopper className="h-8 w-8" />
                      </span>
                      <h3 className="mt-6 font-display text-2xl font-bold text-ink-900">
                        You&apos;re all set, {a.name.split(" ")[0] || "friend"}!
                      </h3>
                      <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-body">
                        We have your brief. Someone on the team will write back within one business day.
                        You can also reach us directly at{" "}
                        <a
                          href={`mailto:${company.email}`}
                          className="font-medium text-brand-600 underline decoration-transparent underline-offset-4 transition-[text-decoration-color] duration-300 ease-out-expo hover:decoration-brand-500"
                        >
                          {company.email}
                        </a>
                        .
                      </p>
                      <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="mt-8 inline-flex cursor-pointer items-center justify-center gap-2 bg-ink-950 px-6 py-3 text-sm font-medium text-white transition-[background-color,box-shadow,transform] duration-300 ease-out-expo hover:-translate-y-0.5 hover:bg-brand-500 hover:shadow-[0_14px_34px_-12px_rgba(249,115,22,0.8)] active:translate-y-0 active:duration-100"
                      >
                        Done
                        <Check className="h-4 w-4" aria-hidden />
                      </button>
                    </div>
                  )}
                </motion.div>
            </div>

            {/* Footer nav */}
            {step < TOTAL && (
              <div className="flex items-center justify-between border-t border-line px-6 py-4 sm:px-10">
                <button
                  type="button"
                  onClick={() => go(-1)}
                  disabled={step === 0}
                  className="group inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-muted transition-colors duration-300 ease-out-expo hover:text-ink-900 disabled:pointer-events-none disabled:opacity-0"
                >
                  <ArrowLeft
                    className="h-4 w-4 transition-transform duration-300 ease-out-expo group-hover:-translate-x-0.5"
                    aria-hidden
                  />{" "}
                  Back
                </button>

                {step === 3 ? (
                  <button
                    type="button"
                    onClick={() => go(1)}
                    className="inline-flex cursor-pointer items-center gap-2 border border-ink-900 px-5 py-2.5 text-sm font-medium text-ink-900 transition-[color,border-color,background-color] duration-300 ease-out-expo hover:border-brand-500 hover:bg-brand-500 hover:text-white"
                  >
                    Skip
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </button>
                ) : step === 4 ? (
                  <button
                    type="button"
                    onClick={submit}
                    className="group inline-flex cursor-pointer items-center gap-2 bg-brand-500 px-6 py-3 text-sm font-medium text-white transition-[background-color,box-shadow,transform] duration-300 ease-out-expo hover:-translate-y-0.5 hover:bg-brand-600 hover:shadow-[0_14px_34px_-12px_rgba(249,115,22,0.85)] active:translate-y-0 active:duration-100"
                  >
                    Send &amp; book my call
                    <ArrowRight
                      className="h-4 w-4 transition-transform duration-300 ease-out-expo group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => go(1)}
                    disabled={!canNext}
                    className="group inline-flex cursor-pointer items-center gap-2 bg-brand-500 px-6 py-3 text-sm font-medium text-white transition-[background-color,box-shadow,transform] duration-300 ease-out-expo hover:-translate-y-0.5 hover:bg-brand-600 hover:shadow-[0_14px_34px_-12px_rgba(249,115,22,0.85)] active:translate-y-0 active:duration-100 disabled:pointer-events-none disabled:opacity-40"
                  >
                    Continue
                    <ArrowRight
                      className="h-4 w-4 transition-transform duration-300 ease-out-expo group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Step({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="font-display text-2xl font-bold leading-tight text-ink-900 sm:text-[1.7rem]">
        {title}
      </h3>
      {hint && <p className="mt-2 text-sm text-muted">{hint}</p>}
      <div className="mt-7">{children}</div>
    </div>
  );
}

function Options({
  options,
  value,
  onPick,
}: {
  options: string[];
  value: string;
  onPick: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      {options.map((o) => {
        const on = value === o;
        return (
          <button
            key={o}
            type="button"
            onClick={() => onPick(o)}
            className={cn(
              "group flex cursor-pointer items-center justify-between border px-5 py-4 text-left text-[15px] font-medium transition-[color,background-color,border-color,box-shadow] duration-300 ease-out-expo",
              on
                ? "border-brand-500 bg-brand-500 text-white shadow-[0_12px_28px_-16px_rgba(249,115,22,0.9)]"
                : "border-line bg-white text-slate-ink hover:border-brand-300 hover:bg-brand-50/60",
            )}
          >
            {o}
            <span
              className={cn(
                "flex h-5 w-5 items-center justify-center border transition-[color,background-color,border-color] duration-300 ease-out-expo",
                on ? "border-white bg-white/20" : "border-ink-900/20 group-hover:border-brand-400 group-hover:bg-brand-50",
              )}
            >
              {on && <Check className="h-3.5 w-3.5" />}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-ink">
        {label}
        {required && <span className="ml-0.5 text-brand-500">*</span>}
      </span>
      {children}
    </label>
  );
}
