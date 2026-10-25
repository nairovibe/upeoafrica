"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { inputClass } from "@/components/admin/ui";
import { LoginShell } from "@/components/admin/LoginShell";
import { TurnstileField } from "@/components/security/TurnstileField";
import {
  AUTH_OTP_LENGTH,
  isPasswordAcceptable,
  passwordChecks,
  passwordScore,
  STAFF_ACCESS_DENIED,
} from "@/lib/constants";
import { guardAuthAttempt, guardStaffEmail } from "@/app/admin/login/actions";
import { cn } from "@/lib/utils";

type Mode = "in" | "up" | "verify" | "forgot" | "reset";

function mapAuthError(raw: string) {
  if (/already work here|reserved for people/i.test(raw)) return STAFF_ACCESS_DENIED;
  if (/captcha|captcha verification/i.test(raw)) {
    return "Please complete the verification check, then try again.";
  }
  if (/email not confirmed/i.test(raw)) {
    return "Enter the code we sent to your work email.";
  }
  if (/invalid login|invalid credentials/i.test(raw)) {
    return "That email and password did not match.";
  }
  if (/expired|otp/i.test(raw) && /invalid|expired/i.test(raw)) {
    return "That code is invalid or has expired. Request a new one.";
  }
  return raw;
}

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/admin";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [mode, setMode] = useState<Mode>("in");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [captcha, setCaptcha] = useState("");
  const [captchaReset, setCaptchaReset] = useState(0);

  const strength = passwordScore(password);
  const checks = passwordChecks(password);
  const canCreate = isPasswordAcceptable(password) && name.trim().length > 1;

  function bumpCaptcha() {
    setCaptcha("");
    setCaptchaReset((n) => n + 1);
  }

  async function requireStaff() {
    const access = await guardStaffEmail(email);
    if (!access.ok) {
      setError(access.message);
      return false;
    }
    return true;
  }

  function requireCaptcha() {
    if (!captcha) {
      setError("Complete the verification check before continuing.");
      return false;
    }
    return true;
  }

  async function enterDesk() {
    router.replace(next);
    router.refresh();
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (!(await requireStaff())) return;
    if (!requireCaptcha()) return;
    const captchaOk = await guardAuthAttempt(captcha);
    if (!captchaOk.ok) {
      setError(captchaOk.message);
      bumpCaptcha();
      return;
    }

    if (mode === "up" && !isPasswordAcceptable(password)) {
      setError("Choose a stronger password before we create the desk.");
      return;
    }
    if ((mode === "verify" || mode === "reset") && !new RegExp(`^\\d{${AUTH_OTP_LENGTH}}$`).test(code)) {
      setError(`Enter the ${AUTH_OTP_LENGTH}-digit code from your email.`);
      return;
    }
    if (mode === "reset" && !isPasswordAcceptable(password)) {
      setError("Choose a stronger password before we save it.");
      return;
    }

    setPending(true);
    const supabase = createClient();
    const origin = window.location.origin;

    try {
      if (mode === "up") {
        const { data, error: err } = await supabase.auth.signUp({
          email,
          password,
          options: {
            captchaToken: captcha,
            emailRedirectTo: `${origin}/admin/login`,
            data: { full_name: name.trim(), first_name: name.trim().split(/\s+/)[0] },
          },
        });
        if (err) throw err;
        if (data.session) {
          await enterDesk();
          return;
        }
        setMode("verify");
        setNotice("We sent a code to your work email. Enter it below.");
        setCode("");
        bumpCaptcha();
        return;
      }

      if (mode === "in") {
        const { error: err } = await supabase.auth.signInWithPassword({
          email,
          password,
          options: { captchaToken: captcha },
        });
        if (err) {
          if (/email not confirmed/i.test(err.message)) {
            setMode("verify");
            setNotice("Confirm this desk with the code in your email.");
            setCode("");
            bumpCaptcha();
            return;
          }
          throw err;
        }
        await enterDesk();
        return;
      }

      if (mode === "forgot") {
        const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
          captchaToken: captcha,
          redirectTo: `${origin}/admin/login`,
        });
        if (err) throw err;
        setMode("reset");
        setPassword("");
        setCode("");
        setNotice("If that address is on this desk, a code is on its way.");
        bumpCaptcha();
        return;
      }

      if (mode === "verify") {
        const attempt = await supabase.auth.verifyOtp({
          email,
          token: code,
          type: "signup",
          options: { captchaToken: captcha },
        });
        if (attempt.error) {
          const fallback = await supabase.auth.verifyOtp({
            email,
            token: code,
            type: "email",
            options: { captchaToken: captcha },
          });
          if (fallback.error) throw fallback.error;
        }
        await enterDesk();
        return;
      }

      if (mode === "reset") {
        const { error: err } = await supabase.auth.verifyOtp({
          email,
          token: code,
          type: "recovery",
          options: { captchaToken: captcha },
        });
        if (err) throw err;
        const { error: updateErr } = await supabase.auth.updateUser({ password });
        if (updateErr) throw updateErr;
        await enterDesk();
      }
    } catch (err) {
      setError(mapAuthError(err instanceof Error ? err.message : "Could not continue."));
      bumpCaptcha();
    } finally {
      setPending(false);
    }
  }

  async function resendCode() {
    setError(null);
    if (!(await requireStaff()) || !requireCaptcha()) return;
    const captchaOk = await guardAuthAttempt(captcha);
    if (!captchaOk.ok) {
      setError(captchaOk.message);
      bumpCaptcha();
      return;
    }
    setPending(true);
    const supabase = createClient();
    try {
      if (mode === "reset") {
        const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
          captchaToken: captcha,
          redirectTo: `${window.location.origin}/admin/login`,
        });
        if (err) throw err;
      } else {
        const { error: err } = await supabase.auth.resend({
          type: "signup",
          email,
          options: {
            captchaToken: captcha,
            emailRedirectTo: `${window.location.origin}/admin/login`,
          },
        });
        if (err) throw err;
      }
      setNotice("A new code is on its way.");
      bumpCaptcha();
    } catch (err) {
      setError(mapAuthError(err instanceof Error ? err.message : "Could not resend the code."));
      bumpCaptcha();
    } finally {
      setPending(false);
    }
  }

  const barColor =
    strength.tone === "weak"
      ? "bg-red-500"
      : strength.tone === "fair"
        ? "bg-brand-400"
        : strength.tone === "good" || strength.tone === "solid"
          ? "bg-emerald-500"
          : "bg-white/15";

  const title =
    mode === "up"
      ? "Create your desk"
      : mode === "verify"
        ? "Check your email"
        : mode === "forgot"
          ? "Reset access"
          : mode === "reset"
            ? "Set a new password"
            : "Sign in";

  const subtitle =
    mode === "up"
      ? "Authorized access only"
      : mode === "verify"
        ? "Authorized access only"
        : mode === "forgot"
          ? "We will send a code to the work address on this desk."
          : mode === "reset"
            ? "Enter the code from your email, then choose a new password."
            : "Authorized access only";

  const captchaAction =
    mode === "up" ? "signup" : mode === "in" ? "login" : "recovery";

  const submitLabel = pending
    ? "Please wait..."
    : mode === "up"
      ? "Create account"
      : mode === "verify"
        ? "Confirm and enter"
        : mode === "forgot"
          ? "Send the code"
          : mode === "reset"
            ? "Save password"
            : "Enter";

  const showPasswordField = mode === "in" || mode === "up" || mode === "reset";
  const showStrength = (mode === "up" || mode === "reset") && password.length > 0;
  const disableSubmit =
    pending ||
    (mode === "up" && !canCreate) ||
    (mode === "reset" && !isPasswordAcceptable(password));

  return (
    <LoginShell>
      <form onSubmit={onSubmit}>
        <p className="font-display text-xl font-semibold">{title}</p>
        <p className="mt-1 text-sm text-white/50">{subtitle}</p>
        {notice && <p className="mt-3 text-sm text-brand-300">{notice}</p>}
        <div className="mt-8 space-y-4">
          {mode === "up" && (
            <input
              className={inputClass}
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          )}
          {mode !== "verify" && mode !== "reset" ? (
            <input
              className={inputClass}
              type="email"
              required
              placeholder="Work email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          ) : (
            <p className="text-sm text-white/60">
              Code sent to <span className="text-white">{email}</span>
            </p>
          )}
          {(mode === "verify" || mode === "reset") && (
            <input
              className={cn(inputClass, "text-center text-2xl tracking-[0.18em]")}
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern={`[0-9]{${AUTH_OTP_LENGTH}}`}
              maxLength={AUTH_OTP_LENGTH}
              required
              placeholder={"0".repeat(AUTH_OTP_LENGTH)}
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/\D/g, "").slice(0, AUTH_OTP_LENGTH))
              }
            />
          )}
          {showPasswordField && (
            <div className="relative">
              <input
                className={cn(inputClass, "pr-11")}
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                placeholder={mode === "reset" ? "New password" : "Password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={
                  mode === "up" || mode === "reset" ? "new-password" : "current-password"
                }
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-0 inline-flex w-11 cursor-pointer items-center justify-center text-ink-500 hover:text-ink-900"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          )}
          {showStrength && (
            <div>
              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-1 gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={cn(
                        "h-1 flex-1 rounded-[5px]",
                        i < strength.passed ? barColor : "bg-white/15",
                      )}
                    />
                  ))}
                </div>
                {strength.label ? (
                  <span className="shrink-0 text-xs text-white/60">{strength.label}</span>
                ) : null}
              </div>
              <ul className="mt-3 space-y-1.5">
                {checks.map((c) => (
                  <li
                    key={c.id}
                    className={cn(
                      "flex items-center gap-2 text-xs",
                      c.ok ? "text-emerald-400" : "text-white/40",
                    )}
                  >
                    <Check
                      className={cn("h-3.5 w-3.5 shrink-0", c.ok ? "opacity-100" : "opacity-30")}
                      aria-hidden
                    />
                    {c.label}
                    {c.id === "sym" ? " (optional)" : ""}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <TurnstileField
            key={captchaAction}
            action={captchaAction}
            theme="dark"
            onToken={setCaptcha}
            resetSignal={captchaReset}
          />
        </div>
        {error && (
          <p className="mt-3 text-sm text-brand-300" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={disableSubmit}
          className="mt-6 inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-[5px] bg-brand-500 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
        >
          {submitLabel}
        </button>
        {(mode === "verify" || mode === "reset") && (
          <button
            type="button"
            onClick={resendCode}
            disabled={pending}
            className="mt-3 inline-flex h-11 w-full cursor-pointer items-center justify-center text-sm font-medium text-brand-400 hover:text-brand-300 disabled:opacity-50"
          >
            Send a new code
          </button>
        )}
        {mode === "in" ? (
          <div className="mt-4 space-y-2 text-center text-sm text-white/50">
            <p>
              <button
                type="button"
                onClick={() => {
                  setMode("forgot");
                  setError(null);
                  setNotice(null);
                  bumpCaptcha();
                }}
                className="cursor-pointer font-medium text-brand-400 hover:text-brand-300"
              >
                Forgot password?
              </button>
            </p>
            <p>
              First time here?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("up");
                  setError(null);
                  setNotice(null);
                  bumpCaptcha();
                }}
                className="cursor-pointer font-medium text-brand-400 hover:text-brand-300"
              >
                Create the owner account
              </button>
            </p>
          </div>
        ) : (
          <p className="mt-4 text-center text-sm text-white/50">
            <button
              type="button"
              onClick={() => {
                setMode("in");
                setError(null);
                setNotice(null);
                setCode("");
                bumpCaptcha();
              }}
              className="cursor-pointer font-medium text-brand-400 hover:text-brand-300"
            >
              Back to sign in
            </button>
          </p>
        )}
      </form>
    </LoginShell>
  );
}
