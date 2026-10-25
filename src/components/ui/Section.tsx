import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";

/** Section title and lead, taken from the homepage "What we do" block. */
export const sectionTitleClass =
  "text-3xl font-bold leading-[1.08] sm:text-4xl md:text-[2.75rem]";
export const sectionIntroClass = "text-lg leading-relaxed";

export function Eyebrow({
  children,
  className,
  tone = "dark",
  as: Tag = "span",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "dark" | "light";
  /** Render as `h2` when the kicker is the section's only heading. */
  as?: "span" | "h2";
}) {
  return (
    <Tag
      className={cn(
        "inline-flex items-center gap-2 font-sans text-xs font-semibold uppercase tracking-[0.18em]",
        tone === "dark" ? "text-brand-600" : "text-brand-400",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "left",
  tone = "dark",
  className,
}: {
  eyebrow?: string;
  /**
   * Omit to use the eyebrow text as the section `h2`. Size stays the same
   * either way: the title scale and the text-lg description.
   */
  title?: React.ReactNode;
  intro?: React.ReactNode;
  align?: "left" | "center";
  tone?: "dark" | "light";
  className?: string;
}) {
  const headless = !title;

  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "items-center text-center mx-auto max-w-2xl",
        align === "left" && "max-w-2xl",
        className,
      )}
    >
      {eyebrow && !headless && (
        <Reveal>
          <Eyebrow tone={tone}>{eyebrow}</Eyebrow>
        </Reveal>
      )}

      {(title || eyebrow) && (
        <Reveal delay={0.05}>
          <h2 className={cn(sectionTitleClass, tone === "light" && "text-white")}>
            {title || eyebrow}
          </h2>
        </Reveal>
      )}

      {intro && (
        <Reveal delay={0.1}>
          <p
            className={cn(
              sectionIntroClass,
              tone === "light" ? "text-white/70" : "text-body",
            )}
          >
            {intro}
          </p>
        </Reveal>
      )}
    </div>
  );
}
