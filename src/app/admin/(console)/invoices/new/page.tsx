import { InvoiceEditor } from "@/components/admin/InvoiceEditor";
import { createClient } from "@/lib/supabase/server";
import { getSettings } from "@/lib/cms";
import { redirect } from "next/navigation";

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ lead?: string }>;
}) {
  const { lead: leadId } = await searchParams;
  const settings = await getSettings();
  if (!settings) redirect("/admin");
  const supabase = await createClient();
  const { data: lead } = leadId
    ? await supabase.from("leads").select("id, name, email, phone, company").eq("id", leadId).maybeSingle()
    : { data: null };
  const { data: clients } = await supabase.from("clients").select("id, name, billing_email, phone, kra_pin").order("name");
  return (
    <InvoiceEditor settings={settings} lead={lead} clients={clients ?? []} />
  );
}
