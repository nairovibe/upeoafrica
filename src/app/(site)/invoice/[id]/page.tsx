import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { getPublicSettings } from "@/lib/cms";
import { publicMediaUrl } from "@/lib/constants";
import { company } from "@/lib/content";
import { invoiceViewModel } from "@/lib/invoice";
import { InvoiceDocument } from "@/components/invoice/InvoiceDocument";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Invoice",
  robots: { index: false, follow: false },
};

export default async function PublicInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const service = await createServiceClient();
  if (!service) notFound();
  const { data: invoice } = await service.from("invoices").select("*").eq("id", id).maybeSingle();
  if (!invoice || invoice.status === "draft" || invoice.status === "void") notFound();
  const { data: items } = await service.from("invoice_items").select("*").eq("invoice_id", id).order("sort_order");
  const settings = await getPublicSettings();
  const logo = publicMediaUrl(settings?.logo_path) || `${company.domain}/email-logo.png`;
  const values = invoiceViewModel(invoice, items ?? [], settings);

  return (
    <section className="bg-[#eceef2] py-16">
      <Container className="max-w-[800px]">
        <InvoiceDocument mode="view" logo={logo} values={values} />
      </Container>
    </section>
  );
}
