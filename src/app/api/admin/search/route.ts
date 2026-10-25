import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStaff } from "@/lib/cms";

export async function GET(request: Request) {
  const staff = await getStaff();
  if (!staff) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ hits: [] });

  const supabase = await createClient();
  const like = `%${q}%`;
  const [leads, invoices, products, work, events] = await Promise.all([
    supabase.from("leads").select("id, name, email, company").or(`name.ilike.${like},email.ilike.${like},company.ilike.${like}`).limit(6),
    supabase.from("invoices").select("id, number, bill_name").or(`number.ilike.${like},bill_name.ilike.${like}`).limit(6),
    supabase.from("products").select("id, title").ilike("title", like).limit(5),
    supabase.from("case_studies").select("id, title").ilike("title", like).limit(5),
    supabase.from("events").select("id, title").ilike("title", like).limit(5),
  ]);

  const hits = [
    ...(leads.data ?? []).map((r) => ({ href: `/admin/leads/${r.id}`, title: r.name, hint: r.company || r.email })),
    ...(invoices.data ?? []).map((r) => ({ href: `/admin/invoices/${r.id}`, title: r.number, hint: r.bill_name })),
    ...(products.data ?? []).map((r) => ({ href: `/admin/products/${r.id}`, title: r.title, hint: "Product" })),
    ...(work.data ?? []).map((r) => ({ href: `/admin/work/${r.id}`, title: r.title, hint: "Work" })),
    ...(events.data ?? []).map((r) => ({ href: `/admin/events/${r.id}`, title: r.title, hint: "Event" })),
  ];

  return NextResponse.json({ hits });
}
