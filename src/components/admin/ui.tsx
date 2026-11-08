import Link from "next/link";
import { cn } from "@/lib/utils";
import { LinkPending, Spinner } from "@/components/admin/pending";

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
  pending,
  icon,
  className,
}: {
  href?: string;
  children: React.ReactNode;
  variant?: "primary" | "ghost" | "ink" | "danger";
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
  /** Shows a spinner and blocks clicks while the action runs. */
  pending?: boolean;
  /** Leading icon element, e.g. <Plus />. Swapped for a spinner while pending. */
  icon?: React.ReactNode;
  className?: string;
}) {
  const cls = cn(
    "inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-[5px] px-3.5 text-[13px] font-medium transition-colors duration-200 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:h-3.5 [&_svg]:w-3.5",
    variant === "primary" && "bg-brand-500 text-white hover:bg-brand-600",
    variant === "ink" && "bg-ink-900 text-white hover:bg-brand-500",
    variant === "ghost" && "border border-line bg-white text-ink-900 hover:bg-surface-3",
    variant === "danger" && "border border-red-200 bg-white text-red-700 hover:bg-red-50",
    pending && "cursor-wait opacity-80",
    className,
  );
  if (href) {
    return (
      <Link href={href} className={cls}>
        <LinkPending icon={icon} />
        {children}
      </Link>
    );
  }
  return (
    <button
      type={type ?? "button"}
      onClick={onClick}
      disabled={disabled || pending}
      aria-busy={pending || undefined}
      className={cls}
    >
      {pending ? <Spinner /> : icon}
      {children}
    </button>
  );
}

export function TableHead({ headers }: { headers: React.ReactNode[] }) {
  return (
    <thead>
      <tr className="border-b border-line bg-surface-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
        {headers.map((h, i) => (
          <th key={i} className="whitespace-nowrap px-4 py-3 font-semibold">
            {h}
          </th>
        ))}
      </tr>
    </thead>
  );
}

