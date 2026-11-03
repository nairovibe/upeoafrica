import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

type Variant = "primary" | "secondary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

/**
 * Transitions are enumerated rather than `transition-all`: `all` also animates
 * layout-affecting properties, which makes a button visibly settle when the
 * page reflows around it. Everything shares one duration and the brand easing
 * so buttons, cards, and tiles all decelerate identically.
 */
const base =
  "inline-flex items-center justify-center gap-2 font-medium cursor-pointer select-none whitespace-nowrap transition-[color,background-color,border-color,box-shadow,transform] duration-300 ease-out-expo focus-visible:outline-3 focus-visible:outline-offset-2 disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand-500 text-white shadow-[0_8px_24px_-8px_rgba(249,115,22,0.65)] hover:bg-brand-600 hover:shadow-[0_14px_34px_-10px_rgba(249,115,22,0.75)] hover:-translate-y-0.5 active:translate-y-0 active:bg-brand-700 active:duration-100",
  secondary:
    "bg-ink-900 text-white shadow-[0_8px_24px_-14px_rgba(11,14,20,0.7)] hover:bg-brand-500 hover:shadow-[0_14px_34px_-10px_rgba(249,115,22,0.75)] hover:-translate-y-0.5 active:translate-y-0 active:bg-brand-600 active:duration-100",
  outline:
    "border border-line bg-white text-ink-900 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600 hover:shadow-[0_12px_30px_-20px_rgba(11,14,20,0.55)] hover:-translate-y-0.5 active:translate-y-0 active:duration-100",
  ghost: "text-ink-900 hover:bg-surface-3 hover:text-brand-600",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-[15px]",
  lg: "h-13 px-7 text-base",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  withArrow?: boolean;
  children: React.ReactNode;
};

export function Button({
  href,
  variant = "primary",
  size = "md",
  className,
  withArrow = false,
  children,
  ...rest
}: CommonProps &
  ({ href: string } | { href?: undefined }) &
  React.ButtonHTMLAttributes<HTMLButtonElement> &
  Record<string, unknown>) {
  const classes = cn(base, variants[variant], sizes[size], className);
  const content = (
    <>
      {children}
      {withArrow && (
        <ArrowRight
          className="h-4 w-4 transition-transform duration-300 ease-out-expo group-hover/btn:translate-x-0.5"
          aria-hidden
        />
      )}
    </>
  );

  if (href) {
    const external = href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:");
    if (external) {
      return (
        <a href={href} className={cn("group/btn", classes)}>
          {content}
        </a>
      );
    }
    return (
      <Link href={href} className={cn("group/btn", classes)}>
        {content}
      </Link>
    );
  }

  return (
    <button className={cn("group/btn", classes)} {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
      {content}
    </button>
  );
}
