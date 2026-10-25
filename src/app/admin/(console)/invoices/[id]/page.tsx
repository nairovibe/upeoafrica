import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InvoiceEditor } from "@/components/admin/InvoiceEditor";
import { getSettings } from "@/lib/cms";
import { redirect } from "next/navigation";

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const settings = await getSettings();
  if (!settings) redirect("/admin");
  const supabase = await createClient();
  const { data: invoice } = await supabase.from("invoices").select("*").eq("id", id).maybeSingle();
  if (!invoice) notFound();
  const { data: items } = await supabase.from("invoice_items").select("*").eq("invoice_id", id).order("sort_order");
  const { data: clients } = await supabase.from("clients").select("id, name, billing_email, phone, kra_pin").order("name");
  return (
    <InvoiceEditor initial={invoice} items={items ?? []} settings={settings} clients={clients ?? []} />
  );
}
