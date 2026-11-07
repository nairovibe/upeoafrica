import { Suspense } from "react";
import { LoginForm } from "@/components/admin/LoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Console sign in",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
