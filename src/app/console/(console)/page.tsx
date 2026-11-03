import { Banknote, Plus, Receipt, Ticket } from "lucide-react";
import { AdminBtn } from "@/components/admin/ui";
import { ActivityChart } from "@/components/admin/overview/ActivityChart";
import { KpiCard } from "@/components/admin/overview/KpiCard";
import {
  AttentionCard,
  PipelineCard,
  PublishingCard,
  RecentEnquiriesCard,
  TransactionsCard,
  UpcomingEventsCard,
} from "@/components/admin/overview/cards";
import { trend } from "@/components/admin/overview/format";
import { getStaff } from "@/lib/cms";
import { formatKes } from "@/lib/constants";
import { getOverview } from "@/lib/desk";

const TZ = "Africa/Nairobi";

function heading(fullName: string | undefined) {
  const now = new Date();
  const hour = Number(new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "numeric", hourCycle: "h23" }).format(now));
  const part = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const first = fullName?.trim().split(/\s+/)[0];
  return {
    greeting: first ? `${part}, ${first}` : part,
    date: new Intl.DateTimeFormat("en-GB", { timeZone: TZ, weekday: "long", day: "numeric", month: "long" }).format(now),
  };
}

export default async function ConsoleOverviewPage() {
  const [profile, data] = await Promise.all([getStaff(), getOverview()]);
  const { greeting, date } = heading(profile?.full_name);
  const enquiries = trend(data.enquiries.current, data.enquiries.previous);
  const revenue = trend(data.revenue.current, data.revenue.previous);
  const last14 = data.series.slice(-14);

  return (
    <div className="space-y-4">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h1 className="font-display text-2xl font-semibold text-ink-900">{greeting}</h1>
          <p className="text-sm text-muted">{date}</p>
        </div>
        <AdminBtn href="/console/invoices/new" icon={<Plus aria-hidden />}>
          New invoice
        </AdminBtn>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="New enquiries"
          value={data.enquiries.current}
          trend={enquiries.text}
          tone={enquiries.tone}
          href="/console/leads"
          series={last14.map((p) => p.enquiries)}
        />
        <KpiCard
          label="Revenue, 7 days"
          value={formatKes(data.revenue.current)}
          trend={revenue.text}
          tone={revenue.tone}
          href="/console/orders"
          series={last14.map((p) => p.revenue)}
        />
        <KpiCard
          label="Outstanding"
          value={formatKes(data.outstanding.total)}
          trend={
            data.outstanding.count === 0
              ? "No open invoices"
              : `${data.outstanding.count} open${data.outstanding.overdue ? ` · ${data.outstanding.overdue} overdue` : ""}`
          }
          tone={data.outstanding.overdue ? "down" : "neutral"}
          href="/console/invoices"
          icon={data.outstanding.overdue ? <Receipt className="h-4 w-4" /> : <Banknote className="h-4 w-4" />}
        />
        <KpiCard
          label="Tickets sold"
          value={data.tickets.sold}
          trend={
            data.tickets.events === 0
              ? "No upcoming events"
              : `For ${data.tickets.events} upcoming ${data.tickets.events === 1 ? "event" : "events"}`
          }
          href="/console/events"
          icon={<Ticket className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <ActivityChart series={data.series} />
        <PipelineCard funnel={data.funnel} lines={data.lines} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <UpcomingEventsCard events={data.upcoming} />
        <RecentEnquiriesCard leads={data.recentLeads} />
        <TransactionsCard transactions={data.transactions} className="md:col-span-2 xl:col-span-1" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <AttentionCard queue={data.queue} total={data.queueTotal} className="lg:col-span-2" />
        <PublishingCard published={data.published} drafts={data.drafts} />
      </div>
    </div>
  );
}
