"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { publicMediaUrl } from "@/lib/constants";
import { company } from "@/lib/content";
import {
  composeBillTo,
  defaultFromBlock,
  firstLine,
  invoiceTotals,
  plusDaysIso,
  statusBanner,
  todayIso,
} from "@/lib/invoice";
import type { Invoice, InvoiceItem, SiteSettings } from "@/lib/cms";
import { InvoiceDocument, type InvoiceDocValues } from "@/components/invoice/InvoiceDocument";
import { AdminBtn } from "@/components/admin/ui";

export function InvoiceEditor({
  initial,
  items: initialItems,
  settings,
  lead,
  clients = [],
}: {
  initial?: Invoice;
  items?: InvoiceItem[];
  settings: SiteSettings;
  lead?: { id: string; name: string; email: string; phone: string | null; company: string | null } | null;
  clients?: { id: string; name: string; billing_email: string | null; phone: string | null; kra_pin: string | null }[];
}) {
  const router = useRouter();
  const logo = publicMediaUrl(settings.logo_path) || `${company.domain}/email-logo.png`;
  const [clientId, setClientId] = useState(initial?.client_id ?? "");
  const [billEmail, setBillEmail] = useState(initial?.bill_email || lead?.email || "");
  const [billPhone, setBillPhone] = useState(initial?.bill_phone || lead?.phone || "");
  const [status, setStatus] = useState(initial?.status || "draft");
  const [stkPhone, setStkPhone] = useState(initial?.bill_phone || lead?.phone || "254");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [doc, setDoc] = useState<Omit<InvoiceDocValues, "banner" | "subtotal" | "discount" | "tax" | "total" | "balance">>(() => ({
    number: initial?.number || "",
    fromBlock: initial?.from_block || defaultFromBlock(settings),
    billTo:
      initial?.bill_to_block ||
      composeBillTo({
        name: initial?.bill_name || lead?.name,
        company: initial?.bill_company || lead?.company,
        email: initial?.bill_email || lead?.email,
        phone: initial?.bill_phone || lead?.phone,
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
    paymentAdvice: initial?.payment_note || settings.payment_note || "",
    thankYou: initial?.thank_you || "Thank you for working with us!",
    showDiscount: Number(initial?.discount_kes || 0) > 0 || initial?.discount_percent != null,
    discountKind: initial?.discount_percent != null ? "percent" : "amount",
    discountValue: Number(initial?.discount_percent ?? initial?.discount_kes ?? 0),
    showTax: initial?.vat_percent != null && Number(initial.vat_percent) > 0,
    taxPercent: Number(initial?.vat_percent ?? settings.vat_percent ?? 0),
    showShipping: Number(initial?.shipping_kes || 0) > 0,
    shipping: Number(initial?.shipping_kes || 0),
    amountPaid: Number(initial?.amount_paid_kes || 0),
  }));

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

  const banner = statusBanner(status, totals.balance);
  const values: InvoiceDocValues = { ...doc, banner, ...totals };

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

  function payload(nextStatus?: string) {
    const name = firstLine(doc.billTo) || "Client";
    return {
      number: doc.number || initial?.number || "",
      client_id: clientId || null,
      lead_id: lead?.id ?? initial?.lead_id ?? null,
      bill_name: name,
      bill_email: billEmail,
      bill_phone: billPhone || null,
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
      amount_paid_kes: totals.paid,
      total_kes: totals.total,
      status: nextStatus || status,
      sent_at: nextStatus === "sent" ? new Date().toISOString() : initial?.sent_at,
      paid_at: nextStatus === "paid" || totals.balance <= 0 ? new Date().toISOString() : initial?.paid_at,
    };
  }

  async function save(nextStatus?: string) {
    setBusy(true);
    setMsg(null);
    const supabase = createClient();
    let id = initial?.id;
    let number = doc.number || initial?.number;
    const paidAmount = nextStatus === "paid" ? totals.total : totals.paid;
    const row = {
      ...payload(nextStatus),
      amount_paid_kes: paidAmount,
      paid_at: nextStatus === "paid" || totals.balance <= 0 ? new Date().toISOString() : initial?.paid_at,
    };
    if (!id) {
      if (!number) {
        const { data: n, error: nErr } = await supabase.rpc("next_invoice_number");
        if (nErr || !n) {
          setBusy(false);
          setMsg(nErr?.message || "Could not mint an invoice number.");
          return false;
        }
        number = n;
        setDoc((d) => ({ ...d, number: n }));
      }
      const { data, error } = await supabase
        .from("invoices")
        .insert({ ...row, number })
        .select("id, number")
        .single();
      if (error || !data) {
        setBusy(false);
        setMsg(error?.message || "Could not save.");
        return false;
      }
      id = data.id;
      await supabase.from("invoice_items").insert(
        doc.lines
          .filter((l) => l.description.trim())
          .map((l, i) => ({
            invoice_id: id!,
            description: l.description.trim(),
            qty: l.qty,
            unit_kes: l.unit,
            line_kes: l.qty * l.unit,
            sort_order: i,
          })),
      );
      setBusy(false);
      router.push(`/admin/invoices/${id}`);
      router.refresh();
      return true;
    }
    const { error } = await supabase.from("invoices").update(row).eq("id", id);
    if (error) {
      setBusy(false);
      setMsg(error.message);
      return false;
    }
    await supabase.from("invoice_items").delete().eq("invoice_id", id);
    await supabase.from("invoice_items").insert(
      doc.lines
        .filter((l) => l.description.trim())
        .map((l, i) => ({
          invoice_id: id!,
          description: l.description.trim(),
          qty: l.qty,
          unit_kes: l.unit,
          line_kes: l.qty * l.unit,
          sort_order: i,
        })),
    );
    if (nextStatus) setStatus(nextStatus);
    if (nextStatus === "paid") setDoc((d) => ({ ...d, amountPaid: paidAmount }));
    setBusy(false);
    setMsg("Saved.");
    router.refresh();
    return true;
  }

  async function send() {
    if (!billEmail) return setMsg("Add a send-to email in the sidebar first.");
    const ok = await save();
    if (!ok || !initial) return;
    setBusy(true);
    const res = await fetch("/api/admin/invoices/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invoiceId: initial.id }),
    });
    const json = (await res.json()) as { error?: string };
    setBusy(false);
    setMsg(json.error || "Sent.");
    router.refresh();
  }

  async function collect() {
    if (!initial) return;
    setBusy(true);
    const res = await fetch("/api/admin/invoices/collect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invoiceId: initial.id, phone: stkPhone }),
    });
    const json = (await res.json()) as { error?: string; message?: string };
    setBusy(false);
    setMsg(json.error || json.message || "M-Pesa prompt sent.");
    router.refresh();
  }

  return (
    <div className="-mx-4 -my-6 min-h-[calc(100vh-3.5rem)] bg-[#eceef2] px-3 py-6 lg:-mx-8 lg:-my-8 lg:px-8 lg:py-8">
      <div className="mx-auto flex max-w-[1100px] flex-col gap-6 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1">
          <InvoiceDocument mode="edit" logo={logo} values={values} onChange={patchDoc} />
        </div>
        <aside className="invoice-chrome w-full shrink-0 space-y-3 lg:w-56">
          <button
            type="button"
            disabled={busy}
            onClick={() => save()}
            className="flex h-11 w-full cursor-pointer items-center justify-center rounded-[5px] bg-brand-500 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
          >
            {busy ? "Saving..." : "Save"}
          </button>
          {msg ? <p className="text-xs text-body">{msg}</p> : null}
          <div className="rounded-[5px] border border-line bg-white p-3 space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">Invoice settings</p>
            {clients.length > 0 ? (
              <label className="block text-xs font-medium text-ink-900">
                Bill-to account
                <select
                  className="mt-1 w-full rounded-[5px] border border-[#e5e7eb] px-2 py-1.5 text-sm"
                  value={clientId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setClientId(id);
                    const c = clients.find((x) => x.id === id);
                    if (c) {
                      patchDoc({
                        billTo: composeBillTo({
                          name: c.name,
                          email: c.billing_email,
                          phone: c.phone,
                        }),
                      });
                      if (c.billing_email) setBillEmail(c.billing_email);
                      if (c.phone) {
                        setBillPhone(c.phone);
                        setStkPhone(c.phone);
                      }
                    }
                  }}
                >
                  <option value="">Ad-hoc</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            <label className="block text-xs font-medium text-ink-900">
              Send-to email
              <input
                className="mt-1 w-full rounded-[5px] border border-[#e5e7eb] px-2 py-1.5 text-sm"
                type="email"
                value={billEmail}
                onChange={(e) => setBillEmail(e.target.value)}
              />
            </label>
            <label className="block text-xs font-medium text-ink-900">
              Phone
              <input
                className="mt-1 w-full rounded-[5px] border border-[#e5e7eb] px-2 py-1.5 text-sm"
                value={billPhone}
                onChange={(e) => setBillPhone(e.target.value)}
              />
            </label>
            <label className="block text-xs font-medium text-ink-900">
              Status
              <select
                className="mt-1 w-full rounded-[5px] border border-[#e5e7eb] px-2 py-1.5 text-sm"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="void">Void</option>
              </select>
            </label>
            <p className="text-xs text-muted">Currency: KES (KSh)</p>
          </div>
          {initial ? (
            <div className="space-y-2 [&_a]:flex [&_a]:w-full [&_button]:flex [&_button]:w-full">
              <AdminBtn variant="ink" onClick={send} disabled={busy}>
                Email invoice
              </AdminBtn>
              <AdminBtn href={`/admin/invoices/${initial.id}/print`}>Print / PDF</AdminBtn>
              <AdminBtn variant="ghost" onClick={() => save("paid")} disabled={busy}>
                Mark paid
              </AdminBtn>
              {status !== "paid" && status !== "void" && totals.balance > 0 ? (
                <div className="rounded-[5px] border border-line bg-white p-3 space-y-2">
                  <label className="block text-xs font-medium text-ink-900">
                    Collect balance with M-Pesa
                    <input
                      className="mt-1 w-full rounded-[5px] border border-[#e5e7eb] px-2 py-1.5 text-sm"
                      value={stkPhone}
                      onChange={(e) => setStkPhone(e.target.value)}
                    />
                  </label>
                  <AdminBtn variant="primary" onClick={collect} disabled={busy}>
                    Send STK
                  </AdminBtn>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="text-xs text-muted">Save once to mint the number, then email or collect.</p>
          )}
        </aside>
      </div>
    </div>
  );
}
