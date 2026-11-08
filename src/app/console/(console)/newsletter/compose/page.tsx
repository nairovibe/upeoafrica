import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getStaff } from "@/lib/cms";
import { AdminPage, Panel } from "@/components/admin/ui";
import { ComposeForm } from "@/components/admin/newsletter/ComposeForm";

export default async function ComposePage() {
  const supabase = await createClient();
  const staff = await getStaff();
  const canSend = staff?.role === "owner" || staff?.role === "editor";

  const [{ data: articles }, { data: events }, { count }, { data: campaigns }] = await Promise.all([
    supabase
      .from("articles")
      .select("id, title, excerpt")
      .is("deleted_at", null)
      .not("published_at", "is", null)
      .order("published_at", { ascending: false })
      .limit(30),
    supabase
      .from("events")
      .select("id, title, summary, starts_at")
      .is("deleted_at", null)
      .not("published_at", "is", null)
      .order("starts_at", { ascending: false })
      .limit(20),
    supabase.from("newsletter_subscribers").select("id", { count: "exact", head: true }).eq("status", "subscribed"),
    supabase
      .from("newsletter_campaigns")
      .select("id, kind, subject, sent_count, failed_count, created_at")
      .order("created_at", { ascending: false })
      .limit(12),
  ]);

  return (
    <AdminPage
      title="Send to the list"
      hint="Send a live article, a live event, or a short note. Only subscribed addresses are included, and each message has its own unsubscribe link. If the sending domain is not verified, delivery fails and the list stays subscribed."
      action={
        <Link href="/console/newsletter" className="text-sm font-medium text-brand-600 hover:text-brand-700">
          Back to the list
        </Link>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Panel title="This send">
          <ComposeForm
            canSend={canSend}
            subscribers={count ?? 0}
            articles={(articles ?? []).map((row) => ({ id: row.id, title: row.title, detail: row.excerpt }))}
            events={(events ?? []).map((row) => ({
              id: row.id,
              title: row.title,
              detail: row.summary || new Date(row.starts_at).toLocaleDateString("en-KE", { dateStyle: "medium" }),
            }))}
          />
        </Panel>
        <Panel title="Earlier sends">
          {(campaigns ?? []).length ? (
            <ul className="space-y-3">
              {(campaigns ?? []).map((row) => (
                <li key={row.id} className="border-b border-line pb-3 last:border-0 last:pb-0">
                  <p className="text-sm font-medium text-ink-900">{row.subject}</p>
                  <p className="mt-1 text-xs text-muted">
                    {row.kind} · {row.sent_count} sent
                    {row.failed_count ? ` · ${row.failed_count} failed` : ""} ·{" "}
                    {new Date(row.created_at).toLocaleString("en-KE", { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-body">Nothing has been sent from here yet.</p>
          )}
        </Panel>
      </div>
    </AdminPage>
  );
}