/** Table body row shown when there is nothing to list; headers stay visible above it. */
export function EmptyRow({ colSpan, children, action }: { colSpan: number; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-14 text-center">
        <p className="text-sm text-muted">{children}</p>
        {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
      </td>
    </tr>
  );
}

export function AdminTable({
  headers,
  rows,
  empty,
  emptyAction,
  minWidth = 640,
}: {
  headers: React.ReactNode[];
  rows: React.ReactNode[][];
  empty: React.ReactNode;
  emptyAction?: React.ReactNode;
  minWidth?: number;
}) {
  return (
    <div className="overflow-x-auto rounded-[5px] border border-line bg-white">
      <table className="w-full text-left text-sm" style={{ minWidth }}>
        <TableHead headers={headers} />
        <tbody>
          {rows.length === 0 ? (
            <EmptyRow colSpan={headers.length} action={emptyAction}>
              {empty}
            </EmptyRow>
          ) : (
            rows.map((row, i) => (
              <tr key={i} className="border-b border-line transition-colors duration-150 last:border-0 hover:bg-surface-2/60">
                {row.map((cell, j) => (
                  <td key={j} className="px-4 py-3 align-middle text-ink-900">
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          )}
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
    <label className="block min-w-0" htmlFor={htmlFor}>
      <span className="mb-1.5 block text-[13px] font-medium text-ink-900">{label}</span>
      {children}
      {hint ? <span className="mt-1 block break-words text-xs text-muted">{hint}</span> : null}
    </label>
  );
}

export function PublishStatus({
  value,
  onChange,
  disabled,
}: {
  value: "draft" | "live";
  onChange: (next: "draft" | "live") => void;
  disabled?: boolean;
}) {
  return (
    <Field label="Status">
      <select
        className={inputClass}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value === "live" ? "live" : "draft")}
      >
        <option value="draft">Draft</option>
        <option value="live">Live</option>
      </select>
    </Field>
  );
}

export function Panel({
  title,
  meta,
  action,
  flush,
  className,
  children,
}: {
  title?: React.ReactNode;
  meta?: React.ReactNode;
  action?: React.ReactNode;
  flush?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("rounded-[5px] border border-line bg-white", className)}>
      {title ? (
        <header className="flex flex-wrap items-start justify-between gap-3 px-4 pt-4 sm:px-5">
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-[15px] font-semibold text-ink-900">{title}</h2>
            {meta ? <p className="mt-0.5 break-words text-xs text-muted">{meta}</p> : null}
          </div>
          {action ? <div className="max-w-full">{action}</div> : null}
        </header>
      ) : null}
      <div className={cn(flush ? "mt-3" : "p-5", Boolean(title) && !flush && "pt-4")}>{children}</div>
    </section>
  );
}

export function Stat({
  label,
  value,
  trend,
  tone = "neutral",
  icon,
  href,
}: {
  label: string;
  value: React.ReactNode;
  trend?: React.ReactNode;
  tone?: "up" | "down" | "neutral";
  icon?: React.ReactNode;
  href?: string;
}) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] font-medium text-body">{label}</p>
        {icon ? (
          <span className="flex h-8 w-8 items-center justify-center rounded-[5px] bg-brand-50 text-brand-600">{icon}</span>
        ) : null}
      </div>
      <p className="mt-2 font-display text-[26px] font-semibold leading-none tabular-nums text-ink-900">{value}</p>
      {trend ? (
        <p
          className={cn(
            "mt-2 text-xs font-medium",
            tone === "up" && "text-emerald-600",
            tone === "down" && "text-red-600",
            tone === "neutral" && "text-muted",
          )}
        >
          {trend}
        </p>
      ) : null}
    </>
  );
  const cls = "block rounded-[5px] border border-line bg-white p-5 transition-colors duration-150";
  return href ? (
    <Link href={href} className={cn(cls, "hover:border-brand-300")}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

const PILL_TONES = {
  neutral: "bg-surface-3 text-body",
  brand: "bg-brand-50 text-brand-700",
  success: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-700",
  danger: "bg-red-50 text-red-700",
  ink: "bg-ink-900 text-white",
} as const;

export type PillTone = keyof typeof PILL_TONES;

export function Pill({ tone = "neutral", children }: { tone?: PillTone; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[5px] px-2 py-0.5 text-[11px] font-semibold capitalize",
        PILL_TONES[tone],
      )}
    >
      {children}
    </span>
  );
}

export function FilterTabs({
  items,
  active,
}: {
  items: { id: string; label: string; href: string; count?: number }[];
  active: string;
}) {
  return (
    <nav
      aria-label="Filter"
      className="inline-flex max-w-full overflow-x-auto rounded-[5px] border border-line bg-white"
    >
      {items.map((item) => {
        const on = active === item.id;
        return (
          <Link
            key={item.id}
            href={item.href}
            scroll={false}
            aria-current={on ? "page" : undefined}
            className={cn(
              "relative inline-flex h-9 shrink-0 items-center gap-2 border-l border-line px-4 text-[13px] font-medium transition-colors duration-150 first:border-l-0",
              on ? "bg-brand-500 text-white" : "text-body hover:bg-surface-2 hover:text-ink-900",
            )}
          >
            {item.label}
            {item.count != null ? (
              <span
                className={cn(
                  "min-w-5 rounded-[4px] px-1.5 py-px text-center text-[11px] font-semibold tabular-nums",
                  on ? "bg-white/20 text-white" : "bg-surface-3 text-muted",
                )}
              >
                {item.count}
              </span>
            ) : null}
            <LinkPending />
          </Link>
        );
      })}
    </nav>
  );
}

export function EmptyState({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="rounded-[5px] border border-dashed border-line bg-white px-5 py-12 text-center">
      <p className="text-sm text-muted">{children}</p>
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}

export const inputClass =
  "w-full min-w-0 max-w-full rounded-[5px] border border-line bg-white px-3 py-2.5 text-sm text-ink-900 outline-none transition-[border-color] duration-200 focus:border-brand-500";
