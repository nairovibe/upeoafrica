import { AdminPage } from "@/components/admin/ui";
import { BillingDesk } from "@/components/admin/BillingDesk";
import { billingCards } from "@/lib/billing";
import { getStaff } from "@/lib/cms";
import { company } from "@/lib/content";

export default async function BillingPage() {
  const staff = await getStaff();
  const owner = staff?.role === "owner";
  const cards = owner ? await billingCards() : [];
  const origin = process.env.NEXT_PUBLIC_SITE_URL || company.domain;

  return (
    <AdminPage
      title="Billing"
      hint="Payment methods offered on an invoice. Secrets are encrypted and are not shown again after you save them."
    >
      {owner ? (
        <BillingDesk cards={cards} origin={origin} />
      ) : (
        <p className="rounded-[5px] border border-line bg-white px-4 py-3 text-sm text-body">Only the owner can configure payment methods.</p>
      )}
    </AdminPage>
  );
}
