import { ImageIcon, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function Thumb({
  src,
  alt = "",
  icon: Icon = ImageIcon,
  className,
  fit = "cover",
}: {
  src?: string | null;
  alt?: string;
  icon?: LucideIcon;
  className?: string;
  fit?: "cover" | "contain";
}) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-[5px] border border-line bg-surface-2 text-muted",
        className ?? "h-10 w-14",
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className={cn("h-full w-full", fit === "cover" ? "object-cover" : "object-contain p-1")}
        />
      ) : (
        <Icon className="h-4 w-4" strokeWidth={1.75} />
      )}
    </span>
  );
}