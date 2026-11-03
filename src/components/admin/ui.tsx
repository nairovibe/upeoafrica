import Link from "next/link";
import { cn } from "@/lib/utils";

export function AdminPage({
  title,
  hint,
  action,
  children,
}: {
  title: string;
  hint?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-900">{title}</h1>
          {hint ? <p className="mt-1 max-w-2xl text-sm text-body">{hint}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

export function AdminBtn({
  href,
  children,
  variant = "primary",
  type,
  onClick,
  disabled,
}: {
  href?: string;
  children: React.ReactNode;
  variant?: "primary" | "ghost" | "ink";
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
}) {
  const cls = cn(
    "inline-flex h-9 cursor-pointer items-center justify-center px-3.5 text-[13px] font-medium transition-colors duration-200 disabled:pointer-events-none disabled:opacity-50",
    variant === "primary" && "bg-brand-500 text-white hover:bg-brand-600",
    variant === "ink" && "bg-ink-900 text-white hover:bg-brand-500",
    variant === "ghost" && "border border-line bg-white text-ink-900 hover:bg-surface-3",
  );
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type ?? "button"} onClick={onClick} disabled={disabled} className={cls}>
      {children}
    </button>
  );
}

export function AdminTable({
  headers,
  rows,
  empty,
}: {
  headers: string[];
  rows: React.ReactNode[][];
  empty: string;
}) {
  if (rows.length === 0) {
    return (
      <p className="border border-line bg-white px-4 py-10 text-center text-sm text-muted rounded-[5px]">
        {empty}
      </p>
    );
  }
  return (
    <div className="overflow-x-auto border border-line bg-white rounded-[5px]">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-line text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
            {headers.map((h) => (
              <th key={h} className="px-4 py-3 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-line last:border-0">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 align-middle text-ink-900">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block" htmlFor={htmlFor}>
      <span className="mb-1.5 block text-[13px] font-medium text-ink-900">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-muted">{hint}</span> : null}
    </label>
  );
}

export const inputClass =
  "w-full rounded-[5px] border border-line bg-white px-3 py-2.5 text-sm text-ink-900 outline-none transition-[border-color] duration-200 focus:border-brand-500";
