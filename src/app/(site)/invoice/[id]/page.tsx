import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { getPublicSettings } from "@/lib/cms";
import { publicMediaUrl } from "@/lib/constants";
import { company } from "@/lib/content";
import { invoiceViewModel } from "@/lib/invoice";
import { invoiceBalance } from "@/lib/invoice-pay";
import { billingCards } from "@/lib/billing";
import { InvoiceDocument } from "@/components/invoice/InvoiceDocument";
import { InvoicePay } from "@/components/invoice/InvoicePay";
import { Container } from "@/components/ui/Container";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Invoice",
  robots: { index: false, follow: false },
};

export default async function PublicInvoicePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ pay?: string; paid?: string; error?: string; cancelled?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const service = await createServiceClient();
  if (!service) notFound();
  const { data: invoice } = await service.from("invoices").select("*").eq("id", id).maybeSingle();
  if (!invoice || invoice.status === "draft" || invoice.status === "void") notFound();
  const { data: items } = await service.from("invoice_items").select("*").eq("invoice_id", id).order("sort_order");
  const settings = await getPublicSettings();
  const logo = publicMediaUrl(settings?.logo_path) || `${company.domain}/email-logo.png`;
  const values = invoiceViewModel(invoice, items ?? [], settings);
  const methods = (await billingCards().catch(() => [])).filter((method) => method.enabled && method.configured);
  const balance = invoiceBalance(Number(invoice.total_kes), Number(invoice.amount_paid_kes || 0));

  return (
    <section className="bg-[#eceef2] py-16">
      <Container className="max-w-[800px]">
        <InvoiceDocument mode="view" logo={logo} values={values} />
        <InvoicePay
          invoiceId={invoice.id}
          balance={balance}
          methods={methods}
          focus={query.pay || ""}
          paid={query.paid === "1" || invoice.status === "paid"}
          cancelled={query.cancelled === "1"}
          failed={Boolean(query.error)}
        />
      </Container>
    </section>
  );
}
