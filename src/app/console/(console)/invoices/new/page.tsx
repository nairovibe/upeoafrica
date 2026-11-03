import { InvoiceEditor } from "@/components/admin/InvoiceEditor";
import { createClient } from "@/lib/supabase/server";
import { getSettings } from "@/lib/cms";

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ lead?: string; client?: string }>;
}) {
  const { lead: leadId, client: clientId } = await searchParams;
  const supabase = await createClient();
  const [settings, { data: lead }, { data: clients }] = await Promise.all([
    getSettings(),
    leadId
      ? supabase.from("leads").select("id, name, email, phone, company").eq("id", leadId).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase.from("clients").select("id, name, billing_email, phone, kra_pin").order("name"),
  ]);
  return <InvoiceEditor settings={settings} lead={lead} clients={clients ?? []} defaultClientId={clientId} />;
}
