import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSettings } from "@/lib/cms";
import { publicMediaUrl } from "@/lib/constants";
import { company } from "@/lib/content";
import { invoiceViewModel } from "@/lib/invoice";
import { InvoiceDocument } from "@/components/invoice/InvoiceDocument";
import { PrintButton } from "@/components/admin/PrintButton";

export default async function InvoicePrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: invoice } = await supabase.from("invoices").select("*").eq("id", id).maybeSingle();
  if (!invoice) notFound();
  const { data: items } = await supabase.from("invoice_items").select("*").eq("invoice_id", id).order("sort_order");
  const settings = await getSettings();
  const logo = publicMediaUrl(settings?.logo_path) || `${company.domain}/email-logo.png`;
  const values = invoiceViewModel(invoice, items ?? [], settings);

  return (
    <div className="mx-auto max-w-[800px] bg-[#eceef2] p-4 print:bg-white print:p-0">
      <InvoiceDocument mode="view" logo={logo} values={values} />
      <PrintButton />
    </div>
  );
}
