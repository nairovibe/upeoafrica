"use client";

import { useState } from "react";
import Link from "next/link";
import { TurnstileField } from "@/components/security/TurnstileField";
import { Button } from "@/components/ui/Button";

type Notice = { tone: "ok" | "error"; text: string };

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [resetSignal, setResetSignal] = useState(0);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const website = String(new FormData(event.currentTarget).get("website") ?? "");
    if (!token) {
      setNotice({ tone: "error", text: "Confirm you are not a bot, then subscribe." });
      return;
    }
    setPending(true);
    setNotice(null);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, website, turnstileToken: token }),
      });
      const data = (await res.json().catch(() => null)) as { error?: string; already?: boolean } | null;
      if (!res.ok) {
        setNotice({ tone: "error", text: data?.error || "Could not save your email." });
        setResetSignal((value) => value + 1);
        return;
      }
      setEmail("");
      setResetSignal((value) => value + 1);
      setNotice({
        tone: "ok",
        text: data?.already ? "This address is already on the list." : "You are on the list.",
      });
    } catch {
      setNotice({ tone: "error", text: "Could not save your email." });
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="relative mt-5" noValidate>
      <label htmlFor="newsletter-email" className="text-sm font-medium text-white">
        Email address
      </label>
      <div className="mt-2 flex flex-col gap-3 sm:flex-row">
        <input
          id="newsletter-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          maxLength={320}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@company.co.ke"
          className="h-14 w-full min-w-0 rounded-[5px] border border-white/25 bg-white/5 px-4 text-base text-white outline-none transition-[border-color] duration-200 placeholder:text-white/40 focus:border-brand-500 sm:h-11 sm:flex-1 sm:text-sm"
        />
        <Button type="submit" disabled={pending} className="w-full rounded-[5px] sm:w-auto sm:shrink-0">
          {pending ? "Subscribing" : "Subscribe"}
        </Button>
      </div>
      <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden>
        <label htmlFor="newsletter-website">Website</label>
        <input id="newsletter-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="mt-3">
        <TurnstileField action="newsletter" theme="dark" onToken={setToken} resetSignal={resetSignal} />
      </div>
      {notice ? (
        <p className={notice.tone === "ok" ? "text-sm text-white" : "text-sm text-red-300"} role={notice.tone === "ok" ? "status" : "alert"}>
          {notice.text}
        </p>
      ) : null}
      <p className="mt-3 text-xs leading-relaxed text-white/50">
        We email only what you asked for. Unsubscribe any time.{" "}
        <Link href="/privacy" className="text-white/70 underline-offset-2 transition-colors duration-300 hover:text-brand-400 hover:underline">
          Privacy Policy
        </Link>
      </p>
    </form>
  );
}
