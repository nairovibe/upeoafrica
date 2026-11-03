"use client";

import { useLinkStatus } from "next/link";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("h-3.5 w-3.5 shrink-0 animate-spin", className)} aria-hidden />;
}

/** Inside a <Link>: shows the icon, or a spinner while that link's route loads. */
export function LinkPending({ icon }: { icon?: React.ReactNode }) {
  const { pending } = useLinkStatus();
  if (pending) return <Spinner />;
  return icon ? <>{icon}</> : null;
}
