import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSettings } from "@/lib/cms";
import { publicMediaUrl } from "@/lib/constants";
import { company } from "@/lib/content";
import { invoiceViewModel } from "@/lib/invoice";
import { InvoiceDocument } from "@/components/invoice/InvoiceDocument";
import { AdminBtn } from "@/components/admin/ui";
import { PrintInvoiceButton } from "@/components/admin/money/PrintInvoiceButton";
import { docBanner } from "@/components/admin/money/format";

export default async function InvoicePrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: invoice } = await supabase.from("invoices").select("*").eq("id", id).maybeSingle();
  if (!invoice) notFound();
  const [{ data: items }, settings] = await Promise.all([
    supabase.from("invoice_items").select("*").eq("invoice_id", id).order("sort_order"),
    getSettings(),
  ]);
  const logo = publicMediaUrl(settings?.logo_path) || `${company.domain}/email-logo.png`;
  const view = invoiceViewModel(invoice, items ?? [], settings);
  const values = { ...view, banner: docBanner(invoice.status, view.total, view.balance) };

  return (
    <div className="mx-auto max-w-[800px]">
      <div className="desk-chrome mb-4 flex items-center justify-between gap-3">
        <AdminBtn variant="ghost" href={`/console/invoices/${invoice.id}`}>
          Back to {invoice.number}
        </AdminBtn>
        <PrintInvoiceButton />
      </div>
      <div className="rounded-[5px] bg-[#eceef2] p-4 print:bg-white print:p-0">
        <InvoiceDocument mode="view" logo={logo} values={values} />
      </div>
    </div>
  );
}
