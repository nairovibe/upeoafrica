import Link from "next/link";
import Image from "next/image";
import logoFull from "@/assets/upeo-logo.png";
import logoMarkImg from "@/assets/upeo-mark.png";
import { cn } from "@/lib/utils";

/**
 * Official orange network mark. The source file is square; we always render it
 * in a square box so Next/Image cannot stretch the circles into ovals.
 */
export function LogoMark({
  size = 40,
  className = "",
  priority = false,
}: {
  size?: number;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={logoMarkImg}
      alt="Upeo Africa Technologies"
      width={size}
      height={size}
      className={cn("shrink-0 object-contain", className)}
      style={{ width: size, height: size }}
      priority={priority}
    />
  );
}

/**
 * Full brand lockup.
 * - variant "default": official full-colour logo (for light backgrounds).
 * - variant "light": orange mark + white wordmark (for dark backgrounds, where the
 *   logo's dark text would be invisible). The official mark is never altered.
 */
export function Logo({
  className = "",
  variant = "default",
  href = "/",
  priority = false,
}: {
  className?: string;
  variant?: "default" | "light";
  href?: string;
  priority?: boolean;
}) {
  if (variant === "light") {
    return (
      <Link
        href={href}
        aria-label="Upeo Africa Technologies home"
        className={`group inline-flex items-center gap-2.5 ${className}`}
      >
        <Image
          src={logoMarkImg}
          alt=""
          width={36}
          height={36}
          className="h-9 w-9 shrink-0 object-contain transition-transform duration-300 group-hover:scale-105"
          style={{ width: 36, height: 36 }}
          priority={priority}
        />
        <span className="flex flex-col leading-none">
          <span className="font-display text-[15px] font-bold uppercase tracking-[0.13em] text-white">
            Upeo Africa
          </span>
          <span className="mt-1 font-display text-[10px] font-semibold uppercase tracking-[0.32em] text-white/55">
            Technologies
          </span>
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      aria-label="Upeo Africa Technologies home"
      className={`group inline-flex items-center ${className}`}
    >
      <Image
        src={logoFull}
        alt="Upeo Africa Technologies"
        className="h-10 w-auto transition-transform duration-300 group-hover:scale-[1.03] sm:h-11"
        priority={priority}
      />
    </Link>
  );
}
