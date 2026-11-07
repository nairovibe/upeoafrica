import { createClient } from "@/lib/supabase/server";
import { AdminBtn, AdminPage, FilterTabs } from "@/components/admin/ui";
import { MailingList } from "@/components/admin/newsletter/MailingList";

const TABS = [
  { id: "subscribed", label: "Subscribed" },
  { id: "unsubscribed", label: "Unsubscribed" },
  { id: "all", label: "All" },
] as const;

type Search = { filter?: string; q?: string };

export default async function NewsletterPage({ searchParams }: { searchParams: Promise<Search> }) {
  const params = await searchParams;
  const filter = TABS.some((tab) => tab.id === params.filter) ? (params.filter as (typeof TABS)[number]["id"]) : "subscribed";
  const q = typeof params.q === "string" ? params.q.trim().slice(0, 80) : "";
  const term = q.replace(/[%_*,()\\"':]/g, " ").trim().toLowerCase();

  const supabase = await createClient();
  let list = supabase.from("newsletter_subscribers").select("id, email, status, source, created_at, unsubscribed_at");
  let tally = supabase.from("newsletter_subscribers").select("status");
  if (term) {
    list = list.ilike("email", `%${term}%`);
    tally = tally.ilike("email", `%${term}%`);
  }
  if (filter !== "all") list = list.eq("status", filter);

  const [{ data }, { data: statuses }] = await Promise.all([
    list.order("created_at", { ascending: false }).limit(500),
    tally,
  ]);

  const counts: Record<string, number> = { all: 0, subscribed: 0, unsubscribed: 0 };
  for (const row of statuses ?? []) {
    counts.all += 1;
    counts[row.status] = (counts[row.status] ?? 0) + 1;
  }

  const hrefFor = (id: string) => {
    const sp = new URLSearchParams();
    if (id !== "subscribed") sp.set("filter", id);
    if (q) sp.set("q", q);
    const qs = sp.toString();
    return qs ? `/console/newsletter?${qs}` : "/console/newsletter";
  };

  const exportHref = filter === "all" ? "/console/newsletter/export" : `/console/newsletter/export?status=${filter}`;

  return (
    <AdminPage
      title="Mailing list"
      hint="Addresses from the footer, plus any you add here. Send a live article, an event, or a short note. Export stays available for a copy of the list."
      action={<AdminBtn href="/console/newsletter/compose">Send</AdminBtn>}
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <FilterTabs
          active={filter}
          items={TABS.map((tab) => ({ id: tab.id, label: tab.label, href: hrefFor(tab.id), count: counts[tab.id] ?? 0 }))}
        />
        <form action="/console/newsletter" method="get" className="flex items-center gap-2">
          <label htmlFor="mailing-search" className="sr-only">
            Search addresses
          </label>
          <input
            id="mailing-search"
            name="q"
            defaultValue={q}
            placeholder="Search email"
            className="h-9 w-full rounded-[5px] border border-line bg-white px-3 text-sm text-ink-900 outline-none focus:border-brand-500 sm:w-56"
          />
          {filter !== "subscribed" ? <input type="hidden" name="filter" value={filter} /> : null}
          <button
            type="submit"
            className="inline-flex h-9 cursor-pointer items-center rounded-[5px] border border-line bg-white px-3 text-[13px] font-medium text-ink-900 hover:bg-surface-3"
          >
            Search
          </button>
        </form>
      </div>
      <MailingList
        rows={data ?? []}
        exportHref={exportHref}
        empty={q ? "No addresses match this search." : "No addresses in this view."}
      />
    </AdminPage>
  );
}
