"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { company } from "@/lib/content";
import { BUDGET_BANDS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { TurnstileField } from "@/components/security/TurnstileField";

type StageId = "idea" | "prototype" | "live" | "operating";
type Kind = "build" | "brand" | "pay" | "grow" | "scope";
type ShareId = "problem" | "brief" | "note";

type Answers = {
  stage: StageId | "";
  ask: string;
  audience: string;
  surface: string;
  payments: string;
  identity: string;
  designNeed: string;
  rails: string[];
  paymentsHome: string;
  presence: string;
  growthJob: string;
  constraint: string;
  sector: string;
  share: ShareId | "";
  note: string;
  timeline: string;
  budget: string;
  name: string;
  email: string;
  phone: string;
  startup: string;
  role: string;
};

const empty: Answers = {
  stage: "",
  ask: "",
  audience: "",
  surface: "",
  payments: "",
  identity: "",
  designNeed: "",
  rails: [],
  paymentsHome: "",
  presence: "",
  growthJob: "",
  constraint: "",
  sector: "",
  share: "",
  note: "",
  timeline: "",
  budget: "",
  name: "",
  email: "",
  phone: "",
  startup: "",
  role: "",
};

const STAGES: { id: StageId; label: string; hint: string }[] = [
  { id: "idea", label: "An idea, not built yet", hint: "Nothing in the hands of a customer." },
  { id: "prototype", label: "A prototype or MVP", hint: "Something exists, and it is not ready." },
  { id: "live", label: "A product already in the market", hint: "People use it. It needs the next version." },
  { id: "operating", label: "A business, and the product is not the gap", hint: "Brand, customers, or payments." },
];

const ASKS: Record<StageId, { id: string; label: string; kind: Kind }[]> = {
  idea: [
    { id: "first-version", label: "Shape it into a first version", kind: "build" },
    { id: "brand-it", label: "Brand it so it can be shown", kind: "brand" },
    { id: "what-first", label: "Tell us what to build first", kind: "scope" },
  ],
  prototype: [
    { id: "finish", label: "Finish the product", kind: "build" },
    { id: "trust", label: "Make it look like a product people trust", kind: "brand" },
    { id: "add-pay", label: "Add payments", kind: "pay" },
    { id: "find-customers", label: "Prepare it to find customers", kind: "grow" },
  ],
  live: [
    { id: "extend", label: "Rebuild or extend the product", kind: "build" },
    { id: "ops-pay", label: "Payments and day-to-day operations", kind: "pay" },
    { id: "growth", label: "Get found and get customers", kind: "grow" },
  ],
  operating: [
    { id: "site-brand", label: "A brand and a site", kind: "brand" },
    { id: "marketing", label: "Marketing and SEO", kind: "grow" },
    { id: "pay-existing", label: "Payments on what we already run", kind: "pay" },
  ],
};

const TIMELINES = ["Still exploring", "This quarter", "Already late"];
const ROLES = ["Founder", "Co-founder", "First hire, writing for the founder"];
const RAILS = ["M-Pesa", "Airtel Money", "Cards", "Bank transfer", "Not sure yet"];

const SERVICE_FOR_KIND: Record<Kind, string> = {
  build: "Product: web and mobile",
  brand: "Brand and product design",
  pay: "Payments",
  grow: "SEO and marketing",
  scope: "Scoping what to build first",
};

function askOf(a: Answers) {
  if (!a.stage || !a.ask) return null;
  return ASKS[a.stage].find((item) => item.id === a.ask) ?? null;
}

function sharePrompt(stage: StageId | "", share: ShareId) {
  if (share === "problem") {
    return {
      label: "The problem, and who it is for. Leave the method out.",
      help:
        stage === "idea"
          ? "This is enough for us to say if we are the right studio. Do not describe how it works."
          : "Describe the job it does for people. Do not describe how it works.",
      placeholder: "Clinic owners in Mombasa still reconcile payments in a notebook…",
    };
  }
  if (share === "brief") {
    return {
      label: "A short brief. We treat it as confidential.",
      help: "Say what the first version has to do, in plain language. It stays with the people on this conversation.",
      placeholder: "The first version needs staff to record a visit and send the receipt by M-Pesa…",
    };
  }
  return {
    label: "A confidentiality note before any detail.",
    help: "The first reply is that note. We will not ask for the mechanism before you have it. A sector is enough here.",
    placeholder: "Clinics. I will share the detail after the note.",
  };
}

function detailReady(a: Answers) {
  const ask = askOf(a);
  if (!ask) return false;
  if (ask.kind === "build") return Boolean(a.audience && a.surface && a.payments);
  if (ask.kind === "brand") return Boolean(a.identity && a.designNeed);
  if (ask.kind === "pay") return a.rails.length > 0 && Boolean(a.paymentsHome);
  if (ask.kind === "grow") return Boolean(a.presence && a.growthJob);
  return Boolean(a.constraint && a.sector.trim().length >= 2);
}

function shareReady(a: Answers) {
  if (!a.share) return false;
  const min = a.share === "note" ? 8 : 20;
  return a.note.trim().length >= min;
}

function linesFor(a: Answers) {
  const stage = STAGES.find((s) => s.id === a.stage);
  const ask = askOf(a);
  const lines: string[] = [];
  if (stage && ask) {
    lines.push(`${stage.label}. They want us to ${ask.label.charAt(0).toLowerCase()}${ask.label.slice(1)}.`);
  }
  if (ask?.kind === "build") {
    lines.push(`Who uses it: ${a.audience}. It should live on ${a.surface.toLowerCase()}. Payments: ${a.payments.toLowerCase()}.`);
  }
  if (ask?.kind === "brand") {
    lines.push(`What exists: ${a.identity.toLowerCase()}. What they need: ${a.designNeed.toLowerCase()}.`);
  }
  if (ask?.kind === "pay") {
    lines.push(`Rails: ${a.rails.join(", ")}. It sits in ${a.paymentsHome.toLowerCase()}.`);
  }
  if (ask?.kind === "grow") {
    lines.push(`What people can find today: ${a.presence.toLowerCase()}. The job: ${a.growthJob.toLowerCase()}.`);
  }
  if (ask?.kind === "scope") {
    lines.push(`Constraint: ${a.constraint.toLowerCase()}. Sector: ${a.sector.trim()}.`);
  }
  if (a.share === "problem") lines.push("Sharing: the problem only. Do not ask for the mechanism.");
  if (a.share === "brief") lines.push("Sharing: a short brief, to be treated as confidential.");
  if (a.share === "note") lines.push("Sharing: send a confidentiality note before asking for any detail.");
  if (a.timeline || a.budget) lines.push(`Timing: ${a.timeline || "—"}. Budget: ${a.budget || "—"}.`);
  if (a.role) lines.push(`Role: ${a.role}.`);
  if (a.note.trim()) {
    lines.push("");
    lines.push(a.note.trim());
  }
  return lines;
}

const STEP_TITLES = [
  "Where is the company?",
  "What do you want from us?",
  "The practical part",
  "How much of the idea are you willing to share?",
  "Timing and budget",
  "Who should we reply to?",
  "Check this before it is sent",
];

export function IdeaWizard() {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const baseId = useId();
  const [step, setStep] = useState(0);
  const [a, setA] = useState<Answers>(empty);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [captcha, setCaptcha] = useState("");
  const [captchaReset, setCaptchaReset] = useState(0);

  useEffect(() => {
    headingRef.current?.focus();
  }, [step, sent]);

  function patch(partial: Partial<Answers>) {
    setA((prev) => ({ ...prev, ...partial }));
    setError(null);
  }

  function chooseStage(id: StageId) {
    patch({
      stage: id,
      ask: "",
      audience: "",
      surface: "",
      payments: "",
      identity: "",
      designNeed: "",
      rails: [],
      paymentsHome: "",
      presence: "",
      growthJob: "",
      constraint: "",
      sector: "",
    });
  }

  function chooseAsk(id: string) {
    patch({
      ask: id,
      audience: "",
      surface: "",
      payments: "",
      identity: "",
      designNeed: "",
      rails: [],
      paymentsHome: "",
      presence: "",
      growthJob: "",
      constraint: "",
      sector: "",
    });
  }

  function toggleRail(rail: string) {
    setA((prev) => {
      if (rail === "Not sure yet") return { ...prev, rails: ["Not sure yet"] };
      const without = prev.rails.filter((item) => item !== "Not sure yet" && item !== rail);
      const rails = prev.rails.includes(rail) ? without : [...without, rail];
      return { ...prev, rails };
    });
    setError(null);
  }

  function validate(index: number) {
    if (index === 0 && !a.stage) return "Choose where the company is.";
    if (index === 1 && !a.ask) return "Choose what you want from the studio.";
    if (index === 2 && !detailReady(a)) return "Answer the questions for this path. They decide how we reply.";
    if (index === 3 && !shareReady(a)) {
      return a.share === "note"
        ? "A sector, or one sentence, is enough before the note."
        : "Add a little more, at least a sentence. Leave the method out if you chose the problem only.";
    }
    if (index === 4 && (!a.timeline || !a.budget)) return "Choose a timing and a budget band. “Not sure yet” is a valid budget.";
    if (index === 5) {
      if (!a.name.trim()) return "Add your name.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.email)) return "Add an email we can reply to.";
      if (!a.startup.trim()) return "Add the startup or project name. “Not named yet” is fine.";
      if (!a.role) return "Choose your role.";
    }
    return null;
  }

  function next() {
    const problem = validate(step);
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    setStep((value) => Math.min(value + 1, 6));
  }

  async function submit() {
    if (!captcha) {
      setError("Complete the verification check before sending.");
      return;
    }
    const ask = askOf(a);
    if (!a.stage || !ask) return;
    setSending(true);
    setError(null);
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "inquiry",
        name: a.name.trim(),
        email: a.email.trim(),
        phone: a.phone.trim(),
        company: a.startup.trim(),
        services: [SERVICE_FOR_KIND[ask.kind]],
        stage: STAGES.find((item) => item.id === a.stage)?.label,
        timeline: a.timeline,
        budget: a.budget,
        message: ["Founders Zone", ...linesFor(a)].join("\n"),
        turnstileToken: captcha,
      }),
    });
    setSending(false);
    if (!res.ok) {
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      setCaptcha("");
      setCaptchaReset((n) => n + 1);
      setError(json.error || "Could not send. Try again, or email us.");
      return;
    }
    setSent(true);
  }

  const ask = askOf(a);
  const prompt = a.share ? sharePrompt(a.stage, a.share) : null;
  const detailTitle =
    ask?.kind === "build"
      ? "So we scope the product, not a generic brief."
      : ask?.kind === "brand"
        ? "So we know what already exists."
        : ask?.kind === "pay"
          ? "So we know which rails, and where they sit."
          : ask?.kind === "grow"
            ? "So we know what customers can already find."
            : ask?.kind === "scope"
              ? "So the first conversation starts from the constraint."
              : STEP_TITLES[2];

  const title = step === 2 ? detailTitle : STEP_TITLES[step];

  if (sent) {
    const follow =
      a.share === "note"
        ? "The first reply is the confidentiality note. We will not ask for the mechanism before that."
        : a.share === "brief"
          ? "We will reply to the brief. It stays with the people on this conversation."
          : "We will reply about the problem. We will not ask you to reveal the method.";
    return (
      <div className="border border-line bg-white p-8 sm:p-10" role="status">
        <span className="inline-flex h-12 w-12 items-center justify-center bg-brand-50 text-brand-600">
          <CheckCircle2 className="h-6 w-6" aria-hidden />
        </span>
        <h3 ref={headingRef} tabIndex={-1} className="mt-5 font-display text-2xl font-semibold text-ink-900 outline-none">
          It is with the studio.
        </h3>
        <p className="mt-3 max-w-xl text-lg leading-relaxed text-body">{follow}</p>
        <p className="mt-3 text-lg leading-relaxed text-body">
          We usually reply within one business day. You can also write to{" "}
          <a href={`mailto:${company.email}`} className="font-medium text-brand-600 underline underline-offset-4">
            {company.email}
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="border border-line bg-white">
      <div className="border-b border-line px-6 py-4 sm:px-8">
        <p className="text-sm font-medium text-ink-900">
          <span className="text-brand-600">Step {step + 1}</span>
          <span className="text-muted"> / 7</span>
          <span className="sr-only">. {title}</span>
        </p>
        <div className="mt-3 h-1 bg-surface-3" aria-hidden>
          <div className="h-full bg-brand-500 transition-[width] duration-300" style={{ width: `${((step + 1) / 7) * 100}%` }} />
        </div>
      </div>

      <div className="px-6 py-8 sm:px-8">
        <h3 ref={headingRef} tabIndex={-1} className="font-display text-2xl font-semibold text-ink-900 outline-none">
          {title}
        </h3>

        {step === 0 && (
          <ChoiceList
            name={`${baseId}-stage`}
            options={STAGES.map((item) => ({ id: item.id, label: item.label, hint: item.hint }))}
            value={a.stage}
            onChange={(id) => chooseStage(id as StageId)}
          />
        )}

        {step === 1 && a.stage && (
          <ChoiceList
            name={`${baseId}-ask`}
            options={ASKS[a.stage].map((item) => ({ id: item.id, label: item.label }))}
            value={a.ask}
            onChange={chooseAsk}
          />
        )}

        {step === 2 && ask?.kind === "build" && (
          <div className="mt-8 space-y-8">
            <ChoiceList
              legend="Who uses it?"
              name={`${baseId}-audience`}
              options={["Customers", "Other businesses", "Our own staff"].map((label) => ({ id: label, label }))}
              value={a.audience}
              onChange={(id) => patch({ audience: id })}
            />
            <ChoiceList
              legend="Where should it live?"
              name={`${baseId}-surface`}
              options={["A website or web app", "Android and iOS", "Web and mobile"].map((label) => ({ id: label, label }))}
              value={a.surface}
              onChange={(id) => patch({ surface: id })}
            />
            <ChoiceList
              legend="Payments in the first version?"
              name={`${baseId}-payments`}
              options={["In the first version", "After the first version", "Not part of this"].map((label) => ({ id: label, label }))}
              value={a.payments}
              onChange={(id) => patch({ payments: id })}
            />
          </div>
        )}

        {step === 2 && ask?.kind === "brand" && (
          <div className="mt-8 space-y-8">
            <ChoiceList
              legend="What exists today?"
              name={`${baseId}-identity`}
              options={["Nothing public yet", "A name", "A logo and colours"].map((label) => ({ id: label, label }))}
              value={a.identity}
              onChange={(id) => patch({ identity: id })}
            />
            <ChoiceList
              legend="What do you need?"
              name={`${baseId}-design`}
              options={["The identity", "The product screens", "Both"].map((label) => ({ id: label, label }))}
              value={a.designNeed}
              onChange={(id) => patch({ designNeed: id })}
            />
          </div>
        )}

        {step === 2 && ask?.kind === "pay" && (
          <div className="mt-8 space-y-8">
            <ChoiceList
              legend="Which rails?"
              name={`${baseId}-rails`}
              multiple
              options={RAILS.map((label) => ({ id: label, label }))}
              values={a.rails}
              onToggle={toggleRail}
            />
            <ChoiceList
              legend="Where do they sit?"
              name={`${baseId}-home`}
              options={["A product still to be built", "A product already running", "A website checkout"].map((label) => ({
                id: label,
                label,
              }))}
              value={a.paymentsHome}
              onChange={(id) => patch({ paymentsHome: id })}
            />
          </div>
        )}

        {step === 2 && ask?.kind === "grow" && (
          <div className="mt-8 space-y-8">
            <ChoiceList
              legend="What can people find today?"
              name={`${baseId}-presence`}
              options={["A website", "An app", "Neither yet"].map((label) => ({ id: label, label }))}
              value={a.presence}
              onChange={(id) => patch({ presence: id })}
            />
            <ChoiceList
              legend="What is the job?"
              name={`${baseId}-job`}
              options={["Be found", "Turn attention into enquiries", "Both"].map((label) => ({ id: label, label }))}
              value={a.growthJob}
              onChange={(id) => patch({ growthJob: id })}
            />
          </div>
        )}

        {step === 2 && ask?.kind === "scope" && (
          <div className="mt-8 space-y-8">
            <ChoiceList
              legend="What is tightest?"
              name={`${baseId}-constraint`}
              options={[
                "It has to move this quarter",
                "The budget is the limit",
                "We do not know which piece matters",
              ].map((label) => ({ id: label, label }))}
              value={a.constraint}
              onChange={(id) => patch({ constraint: id })}
            />
            <label className="block" htmlFor={`${baseId}-sector`}>
              <span className="text-sm font-semibold text-ink-900">Sector, in a few words</span>
              <input
                id={`${baseId}-sector`}
                value={a.sector}
                onChange={(event) => patch({ sector: event.target.value })}
                placeholder="Clinics, retail, logistics…"
                className={inputClass}
              />
            </label>
          </div>
        )}

        {step === 3 && (
          <div className="mt-8 space-y-8">
            <ChoiceList
              name={`${baseId}-share`}
              options={[
                {
                  id: "problem",
                  label: "The problem only",
                  hint: "Who it is for, and what is hard. Not the method.",
                },
                {
                  id: "brief",
                  label: "A short brief, kept confidential",
                  hint: "What the first version has to do.",
                },
                {
                  id: "note",
                  label: "A confidentiality note first",
                  hint: "We send that before we ask for anything more.",
                },
              ]}
              value={a.share}
              onChange={(id) => patch({ share: id as ShareId })}
            />
            {prompt && (
              <label className="block" htmlFor={`${baseId}-note`}>
                <span className="text-sm font-semibold text-ink-900">{prompt.label}</span>
                <span className="mt-1 block text-sm leading-relaxed text-body">{prompt.help}</span>
                <textarea
                  id={`${baseId}-note`}
                  value={a.note}
                  onChange={(event) => patch({ note: event.target.value })}
                  placeholder={prompt.placeholder}
                  rows={5}
                  className={cn(inputClass, "mt-3 resize-y")}
                />
              </label>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="mt-8 space-y-8">
            <ChoiceList
              legend="When does this need to move?"
              name={`${baseId}-when`}
              options={TIMELINES.map((label) => ({ id: label, label }))}
              value={a.timeline}
              onChange={(id) => patch({ timeline: id })}
            />
            <ChoiceList
              legend="What budget band is honest?"
              name={`${baseId}-budget`}
              options={BUDGET_BANDS.map((label) => ({ id: label, label }))}
              value={a.budget}
              onChange={(id) => patch({ budget: id })}
            />
          </div>
        )}

        {step === 5 && (
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <Field id={`${baseId}-name`} label="Your name" value={a.name} autoComplete="name" onChange={(name) => patch({ name })} />
            <Field id={`${baseId}-email`} label="Email" type="email" value={a.email} autoComplete="email" onChange={(email) => patch({ email })} />
            <Field id={`${baseId}-phone`} label="Phone or WhatsApp" type="tel" value={a.phone} autoComplete="tel" onChange={(phone) => patch({ phone })} optional />
            <Field
              id={`${baseId}-startup`}
              label="Startup or project"
              value={a.startup}
              autoComplete="organization"
              onChange={(startup) => patch({ startup })}
            />
            <div className="sm:col-span-2">
              <ChoiceList
                legend="Your role"
                name={`${baseId}-role`}
                options={ROLES.map((label) => ({ id: label, label }))}
                value={a.role}
                onChange={(id) => patch({ role: id })}
              />
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="mt-8">
            <div className="border border-line bg-surface-2 p-5">
              {linesFor(a).map((line, index) =>
                line ? (
                  <p key={index} className="text-[15px] leading-relaxed text-ink-900">
                    {line}
                  </p>
                ) : (
                  <div key={index} className="h-3" />
                ),
              )}
            </div>
            <p className="mt-4 text-sm leading-relaxed text-body">
              This is what the studio receives. Go back if a line is wrong. Nothing else is attached.
            </p>
            <div className="mt-6">
              <TurnstileField action="inquiry" onToken={setCaptcha} resetSignal={captchaReset} />
            </div>
          </div>
        )}

        {error && (
          <p className="mt-6 text-sm font-medium text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-line px-6 py-4 sm:px-8">
        <button
          type="button"
          onClick={() => {
            setError(null);
            setStep((value) => Math.max(value - 1, 0));
          }}
          disabled={step === 0}
          className="inline-flex h-11 cursor-pointer items-center gap-2 px-3 text-sm font-medium text-ink-900 disabled:cursor-not-allowed disabled:text-muted"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back
        </button>
        {step < 6 ? (
          <button
            type="button"
            onClick={next}
            className="inline-flex h-11 cursor-pointer items-center gap-2 bg-brand-500 px-5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-brand-600"
          >
            Continue
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={sending}
            className="inline-flex h-11 cursor-pointer items-center gap-2 bg-ink-900 px-5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-brand-500 disabled:opacity-60"
          >
            {sending ? "Sending…" : "Send this"}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        )}
      </div>
    </div>
  );
}

const inputClass =
  "mt-2 w-full border border-line bg-white px-4 py-3 text-[15px] text-ink-900 placeholder:text-muted transition-[border-color,box-shadow] duration-300 hover:border-brand-200 focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-500/15";

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
  optional,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
  optional?: boolean;
}) {
  return (
    <label className="block" htmlFor={id}>
      <span className="text-sm font-semibold text-ink-900">
        {label}
        {optional ? <span className="font-normal text-muted"> · optional</span> : null}
      </span>
      <input id={id} type={type} autoComplete={autoComplete} value={value} onChange={(event) => onChange(event.target.value)} className={inputClass} />
    </label>
  );
}

function ChoiceList({
  legend,
  name,
  options,
  value,
  values,
  multiple,
  onChange,
  onToggle,
}: {
  legend?: string;
  name: string;
  options: { id: string; label: string; hint?: string }[];
  value?: string;
  values?: string[];
  multiple?: boolean;
  onChange?: (id: string) => void;
  onToggle?: (id: string) => void;
}) {
  return (
    <fieldset className={legend ? "" : "mt-8"}>
      {legend ? <legend className="text-sm font-semibold text-ink-900">{legend}</legend> : null}
      <div className={cn("grid gap-3", legend && "mt-3")}>
        {options.map((option) => {
          const selected = multiple ? values?.includes(option.id) : value === option.id;
          return (
            <button
              key={option.id}
              type="button"
              name={name}
              aria-pressed={selected}
              onClick={() => (multiple ? onToggle?.(option.id) : onChange?.(option.id))}
              className={cn(
                "flex min-h-11 cursor-pointer flex-col items-start border px-4 py-3 text-left transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                selected ? "border-brand-500 bg-brand-50" : "border-line bg-white hover:border-brand-200",
              )}
            >
              <span className="text-sm font-semibold text-ink-900">{option.label}</span>
              {option.hint ? <span className="mt-1 text-sm leading-relaxed text-body">{option.hint}</span> : null}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
