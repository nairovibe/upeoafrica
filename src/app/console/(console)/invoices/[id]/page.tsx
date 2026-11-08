import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InvoiceEditor } from "@/components/admin/InvoiceEditor";
import { getSettings } from "@/lib/cms";

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: invoice } = await supabase.from("invoices").select("*").eq("id", id).maybeSingle();
  if (!invoice) notFound();
  const [settings, { data: items }, { data: clients }, { data: payments }] = await Promise.all([
    getSettings(),
    supabase.from("invoice_items").select("*").eq("invoice_id", id).order("sort_order"),
    supabase.from("clients").select("id, name, billing_email, phone, kra_pin").is("deleted_at", null).order("name"),
    supabase
      .from("payments")
      .select("id, result, created_at")
      .eq("invoice_id", id)
      .order("created_at", { ascending: false }),
  ]);
  return (
    <InvoiceEditor
      initial={invoice}
      items={items ?? []}
      settings={settings}
      clients={clients ?? []}
      payments={payments ?? []}
    />
  );
}
