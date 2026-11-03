import type { LeadAnswer } from "@/lib/lead-context";
import { cn } from "@/lib/utils";

export function LeadAnswers({ answers, message }: { answers: LeadAnswer[]; message: string | null }) {
  return (
    <div>
      {answers.length ? (
        <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
          {answers.map((a, i) => (
            <div key={`${a.label}-${i}`} className={cn("min-w-0", a.value.length > 90 && "sm:col-span-2")}>
              <dt className="text-xs text-muted">{a.label}</dt>
              <dd className="mt-0.5 whitespace-pre-wrap break-words text-sm text-ink-900">
                {a.value || <span className="text-muted">-</span>}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
      {message ? (
        <div className={cn(answers.length > 0 && "mt-4 border-t border-line pt-4")}>
          <p className="text-xs text-muted">Message</p>
          <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-ink-900">{message}</p>
        </div>
      ) : null}
      {!answers.length && !message ? <p className="text-sm text-muted">No answers saved.</p> : null}
    </div>
  );
}

export function SourceInfo({
  pageUrl,
  referrer,
  utm,
  received,
}: {
  pageUrl: string | null;
  referrer: string | null;
  utm: { key: string; value: string }[];
  received?: string;
}) {
  const rows: [string, React.ReactNode][] = [];
  if (received) rows.push(["Received", received]);
  rows.push(["Page", pageUrl ? <UrlLink href={pageUrl} /> : "-"]);
  rows.push(["Referrer", referrer ? <UrlLink href={referrer} /> : "Direct"]);
  rows.push([
    "UTM",
    utm.length ? (
      <span className="flex flex-wrap gap-1">
        {utm.map((u) => (
          <span key={u.key} className="rounded-[5px] bg-surface-3 px-1.5 py-0.5 text-[11px] text-body">
            {u.key}: {u.value}
          </span>
        ))}
      </span>
    ) : (
      "-"
    ),
  ]);
  return (
    <dl className="space-y-2 text-sm">
      {rows.map(([label, value]) => (
        <div key={label} className="grid grid-cols-[72px_1fr] gap-2">
          <dt className="text-xs leading-5 text-muted">{label}</dt>
          <dd className="min-w-0 text-ink-900">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function UrlLink({ href }: { href: string }) {
  let label = href;
  let safe = false;
  try {
    const url = new URL(href);
    label = `${url.host}${url.pathname === "/" ? "" : url.pathname}`;
    safe = url.protocol === "http:" || url.protocol === "https:";
  } catch {}
  if (!safe) return <span className="block truncate">{href}</span>;
  return (
    <a href={href} target="_blank" rel="noreferrer noopener" title={href} className="block truncate text-brand-600 hover:underline">
      {label}
    </a>
  );
}
