"use client";

import { Fragment, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Lead } from "@/lib/cms";
import { AdminBtn, EmptyRow, Pill, TableHead } from "@/components/admin/ui";
import { LeadStatus } from "@/components/admin/LeadStatus";
import { LeadAnswers, SourceInfo } from "@/components/admin/leads/LeadAnswers";
import { QuickContact } from "@/components/admin/leads/QuickContact";
import {
  formName,
  leadAnswers,
  leadMessage,
  leadUtm,
  sourceLabel,
  sourceTone,
  statusTone,
} from "@/components/admin/leads/data";
import { cn } from "@/lib/utils";

export type LeadRow = { lead: Lead; age: string; received: string; late: boolean };

const HEADERS = ["Received", "Name", "Source", "Services", "Budget", "Clock", "Status"];

export function LeadTable({ rows, empty }: { rows: LeadRow[]; empty: string }) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="overflow-x-auto rounded-[5px] border border-line bg-white">
      <table className="w-full min-w-[880px] text-left text-sm">
        <TableHead headers={[...HEADERS, <span key="d" className="sr-only">Details</span>]} />
        <tbody>
          {rows.length === 0 ? (
            <EmptyRow colSpan={HEADERS.length + 1}>{empty}</EmptyRow>
          ) : null}
          {rows.map(({ lead, age, received, late }) => {
            const isOpen = open === lead.id;
            const panelId = `lead-peek-${lead.id}`;
            const toggle = () => setOpen(isOpen ? null : lead.id);
            return (
              <Fragment key={lead.id}>
                <tr
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest("a,button,select,input,textarea")) return;
                    toggle();
                  }}
                  className={cn(
                    "cursor-pointer border-b border-line transition-colors duration-150",
                    isOpen ? "bg-surface-2" : "hover:bg-surface-2",
                  )}
                >
                  <td className="whitespace-nowrap px-4 py-3 tabular-nums text-body" title={received}>
                    {age}
                  </td>
                  <td className="max-w-[220px] px-4 py-3">
                    <p className="truncate font-medium text-ink-900">{lead.name}</p>
                    {lead.company ? <p className="truncate text-xs text-muted">{lead.company}</p> : null}
                  </td>
                  <td className="px-4 py-3">
                    <Pill tone={sourceTone(lead.source)}>{sourceLabel(lead.source)}</Pill>
                  </td>
                  <td className="max-w-[220px] px-4 py-3">
                    <p className="truncate text-body">{(lead.services ?? []).join(", ") || "-"}</p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-body">{lead.budget || "-"}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {late ? (
                      <span className="text-xs font-medium text-brand-700">Past 24h</span>
                    ) : (
                      <span className="text-xs text-muted">On time</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Pill tone={statusTone(lead.status)}>{lead.status}</Pill>
                  </td>
                  <td className="px-2 py-3 text-right">
                    <button
                      type="button"
                      onClick={toggle}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      aria-label={`${isOpen ? "Hide" : "Show"} what ${lead.name} sent`}
                      className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-[5px] text-muted hover:bg-surface-3 hover:text-ink-900"
                    >
                      <ChevronDown
                        className={cn("h-4 w-4 transition-transform duration-200", isOpen && "rotate-180")}
                        aria-hidden
                      />
                    </button>
                  </td>
                </tr>
                {isOpen ? (
                  <tr id={panelId} className="border-b border-line bg-surface-2">
                    <td colSpan={HEADERS.length + 1} className="px-4 pb-4 pt-1">
                      <LeadPeek lead={lead} received={received} />
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function LeadPeek({ lead, received }: { lead: Lead; received: string }) {
  return (
    <div className="grid gap-4 rounded-[5px] border border-line bg-white p-5 lg:grid-cols-[1fr_300px]">
      <div className="min-w-0">
        <h3 className="font-display text-[15px] font-semibold text-ink-900">{formName(lead)}</h3>
        <div className="mt-3">
          <LeadAnswers answers={leadAnswers(lead)} message={leadMessage(lead)} />
        </div>
      </div>
      <div className="space-y-4 lg:border-l lg:border-line lg:pl-5">
        <QuickContact email={lead.email} phone={lead.phone} />
        <SourceInfo
          pageUrl={lead.page_url}
          referrer={lead.referrer}
          utm={leadUtm(lead)}
          received={received}
        />
        <div className="flex flex-wrap items-center gap-2 border-t border-line pt-4">
          <LeadStatus id={lead.id} value={lead.status} />
          <AdminBtn variant="ghost" href={`/console/leads/${lead.id}`}>
            Open record
          </AdminBtn>
          <AdminBtn href={`/console/leads/${lead.id}#reply`}>Reply</AdminBtn>
        </div>
      </div>
    </div>
  );
}
