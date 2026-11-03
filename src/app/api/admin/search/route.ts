import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStaff } from "@/lib/cms";

const MAX_HITS = 12;

type Hit = { href: string; title: string; hint: string };

export async function GET(request: Request) {
  const staff = await getStaff();
  if (!staff) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const q = (new URL(request.url).searchParams.get("q") ?? "").trim().slice(0, 80);
  if (q.length < 2) return NextResponse.json({ hits: [] });

  // PostgREST filter syntax treats these as operators inside `.or()`.
  const safe = q.replace(/[%,()*\\"]/g, " ").trim();
  if (safe.length < 2) return NextResponse.json({ hits: [] });
  const like = `%${safe}%`;

  const supabase = await createClient();
  const [leads, invoices, clients, products, events, articles, work] = await Promise.all([
    supabase
      .from("leads")
      .select("id, name, email, company")
      .or(`name.ilike.${like},email.ilike.${like},company.ilike.${like}`)
      .order("created_at", { ascending: false })
      .limit(4),
    supabase
      .from("invoices")
      .select("id, number, bill_name")
      .or(`number.ilike.${like},bill_name.ilike.${like}`)
      .order("created_at", { ascending: false })
      .limit(4),
    supabase.from("clients").select("id, name").ilike("name", like).limit(3),
    supabase.from("products").select("id, title").ilike("title", like).limit(3),
    supabase.from("events").select("id, title").ilike("title", like).limit(3),
    supabase.from("articles").select("id, title").ilike("title", like).limit(3),
    supabase.from("case_studies").select("id, title").ilike("title", like).limit(3),
  ]);

  const groups: Hit[][] = [
    (leads.data ?? []).map((r) => ({ href: `/console/leads/${r.id}`, title: r.name || r.email, hint: "Enquiry" })),
    (invoices.data ?? []).map((r) => ({
      href: `/console/invoices/${r.id}`,
      title: r.bill_name ? `${r.number} · ${r.bill_name}` : r.number,
      hint: "Invoice",
    })),
    (clients.data ?? []).map((r) => ({ href: `/console/clients/${r.id}`, title: r.name, hint: "Client" })),
    (products.data ?? []).map((r) => ({ href: `/console/products/${r.id}`, title: r.title, hint: "Product" })),
    (events.data ?? []).map((r) => ({ href: `/console/events/${r.id}`, title: r.title, hint: "Event" })),
    (articles.data ?? []).map((r) => ({ href: `/console/insights/${r.id}`, title: r.title, hint: "Blog post" })),
    (work.data ?? []).map((r) => ({ href: `/console/work/${r.id}`, title: r.title, hint: "Case study" })),
  ];

  const taken = groups.map(() => 0);
  let total = 0;
  for (let round = 0; total < MAX_HITS && groups.some((g) => g.length > round); round++) {
    groups.forEach((group, i) => {
      if (group[round] && total < MAX_HITS) {
        taken[i] += 1;
        total += 1;
      }
    });
  }
  const hits = groups.flatMap((group, i) => group.slice(0, taken[i]));

  return NextResponse.json({ hits });
}
