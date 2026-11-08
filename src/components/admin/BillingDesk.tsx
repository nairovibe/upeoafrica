"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AdminBtn, Field, Panel, Pill, inputClass } from "@/components/admin/ui";
import { Notice } from "@/components/admin/studio/controls";
import { Modal } from "@/components/admin/blog/Modal";
import { PaymentMark } from "@/components/billing/PaymentMarks";
import { saveBilling } from "@/app/console/(console)/billing/actions";
import type { BillingCard, BillingMethodId } from "@/lib/billing";

const COPY: Record<BillingMethodId, { title: string; blurb: string }> = {
  mpesa: { title: "M-Pesa", blurb: "IntaSend sends the STK prompt. The same keys also cover card checkout." },
  card: { title: "Card", blurb: "Visa and Mastercard through the IntaSend checkout. Uses the M-Pesa keys." },
  airtel: { title: "Airtel Money", blurb: "Airtel Africa collection. The customer approves a prompt on their phone." },
  paypal: { title: "PayPal", blurb: "PayPal Checkout. The secret stays on the server and is never shown again." },
  bank: { title: "Bank transfer", blurb: "Account details on the invoice and in the email. No API key." },
};

export function BillingDesk({ cards, origin }: { cards: BillingCard[]; origin: string }) {
  const router = useRouter();
  const [open, setOpen] = useState<BillingMethodId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const current = cards.find((card) => card.id === open) ?? null;

  function save(form: FormData, enabled: boolean) {
    if (!current) return;
    const publicConfig: Record<string, string> = {};
    const secrets: Record<string, string> = {};
    form.forEach((value, key) => {
      if (typeof value !== "string") return;
      if (key.startsWith("secret.")) secrets[key.slice(7)] = value;
      else if (key !== "enabled") publicConfig[key] = value;
    });
    setError(null);
    start(async () => {
      const result = await saveBilling({ id: current.id, enabled, publicConfig, secrets });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setOpen(null);
      router.refresh();
    });
  }

  return (
    <div className="grid gap-4">
      {cards.map((card) => (
        <Panel key={card.id} title={COPY[card.id].title} meta={COPY[card.id].blurb}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-12 min-w-12 items-center justify-center rounded-[5px] border border-line bg-white px-2">
                <PaymentMark id={card.id} className="h-6 w-auto" />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Pill tone={card.enabled ? "success" : "neutral"}>{card.enabled ? "On" : "Off"}</Pill>
                  <Pill tone={card.configured ? "success" : "warning"}>{card.configured ? "Ready" : "Needs setup"}</Pill>
                </div>
              </div>
            </div>
            <AdminBtn variant="ghost" onClick={() => { setError(null); setOpen(card.id); }}>
              Set up
            </AdminBtn>
          </div>
        </Panel>
      ))}

      <Modal
        open={Boolean(current)}
        title={current ? `Set up ${COPY[current.id].title}` : "Payment method"}
        onClose={() => setOpen(null)}
      >
        {current ? (
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              save(form, form.get("enabled") === "on");
            }}
          >
            <p className="text-sm text-body">{COPY[current.id].blurb} Leave a secret blank to keep the one already saved.</p>
            {current.id === "mpesa" ? (
              <>
                <Field label="Mode">
                  <select className={inputClass} name="mode" defaultValue={current.publicConfig.mode || "test"}>
                    <option value="test">Test</option>
                    <option value="live">Live</option>
                  </select>
                </Field>
                <Field label="Publishable key">
                  <input className={inputClass} name="secret.publishable_key" autoComplete="off" placeholder={current.configured ? "Saved. Leave blank to keep it." : "ISPubKey_..."} />
                </Field>
                <Field label="Secret key">
                  <input className={inputClass} name="secret.secret_key" type="password" autoComplete="new-password" placeholder={current.configured ? "Saved. Leave blank to keep it." : "ISSecretKey_..."} />
                </Field>
                <Field label="Webhook secret">
                  <input className={inputClass} name="secret.webhook_secret" type="password" autoComplete="new-password" placeholder="Optional" />
                </Field>
                <p className="text-xs text-muted">IntaSend webhook URL: {origin}/api/webhooks/intasend</p>
              </>
            ) : null}
            {current.id === "card" ? (
              <p className="text-sm text-body">Card checkout uses the IntaSend keys from M-Pesa. Set those up first, then switch card payments on.</p>
            ) : null}
            {current.id === "paypal" ? (
              <>
                <Field label="Mode">
                  <select className={inputClass} name="mode" defaultValue={current.publicConfig.mode || "sandbox"}>
                    <option value="sandbox">Sandbox</option>
                    <option value="live">Live</option>
                  </select>
                </Field>
                <Field label="Client ID">
                  <input className={inputClass} name="client_id" defaultValue={current.publicConfig.client_id || ""} autoComplete="off" />
                </Field>
                <Field label="Secret">
                  <input className={inputClass} name="secret.secret" type="password" autoComplete="new-password" placeholder={current.configured ? "Saved. Leave blank to keep it." : "PayPal secret"} />
                </Field>
              </>
            ) : null}
            {current.id === "airtel" ? (
              <>
                <Field label="Mode">
                  <select className={inputClass} name="mode" defaultValue={current.publicConfig.mode || "sandbox"}>
                    <option value="sandbox">Sandbox</option>
                    <option value="live">Live</option>
                  </select>
                </Field>
                <Field label="Client ID">
                  <input className={inputClass} name="client_id" defaultValue={current.publicConfig.client_id || ""} autoComplete="off" />
                </Field>
                <Field label="Client secret">
                  <input className={inputClass} name="secret.client_secret" type="password" autoComplete="new-password" placeholder={current.configured ? "Saved. Leave blank to keep it." : "Airtel secret"} />
                </Field>
                <p className="text-xs text-muted">Airtel callback URL: {origin}/api/webhooks/airtel</p>
              </>
            ) : null}
            {current.id === "bank" ? (
              <>
                <Field label="Bank name">
                  <input className={inputClass} name="bank_name" defaultValue={current.publicConfig.bank_name || ""} />
                </Field>
                <Field label="Account name">
                  <input className={inputClass} name="account_name" defaultValue={current.publicConfig.account_name || ""} />
                </Field>
                <Field label="Account number">
                  <input className={inputClass} name="account_number" defaultValue={current.publicConfig.account_number || ""} />
                </Field>
                <Field label="Branch">
                  <input className={inputClass} name="branch" defaultValue={current.publicConfig.branch || ""} />
                </Field>
                <Field label="SWIFT">
                  <input className={inputClass} name="swift" defaultValue={current.publicConfig.swift || ""} />
                </Field>
                <Field label="Note">
                  <input className={inputClass} name="note" defaultValue={current.publicConfig.note || ""} placeholder="Use the invoice number as the reference." />
                </Field>
              </>
            ) : null}
            <label className="flex items-center gap-2 text-sm text-ink-900">
              <input type="checkbox" name="enabled" defaultChecked={current.enabled} className="accent-brand-500" />
              Accept this method on invoices
            </label>
            {error ? <Notice tone="error">{error}</Notice> : null}
            <div className="flex justify-end gap-2">
              <AdminBtn variant="ghost" type="button" onClick={() => setOpen(null)}>Cancel</AdminBtn>
              <AdminBtn type="submit" pending={pending} disabled={pending}>Save</AdminBtn>
            </div>
          </form>
        ) : null}
      </Modal>
    </div>
  );
}
