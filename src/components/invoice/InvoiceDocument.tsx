"use client";

import { formatKesMoney } from "@/lib/constants";
import { formatInvoiceDate, lineAmount, type InvoiceLine } from "@/lib/invoice";

const box =
  "w-full rounded-[5px] border border-[#e5e7eb] bg-white px-2.5 py-2 text-sm text-ink-900 outline-none focus:border-brand-500";
const ghost =
  "w-full resize-y rounded-[5px] border border-transparent bg-transparent px-0 py-1 text-sm leading-relaxed text-ink-900 outline-none hover:border-[#e5e7eb] focus:border-brand-500";

export type InvoiceDocValues = {
  number: string;
  banner: string;
  fromBlock: string;
  billTo: string;
  shipTo: string;
  issuedOn: string;
  dueOn: string;
  poNumber: string;
  lines: InvoiceLine[];
  specs: string;
  paymentAdvice: string;
  thankYou: string;
  showDiscount: boolean;
  discountKind: "amount" | "percent";
  discountValue: number;
  showTax: boolean;
  taxPercent: number;
  showShipping: boolean;
  shipping: number;
  amountPaid: number;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  balance: number;
};

export function InvoiceDocument({
  mode,
  logo,
  values,
  onChange,
}: {
  mode: "edit" | "view";
  logo: string | null;
  values: InvoiceDocValues;
  onChange?: (patch: Partial<InvoiceDocValues>) => void;
}) {
  const edit = mode === "edit";
  const set = (patch: Partial<InvoiceDocValues>) => onChange?.(patch);

  function setLine(i: number, patch: Partial<InvoiceLine>) {
    set({
      lines: values.lines.map((row, idx) => (idx === i ? { ...row, ...patch } : row)),
    });
  }

  return (
    <article className="invoice-paper bg-white p-6 shadow-[0_1px_8px_rgba(15,23,42,0.08)] sm:p-9">
      <div className="flex items-start justify-between gap-6">
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo} alt="Upeo Africa Technologies" className="h-16 w-auto max-w-[220px] object-contain" />
        ) : (
          <p className="font-display text-lg font-semibold tracking-tight text-ink-900">Upeo Africa Technologies</p>
        )}
        <div className="min-w-[200px] text-right">
          <p className="font-display text-[28px] font-bold uppercase leading-none tracking-tight text-ink-900">
            {values.banner}
          </p>
          <label className="mt-3 flex items-center justify-end gap-2 text-sm text-ink-900">
            <span className="text-muted">#</span>
            {edit ? (
              <input
                className={`${box} w-40 text-right`}
                value={values.number}
                onChange={(e) => set({ number: e.target.value })}
                aria-label="Invoice number"
              />
            ) : (
              <span className="font-medium">{values.number}</span>
            )}
          </label>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_240px]">
        <div className="space-y-4">
          {edit ? (
            <textarea
              className={`${ghost} min-h-24`}
              value={values.fromBlock}
              onChange={(e) => set({ fromBlock: e.target.value })}
              aria-label="From"
              rows={5}
            />
          ) : (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-900">{values.fromBlock}</p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-[13px] font-semibold text-ink-900">Bill To</p>
              {edit ? (
                <textarea
                  className={`${box} mt-1 min-h-28`}
                  value={values.billTo}
                  onChange={(e) => set({ billTo: e.target.value })}
                  rows={5}
                />
              ) : (
                <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-ink-900">{values.billTo}</p>
              )}
            </div>
            <div>
              <p className="text-[13px] font-semibold text-ink-900">
                Ship To <span className="font-normal text-muted">(optional)</span>
              </p>
              {edit ? (
                <textarea
                  className={`${box} mt-1 min-h-28`}
                  value={values.shipTo}
                  onChange={(e) => set({ shipTo: e.target.value })}
                  rows={5}
                />
              ) : values.shipTo.trim() ? (
                <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-ink-900">{values.shipTo}</p>
              ) : null}
            </div>
          </div>
        </div>
        <div className="space-y-2 text-sm">
          <MetaRow label="Date" edit={edit} value={values.issuedOn} display={formatInvoiceDate(values.issuedOn)} type="date" onChange={(v) => set({ issuedOn: v })} />
          <MetaRow label="Due Date" edit={edit} value={values.dueOn} display={formatInvoiceDate(values.dueOn)} type="date" onChange={(v) => set({ dueOn: v })} />
          <MetaRow label="PO Number" edit={edit} value={values.poNumber} display={values.poNumber} onChange={(v) => set({ poNumber: v })} />
        </div>
      </div>

      <div className="mt-8 overflow-x-auto rounded-[5px] border border-ink-900">
        <div className="min-w-[640px]">
        <div className="grid grid-cols-[1fr_88px_120px_120px] bg-ink-900 px-3 py-2.5 text-[13px] font-semibold text-white">
          <span>Item</span>
          <span>Quantity</span>
          <span>Rate</span>
          <span className="text-right">Amount</span>
        </div>
        {values.lines.map((line, i) => (
          <div key={i} className="group grid grid-cols-[1fr_88px_120px_120px] items-stretch gap-0 border-t border-[#e5e7eb]">
            {edit ? (
              <>
                <textarea
                  className="min-h-16 resize-y border-0 px-3 py-2 text-sm outline-none focus:bg-surface-2"
                  placeholder="Description of service or item"
                  value={line.description}
                  onChange={(e) => setLine(i, { description: e.target.value })}
                />
                <input
                  className="border-l border-[#e5e7eb] px-2 text-center text-sm outline-none"
                  type="number"
                  min={0}
                  step="0.01"
                  value={line.qty}
                  onChange={(e) => setLine(i, { qty: Number(e.target.value) })}
                  aria-label="Quantity"
                />
                <div className="flex items-center border-l border-[#e5e7eb] px-2 text-sm">
                  <span className="mr-1 text-muted">KSh</span>
                  <input
                    className="w-full outline-none"
                    type="number"
                    min={0}
                    step="0.01"
                    value={line.unit}
                    onChange={(e) => setLine(i, { unit: Number(e.target.value) })}
                    aria-label="Rate"
                  />
                </div>
                <div className="relative flex items-center justify-end border-l border-[#e5e7eb] px-3 text-sm tabular-nums">
                  {formatKesMoney(lineAmount(line))}
                  <button
                    type="button"
                    className="absolute -right-2 top-1 hidden h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-ink-900 text-xs text-white group-hover:flex"
                    onClick={() =>
                      set({
                        lines:
                          values.lines.length <= 1
                            ? [{ description: "", qty: 1, unit: 0 }]
                            : values.lines.filter((_, idx) => idx !== i),
                      })
                    }
                    aria-label="Remove line"
                  >
                    ×
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="whitespace-pre-wrap px-3 py-3 text-sm">{line.description}</p>
                <p className="px-2 py-3 text-center text-sm tabular-nums">{line.qty}</p>
                <p className="px-2 py-3 text-sm tabular-nums">{formatKesMoney(line.unit)}</p>
                <p className="px-3 py-3 text-right text-sm tabular-nums">{formatKesMoney(lineAmount(line))}</p>
              </>
            )}
          </div>
        ))}
        </div>
      </div>
      {edit ? (
        <button
          type="button"
          className="invoice-chrome w-full cursor-pointer rounded-b-[5px] bg-[#eef0f3] py-2.5 text-sm font-medium text-ink-900 hover:bg-[#e4e7ec]"
          onClick={() => set({ lines: [...values.lines, { description: "", qty: 1, unit: 0 }] })}
        >
          + Line Item
        </button>
      ) : null}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_280px]">
        <div className="space-y-5">
          <div>
            <p className="text-[13px] font-semibold text-ink-900">Service Specifications</p>
            {edit ? (
              <textarea
                className={`${box} mt-1 min-h-24`}
                value={values.specs}
                onChange={(e) => set({ specs: e.target.value })}
              />
            ) : values.specs ? (
              <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-body">{values.specs}</p>
            ) : null}
          </div>
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-ink-900">Payment advice</p>
            {edit ? (
              <textarea
                className={`${box} mt-1 min-h-28`}
                value={values.paymentAdvice}
                onChange={(e) => set({ paymentAdvice: e.target.value })}
              />
            ) : (
              <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-body">{values.paymentAdvice}</p>
            )}
          </div>
          {edit ? (
            <textarea
              className={`${ghost} min-h-12 italic`}
              value={values.thankYou}
              onChange={(e) => set({ thankYou: e.target.value })}
              aria-label="Closing note"
            />
          ) : values.thankYou ? (
            <p className="text-sm italic text-ink-900">{values.thankYou}</p>
          ) : null}
        </div>

        <div className="text-sm">
          <Row label="Subtotal" value={formatKesMoney(values.subtotal)} />
          {values.showDiscount ? (
            <div className="flex items-center justify-between gap-2 border-b border-[#e5e7eb] py-2">
              <span>Discount</span>
              {edit ? (
                <span className="flex items-center gap-1">
                  <select
                    className="rounded-[5px] border border-[#e5e7eb] px-1 py-1 text-xs"
                    value={values.discountKind}
                    onChange={(e) => set({ discountKind: e.target.value as "amount" | "percent" })}
                    aria-label="Discount type"
                  >
                    <option value="amount">KSh</option>
                    <option value="percent">%</option>
                  </select>
                  <input
                    className="w-24 rounded-[5px] border border-[#e5e7eb] px-2 py-1 text-right"
                    type="number"
                    min={0}
                    step="0.01"
                    value={values.discountValue}
                    onChange={(e) => set({ discountValue: Number(e.target.value) })}
                    aria-label="Discount"
                  />
                  <button type="button" className="cursor-pointer text-muted" onClick={() => set({ showDiscount: false, discountValue: 0 })} aria-label="Remove discount">
                    ×
                  </button>
                </span>
              ) : (
                <span className="tabular-nums">-{formatKesMoney(values.discount)}</span>
              )}
            </div>
          ) : null}
          {values.showTax ? (
            <div className="flex items-center justify-between gap-2 border-b border-[#e5e7eb] py-2">
              <span>Tax</span>
              {edit ? (
                <span className="flex items-center gap-1">
                  <input
                    className="w-16 rounded-[5px] border border-[#e5e7eb] px-2 py-1 text-right"
                    type="number"
                    min={0}
                    step="0.01"
                    value={values.taxPercent}
                    onChange={(e) => set({ taxPercent: Number(e.target.value) })}
                    aria-label="Tax percent"
                  />
                  <span className="text-muted">%</span>
                  <span className="w-20 text-right tabular-nums">{formatKesMoney(values.tax)}</span>
                  <button type="button" className="cursor-pointer text-muted" onClick={() => set({ showTax: false, taxPercent: 0 })} aria-label="Remove tax">
                    ×
                  </button>
                </span>
              ) : (
                <span className="tabular-nums">{formatKesMoney(values.tax)}</span>
              )}
            </div>
          ) : null}
          {values.showShipping ? (
            <div className="flex items-center justify-between gap-2 border-b border-[#e5e7eb] py-2">
              <span>Shipping</span>
              {edit ? (
                <span className="flex items-center gap-1">
                  <input
                    className="w-24 rounded-[5px] border border-[#e5e7eb] px-2 py-1 text-right"
                    type="number"
                    min={0}
                    step="0.01"
                    value={values.shipping}
                    onChange={(e) => set({ shipping: Number(e.target.value) })}
                    aria-label="Shipping"
                  />
                  <button type="button" className="cursor-pointer text-muted" onClick={() => set({ showShipping: false, shipping: 0 })} aria-label="Remove shipping">
                    ×
                  </button>
                </span>
              ) : (
                <span className="tabular-nums">{formatKesMoney(values.shipping)}</span>
              )}
            </div>
          ) : null}
          {edit ? (
            <div className="flex flex-wrap gap-x-4 gap-y-1 py-2 text-[13px] font-medium">
              {!values.showDiscount ? (
                <button type="button" className="cursor-pointer text-brand-600 hover:text-brand-700" onClick={() => set({ showDiscount: true })}>
                  + Discount
                </button>
              ) : null}
              {!values.showTax ? (
                <button type="button" className="cursor-pointer text-brand-600 hover:text-brand-700" onClick={() => set({ showTax: true, taxPercent: values.taxPercent || 16 })}>
                  + Tax
                </button>
              ) : null}
              {!values.showShipping ? (
                <button type="button" className="cursor-pointer text-brand-600 hover:text-brand-700" onClick={() => set({ showShipping: true })}>
                  + Shipping
                </button>
              ) : null}
            </div>
          ) : null}
          <div className="flex items-center justify-between py-2 font-semibold">
            <span>Total</span>
            <span className="tabular-nums">{formatKesMoney(values.total)}</span>
          </div>
          <div className="flex items-center justify-between gap-2 border-t border-[#e5e7eb] py-2">
            <span>Amount Paid</span>
            {edit ? (
              <span className="flex items-center gap-1">
                <span className="text-muted">KSh</span>
                <input
                  className="w-28 rounded-[5px] border border-[#e5e7eb] px-2 py-1 text-right"
                  type="number"
                  min={0}
                  step="0.01"
                  value={values.amountPaid}
                  onChange={(e) => set({ amountPaid: Number(e.target.value) })}
                  aria-label="Amount paid"
                />
              </span>
            ) : (
              <span className="tabular-nums">{formatKesMoney(values.amountPaid)}</span>
            )}
          </div>
          <div className="flex items-center justify-between py-2 font-display text-base font-bold">
            <span>Balance Due</span>
            <span className="tabular-nums">{formatKesMoney(values.balance)}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

function MetaRow({
  label,
  value,
  display,
  edit,
  type = "text",
  onChange,
}: {
  label: string;
  value: string;
  display: string;
  edit: boolean;
  type?: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="grid grid-cols-[88px_1fr] items-center gap-2">
      <span className="text-ink-900">{label}</span>
      {edit ? (
        <input
          className={`${box} text-right`}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <span className="text-right">{display || "—"}</span>
      )}
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-[#e5e7eb] py-2">
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}
