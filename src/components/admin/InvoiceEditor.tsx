"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatKesMoney, publicMediaUrl } from "@/lib/constants";
import { company } from "@/lib/content";
import { composeBillTo, defaultFromBlock, firstLine, invoiceTotals, plusDaysIso, todayIso } from "@/lib/invoice";
import type { Invoice, InvoiceItem, SiteSettings } from "@/lib/cms";
import { InvoiceDocument, type InvoiceDocValues } from "@/components/invoice/InvoiceDocument";
import { AdminBtn, AdminPage, Field, Panel, Pill, inputClass } from "@/components/admin/ui";
import {
  docBanner,
  formatWhen,
  invoiceState,
  invoiceTone,
  paymentLabel,
  paymentTone,
  toMsisdn,
  todayNairobi,
} from "@/components/admin/money/format";
import { cn } from "@/lib/utils";

type Msg = { ok: boolean; text: string } | null;

export function InvoiceEditor({
  initial,
  items: initialItems,
  settings,
  lead,
  clients = [],
  payments = [],
  defaultClientId,
}: {
  initial?: Invoice;
  items?: InvoiceItem[];
  settings: SiteSettings | null;
  lead?: { id: string; name: string; email: string; phone: string | null; company: string | null } | null;
  clients?: { id: string; name: string; billing_email: string | null; phone: string | null; kra_pin: string | null }[];
  payments?: { id: string; result: string | null; created_at: string }[];
  defaultClientId?: string;
}) {
  const router = useRouter();
  const logo = publicMediaUrl(settings?.logo_path) || `${company.domain}/email-logo.png`;
  const preset = !initial && !lead ? clients.find((c) => c.id === defaultClientId) : undefined;
  const [clientId, setClientId] = useState(initial?.client_id ?? preset?.id ?? "");
  const [billEmail, setBillEmail] = useState(initial?.bill_email || lead?.email || preset?.billing_email || "");
  const [billPhone, setBillPhone] = useState(initial?.bill_phone || lead?.phone || preset?.phone || "");
  const [status, setStatus] = useState(initial?.status || "draft");
  const [stkPhone, setStkPhone] = useState(toMsisdn(initial?.bill_phone || lead?.phone || preset?.phone) || "254");
  const [msg, setMsg] = useState<Msg>(null);
  const [busy, setBusy] = useState(false);
  const [doc, setDoc] = useState<Omit<InvoiceDocValues, "banner" | "subtotal" | "discount" | "tax" | "total" | "balance">>(() => ({
    number: initial?.number || "",
    fromBlock: initial?.from_block || defaultFromBlock(settings),
    billTo:
      initial?.bill_to_block ||
      composeBillTo({
        name: initial?.bill_name || lead?.name || preset?.name,
        company: initial?.bill_company || lead?.company,
        email: initial?.bill_email || lead?.email || preset?.billing_email,
        phone: initial?.bill_phone || lead?.phone || preset?.phone,
      }),
    shipTo: initial?.ship_to || "",
    issuedOn: initial?.issued_on || todayIso(),
    dueOn: initial?.due_on || plusDaysIso(1),
    poNumber: initial?.po_number || "",
    lines: initialItems?.length
      ? initialItems.map((i) => ({
          description: i.description,
          qty: Number(i.qty),
          unit: Number(i.unit_kes),
        }))
      : [{ description: "", qty: 1, unit: 0 }],
    specs: initial?.notes || "",
    paymentAdvice: initial?.payment_note || settings?.payment_note || "",
    thankYou: initial?.thank_you || "Thank you for working with us!",
    showDiscount: Number(initial?.discount_kes || 0) > 0 || initial?.discount_percent != null,
    discountKind: initial?.discount_percent != null ? "percent" : "amount",
    discountValue: Number(initial?.discount_percent ?? initial?.discount_kes ?? 0),
    showTax: initial?.vat_percent != null && Number(initial.vat_percent) > 0,
    taxPercent: Number(initial?.vat_percent ?? settings?.vat_percent ?? 0),
    showShipping: Number(initial?.shipping_kes || 0) > 0,
    shipping: Number(initial?.shipping_kes || 0),
    amountPaid: Number(initial?.amount_paid_kes || 0),
  }));

  // The send API and the IntaSend webhook change status and amount paid on the server.
  const [seenUpdate, setSeenUpdate] = useState(initial?.updated_at);
  if (initial && initial.updated_at !== seenUpdate) {
    setSeenUpdate(initial.updated_at);
    setStatus(initial.status);
    setDoc((d) => ({ ...d, number: initial.number, amountPaid: Number(initial.amount_paid_kes || 0) }));
  }

  const totals = useMemo(
    () =>
      invoiceTotals({
        lines: doc.lines,
        showDiscount: doc.showDiscount,
        discountKind: doc.discountKind,
        discountValue: doc.discountValue,
        showTax: doc.showTax,
        taxPercent: doc.taxPercent,
        showShipping: doc.showShipping,
        shipping: doc.shipping,
        amountPaid: doc.amountPaid,
      }),
    [doc],
  );

  const banner = docBanner(status, totals.total, totals.balance);
  const values: InvoiceDocValues = { ...doc, banner, ...totals };
  const state = invoiceState({ status, due_on: doc.dueOn || null }, todayNairobi());
  const settled = status === "paid" || status === "void";

  function patchDoc(patch: Partial<InvoiceDocValues>) {
    setDoc((prev) => {
      const next = { ...prev };
      for (const [k, v] of Object.entries(patch)) {
        if (k === "banner" || k === "subtotal" || k === "discount" || k === "tax" || k === "total" || k === "balance") continue;
        (next as Record<string, unknown>)[k] = v;
      }
      return next;
    });
  }

  function itemRows(invoiceId: string) {
    return doc.lines
      .filter((l) => l.description.trim())
      .map((l, i) => ({
        invoice_id: invoiceId,
        description: l.description.trim(),
        qty: l.qty,
        unit_kes: l.unit,
        line_kes: l.qty * l.unit,
        sort_order: i,
      }));
  }

  function fail(text: string) {
    setBusy(false);
    setMsg({ ok: false, text });
    return false;
  }

  async function save(nextStatus?: string) {
    if (!firstLine(doc.billTo)) return fail("Add who this invoice is for.");
    if (billEmail && !/^\S+@\S+\.\S+$/.test(billEmail)) return fail("Check the send-to email.");
    setBusy(true);
    setMsg(null);
    const supabase = createClient();
    let id = initial?.id;
    let number = doc.number.trim() || initial?.number;
    const finalStatus = nextStatus || status;
    const paidAmount = nextStatus === "paid" ? totals.total : totals.paid;
    const fullyPaid = finalStatus === "paid" || (totals.total > 0 && totals.total - paidAmount <= 0);
    const row = {
      client_id: clientId || null,
      lead_id: lead?.id ?? initial?.lead_id ?? null,
      bill_name: firstLine(doc.billTo),
      bill_email: billEmail.trim(),
      bill_phone: billPhone.trim() || null,
      bill_company: null,
      from_block: doc.fromBlock,
      bill_to_block: doc.billTo,
      ship_to: doc.shipTo || null,
      issued_on: doc.issuedOn || null,
      due_on: doc.dueOn || null,
      po_number: doc.poNumber || null,
      notes: doc.specs || null,
      payment_note: doc.paymentAdvice || null,
      thank_you: doc.thankYou || null,
      subtotal_kes: totals.subtotal,
      vat_percent: doc.showTax ? doc.taxPercent : null,
      vat_kes: totals.tax,
      discount_kes: totals.discount,
      discount_percent: doc.showDiscount && doc.discountKind === "percent" ? doc.discountValue : null,
      shipping_kes: totals.shipping,
      amount_paid_kes: paidAmount,
      total_kes: totals.total,
      status: finalStatus,
      sent_at: finalStatus === "sent" && !initial?.sent_at ? new Date().toISOString() : (initial?.sent_at ?? null),
      paid_at: fullyPaid ? (initial?.paid_at ?? new Date().toISOString()) : null,
    };

    if (!id) {
      if (!number) {
        const { data: n, error: nErr } = await supabase.rpc("next_invoice_number");
        if (nErr || !n) return fail(nErr?.message || "Could not assign an invoice number.");
        number = n;
        setDoc((d) => ({ ...d, number: n }));
      }
      const { data, error } = await supabase
        .from("invoices")
        .insert({ ...row, number })
        .select("id")
        .single();
      if (error || !data) return fail(duplicate(error?.message) || error?.message || "Could not save.");
      id = data.id;
      const items = itemRows(id);
      if (items.length) {
        const { error: itemsErr } = await supabase.from("invoice_items").insert(items);
        if (itemsErr) return fail(`Invoice saved, line items failed: ${itemsErr.message}`);
      }
      router.push(`/console/invoices/${id}`);
      router.refresh();
      return true;
    }

    const { error } = await supabase
      .from("invoices")
      .update({ ...row, number: number || initial!.number })
      .eq("id", id);
    if (error) return fail(duplicate(error.message) || error.message);
    const { error: delErr } = await supabase.from("invoice_items").delete().eq("invoice_id", id);
    if (delErr) return fail(delErr.message);
    const items = itemRows(id);
    if (items.length) {
      const { error: itemsErr } = await supabase.from("invoice_items").insert(items);
      if (itemsErr) return fail(`Line items failed to save: ${itemsErr.message}`);
    }
    setStatus(finalStatus);
    if (nextStatus === "paid") setDoc((d) => ({ ...d, amountPaid: paidAmount }));
    setBusy(false);
    setMsg({ ok: true, text: nextStatus === "paid" ? "Marked paid." : "Saved." });
    router.refresh();
    return true;
  }

  async function post(url: string, body: object, done: string) {
    setBusy(true);
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
    setBusy(false);
    setMsg(res.ok ? { ok: true, text: json.message || done } : { ok: false, text: json.error || "Something went wrong." });
    router.refresh();
    return res.ok;
  }

  async function send() {
    if (!initial) return;
    if (!billEmail) return fail("Add a send-to email first.");
    if (totals.total <= 0) return fail("Add a line item with an amount first.");
    const ok = await save();
    if (!ok) return;
    if (await post("/api/admin/invoices/send", { invoiceId: initial.id }, `Emailed to ${billEmail}.`)) setStatus("sent");
  }

  async function collect() {
    if (!initial) return;
    const msisdn = toMsisdn(stkPhone);
    if (!msisdn) return fail("Use a Safaricom number like 0712 345 678.");
    await post("/api/admin/invoices/collect", { invoiceId: initial.id, phone: msisdn }, "M-Pesa prompt sent.");
  }

  return (
    <AdminPage
      title={initial ? initial.number : "New invoice"}
      action={
        <div className="invoice-chrome flex items-center gap-2">
          <AdminBtn variant="ghost" href="/console/invoices">
            All invoices
          </AdminBtn>
          {initial ? (
            <AdminBtn variant="ghost" href={`/console/invoices/${initial.id}/print`}>
              Print or PDF
            </AdminBtn>
          ) : null}
          <AdminBtn onClick={() => save()} pending={busy}>
            {busy ? "Saving..." : initial ? "Save" : "Save draft"}
          </AdminBtn>
        </div>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
        <div className="min-w-0 rounded-[5px] border border-line bg-[#eceef2] p-3 sm:p-6">
          <InvoiceDocument mode="edit" logo={logo} values={values} onChange={patchDoc} />
        </div>

        <aside className="invoice-chrome space-y-4 lg:sticky lg:top-20">
          {msg ? (
            <p
              role="status"
              className={cn(
                "rounded-[5px] border px-3 py-2 text-[13px]",
                msg.ok ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700",
              )}
            >
              {msg.text}
            </p>
          ) : null}

          <Panel
            title="Billing"
            meta={lead && !initial ? `From enquiry by ${lead.name}` : undefined}
            action={<Pill tone={invoiceTone(state)}>{state}</Pill>}
          >
            <div className="space-y-3">
              {clients.length > 0 ? (
                <Field label="Client">
                  <select
                    className={inputClass}
                    value={clientId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setClientId(id);
                      const c = clients.find((x) => x.id === id);
                      if (c) {
                        patchDoc({ billTo: composeBillTo({ name: c.name, email: c.billing_email, phone: c.phone }) });
                        if (c.billing_email) setBillEmail(c.billing_email);
                        if (c.phone) {
                          setBillPhone(c.phone);
                          setStkPhone(toMsisdn(c.phone) || c.phone);
                        }
                      }
                    }}
                  >
                    <option value="">One-off client</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </Field>
              ) : null}
              <Field label="Send to">
                <input
                  className={inputClass}
                  type="email"
                  value={billEmail}
                  placeholder="client@company.co.ke"
                  onChange={(e) => setBillEmail(e.target.value)}
                />
              </Field>
              <Field label="Phone">
                <input className={inputClass} inputMode="tel" value={billPhone} onChange={(e) => setBillPhone(e.target.value)} />
              </Field>
              <Field label="Status">
                <select className={inputClass} value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                  <option value="void">Void</option>
                </select>
              </Field>
            </div>
          </Panel>

          {initial ? (
            <Panel title="Get paid" meta={`Balance ${formatKesMoney(totals.balance)}`}>
              <div className="space-y-3">
                {!settled ? (
                  <div className="grid grid-cols-2 gap-2 [&>*]:w-full">
                    <AdminBtn variant="ink" onClick={send} disabled={busy || !billEmail}>
                      {initial.sent_at ? "Email again" : "Email invoice"}
                    </AdminBtn>
                    <AdminBtn variant="ghost" onClick={() => save("paid")} disabled={busy}>
                      Mark paid
                    </AdminBtn>
                  </div>
                ) : (
                  <p className="text-[13px] text-body">
                    {status === "paid"
                      ? `Paid${initial.paid_at ? ` ${formatWhen(initial.paid_at)}` : ""}.`
                      : "This invoice is void."}
                  </p>
                )}
                {!settled && totals.balance > 0 ? (
                  <form
                    className="border-t border-line pt-3"
                    onSubmit={(e) => {
                      e.preventDefault();
                      collect();
                    }}
                  >
                    <Field label="M-Pesa number">
                      <div className="flex gap-2">
                        <input
                          className={inputClass}
                          inputMode="tel"
                          value={stkPhone}
                          onChange={(e) => setStkPhone(e.target.value)}
                        />
                        <AdminBtn type="submit" disabled={busy}>
                          Prompt
                        </AdminBtn>
                      </div>
                    </Field>
                  </form>
                ) : null}
                {initial.sent_at ? (
                  <p className="text-xs text-muted">Last emailed {formatWhen(initial.sent_at)}</p>
                ) : null}
              </div>
            </Panel>
          ) : null}

          {initial ? (
            <Panel title="Payments" flush>
              {payments.length ? (
                <ul>
                  {payments.map((p) => (
                    <li key={p.id} className="flex items-center justify-between gap-3 border-t border-line px-5 py-2.5">
                      <Pill tone={paymentTone(p.result)}>{paymentLabel(p.result)}</Pill>
                      <span className="text-xs tabular-nums text-muted">{formatWhen(p.created_at)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-5 pb-4 text-[13px] text-muted">No M-Pesa payments yet.</p>
              )}
            </Panel>
          ) : null}

          {initial?.lead_id ? (
            <Link href={`/console/leads/${initial.lead_id}`} className="block text-[13px] font-medium text-brand-600 hover:underline">
              Open the enquiry
            </Link>
          ) : null}
        </aside>
      </div>
    </AdminPage>
  );
}

function duplicate(message: string | undefined) {
  return message && /invoices_number_key|duplicate key/i.test(message) ? "That invoice number is already used." : null;
}
