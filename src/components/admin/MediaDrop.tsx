"use client";

import { useRouter } from "next/navigation";
import { FileField } from "@/components/admin/FileField";

export function MediaDrop() {
  const router = useRouter();
  return (
    <FileField
      label="Upload"
      folder="library"
      value=""
      accept="image/*,video/mp4"
      onChange={() => router.refresh()}
    />
  );
}
