"use client";

import { Printer } from "lucide-react";
import { AdminBtn } from "@/components/admin/ui";

export function PrintInvoiceButton() {
  return (
    <AdminBtn onClick={() => window.print()}>
      <Printer className="mr-1.5 h-4 w-4" aria-hidden />
      Print or save PDF
    </AdminBtn>
  );
}
