"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { goToThanks } from "@/lib/thanks";
import { Button } from "@/components/ui/Button";
import { services } from "@/lib/content";
import { BUDGET_BANDS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { TurnstileField } from "@/components/security/TurnstileField";
import { answer, leadContext } from "@/lib/lead-context";

const Q = {
  name: "Full name",
  email: "Email",
  phone: "Phone / WhatsApp",
  company: "Company",
  service: "Service of interest",
  serviceOther: "What do you need?",
  budget: "Rough budget",
  message: "How can we help?",
};

const NO_BUDGET = "Prefer not to say";

type Fields = {
  name: string;
  email: string;
  phone: string;
  company: string;
  service: string;
  /** Free text shown only when the service is "Other". */
  serviceOther: string;
  budget: string;
  message: string;
};

const empty: Fields = {
  name: "",
  email: "",
  phone: "",
  company: "",
  service: "",
  serviceOther: "",
  budget: "",
  message: "",
};

const OTHER = "Other";

const budgets = [...BUDGET_BANDS];

export function ContactForm() {
  const [values, setValues] = useState<Fields>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({});
  const [sending, setSending] = useState(false);
  const [captcha, setCaptcha] = useState("");
  const [captchaReset, setCaptchaReset] = useState(0);

  const isOther = values.service === OTHER;

  function validate(v: Fields) {
    const e: Partial<Record<keyof Fields, string>> = {};
    if (!v.name.trim()) e.name = "Please tell us your name.";
    if (!v.email.trim()) e.email = "We need an email to reply to.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email))
      e.email = "That doesn't look like a valid email.";
    if (v.service === OTHER && !v.serviceOther.trim())
      e.serviceOther = "Tell us briefly what you need.";
    if (!v.message.trim() || v.message.trim().length < 10)
      e.message = "A little more detail helps us help you.";
    return e;
  }

  function set<K extends keyof Fields>(key: K, val: string) {
    setValues((p) => ({ ...p, [key]: val }));
    if (errors[key]) setErrors((p) => ({ ...p, [key]: undefined }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const eObj = validate(values);
    setErrors(eObj);
    if (Object.keys(eObj).length > 0) return;
    if (!captcha) {
      setErrors({ message: "Complete the verification check before sending." });
      return;
    }

    const service = isOther ? `Other: ${values.serviceOther}` : values.service || "-";
    setSending(true);
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "contact_form",
        name: values.name,
        email: values.email,
        phone: values.phone,
        company: values.company,
        services: service !== "-" ? [service] : [],
        budget: values.budget,
        message: values.message,
        details: {
          form: "Contact form",
          answers: [
            answer(Q.name, values.name),
            answer(Q.email, values.email),
            answer(Q.phone, values.phone),
            answer(Q.company, values.company),
            answer(Q.service, values.service),
            ...(isOther ? [answer(Q.serviceOther, values.serviceOther)] : []),
            answer(Q.budget, values.budget || NO_BUDGET),
            answer(Q.message, values.message),
          ],
        },
        ...leadContext(),
        turnstileToken: captcha,
      }),
    });
    setSending(false);
    if (!res.ok) {
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      setErrors({ message: json.error || "Could not send. Try again or email us directly." });
      setCaptcha("");
      setCaptchaReset((n) => n + 1);
      return;
    }
    goToThanks("enquiry");
  }

  const inputBase =
    "w-full border bg-white px-4 py-3 text-[15px] text-ink-900 placeholder:text-muted transition-[border-color,box-shadow] duration-300 ease-out-expo hover:border-brand-200 focus:outline-none focus-visible:outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-500/15";

  return (
    <form onSubmit={onSubmit} noValidate className="border border-line bg-white p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={Q.name} error={errors.name} htmlFor="name" required>
          <input
            id="name"
            type="text"
            autoComplete="name"
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
            className={cn(inputBase, errors.name ? "border-red-400" : "border-line")}
            placeholder="Amina Hassan"
            aria-invalid={!!errors.name}
          />
        </Field>
        <Field label={Q.email} error={errors.email} htmlFor="email" required>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(e) => set("email", e.target.value)}
            className={cn(inputBase, errors.email ? "border-red-400" : "border-line")}
            placeholder="you@company.com"
            aria-invalid={!!errors.email}
          />
        </Field>
        <Field label={Q.phone} htmlFor="phone">
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            value={values.phone}
            onChange={(e) => set("phone", e.target.value)}
            className={cn(inputBase, "border-line")}
            placeholder="+254 …"
          />
        </Field>
        <Field label={Q.company} htmlFor="company">
          <input
            id="company"
            type="text"
            autoComplete="organization"
            value={values.company}
            onChange={(e) => set("company", e.target.value)}
            className={cn(inputBase, "border-line")}
            placeholder="Your organisation"
          />
        </Field>
        <Field label={Q.service} htmlFor="service">
          <select
            id="service"
            value={values.service}
            onChange={(e) => set("service", e.target.value)}
            className={cn(inputBase, "border-line cursor-pointer appearance-none")}
          >
            <option value="">Select a service…</option>
            {services.map((s) => (
              <option key={s.slug} value={s.title}>
                {s.title}
              </option>
            ))}
            <option value={OTHER}>Other (tell us below)</option>
          </select>
        </Field>
        <Field label={Q.budget} htmlFor="budget">
          <select
            id="budget"
            value={values.budget}
            onChange={(e) => set("budget", e.target.value)}
            className={cn(inputBase, "border-line cursor-pointer appearance-none")}
          >
            <option value="">{NO_BUDGET}</option>
            {budgets.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {/* Revealed only when the visitor picks "Other", so the form never assumes
          it already lists everything someone might need. */}
      {isOther && (
        <div className="mt-5">
          <Field
            label={Q.serviceOther}
            error={errors.serviceOther}
            htmlFor="serviceOther"
            required
          >
            <input
              id="serviceOther"
              type="text"
              value={values.serviceOther}
              onChange={(e) => set("serviceOther", e.target.value)}
              className={cn(
                inputBase,
                errors.serviceOther ? "border-red-400" : "border-line",
              )}
              placeholder="e.g. a chatbot, an integration, technical advice…"
              aria-invalid={!!errors.serviceOther}
            />
          </Field>
        </div>
      )}

      <div className="mt-5">
        <Field label={Q.message} error={errors.message} htmlFor="message" required>
          <textarea
            id="message"
            rows={5}
            value={values.message}
            onChange={(e) => set("message", e.target.value)}
            className={cn(inputBase, "resize-none", errors.message ? "border-red-400" : "border-line")}
            placeholder="Tell us about your project, goals, and timeline…"
            aria-invalid={!!errors.message}
          />
        </Field>
      </div>

      <div className="mt-5">
        <TurnstileField
          action="contact"
          theme="light"
          onToken={setCaptcha}
          resetSignal={captchaReset}
        />
      </div>

      <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted">
          We&apos;ll never share your details. Replies within one business day.
        </p>
        <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={sending}>
          {sending ? "Sending…" : "Send message"}
          <Send
            className="h-4 w-4 transition-transform duration-300 ease-out-expo group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5"
            aria-hidden
          />
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  error,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-sm font-medium text-slate-ink"
      >
        {label}
        {required && <span className="ml-0.5 text-brand-500">*</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1.5 text-xs font-medium text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
