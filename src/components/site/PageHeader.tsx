import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

/**
 * The one heading a page gets. There is deliberately no kicker above the `h1`:
 * a label that restates the title in smaller type is two headings pretending to
 * be one, which is exactly what the homepage sections were cleaned up to avoid.
 *
 * The `intro` doubles as the page's meta description, so it is sized for
 * three or four lines of keyword-bearing copy rather than one display-size
 * flourish. Never trim it for looks: shortening it costs search visibility.
 *
 * `image` turns the header into a photographic hero: photo, a left-to-right
 * scrim so copy always sits on ink, and a bottom fade into the section that
 * follows. The studio shot behind "How we work" is the default until a page
 * has its own photograph.
 */
const DEFAULT_HERO_IMAGE = "/how-we-work-bg.jpg";

export function PageHeader({
  title,
  intro,
  meta,
  image = DEFAULT_HERO_IMAGE,
  imageAlt = "The Upeo Africa Technologies studio",
  breadcrumb,
}: {
  title: React.ReactNode;
  intro?: React.ReactNode;
  /** Small supporting line under the intro, e.g. legal effective dates. */
  meta?: React.ReactNode;
  image?: string;
  imageAlt?: string;
  /** Trail for pages nested below a section. The last entry is the current page. */
  breadcrumb?: { label: string; href?: string }[];
}) {
  return (
    <section className="relative overflow-hidden bg-ink-950 pt-36 pb-20 text-white md:pt-48 lg:pb-24">
      {image ? (
        <>
          <Image
            src={image}
            alt={imageAlt}
            fill
            sizes="100vw"
            preload
            className="object-cover object-center"
          />
          {/* Copy sits left, so the scrim is heaviest there and never lets the
              photo push text contrast below what the brand type needs. */}
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/88 to-ink-950/55"
            aria-hidden
          />
          <div className="pointer-events-none absolute inset-0 bg-ink-950/35" aria-hidden />
        </>
      ) : (
        <>
          <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" aria-hidden />
          <div
            className="pointer-events-none absolute -top-32 right-0 h-[28rem] w-[28rem] rounded-full bg-brand-500/20 blur-[120px]"
            aria-hidden
          />
        </>
      )}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-ink-950 to-transparent"
        aria-hidden
      />

      <Container className="relative">
        <div className="max-w-3xl">
          {breadcrumb && breadcrumb.length > 0 && (
            <Reveal>
              <nav aria-label="Breadcrumb" className="mb-5">
                <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium uppercase tracking-[0.14em]">
                  {breadcrumb.map((crumb, i) => (
                    <li key={crumb.label} className="flex items-center gap-2">
                      {i > 0 && (
                        <span className="text-white/30" aria-hidden>
                          /
                        </span>
                      )}
                      {crumb.href ? (
                        <Link
                          href={crumb.href}
                          className="text-white/55 transition-colors duration-300 ease-out-expo hover:text-brand-400"
                        >
                          {crumb.label}
                        </Link>
                      ) : (
                        <span className="text-brand-400" aria-current="page">
                          {crumb.label}
                        </span>
                      )}
                    </li>
                  ))}
                </ol>
              </nav>
            </Reveal>
          )}
          <Reveal>
            <h1 className="text-3xl font-bold leading-[1.08] text-white sm:text-4xl md:text-[2.75rem]">
              {title}
            </h1>
          </Reveal>
          {intro && (
            <Reveal delay={0.06}>
              <p className="mt-6 max-w-3xl text-lg leading-relaxed text-white/85">
                {intro}
              </p>
            </Reveal>
          )}
          {meta && (
            <Reveal delay={0.12}>
              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-white/50">
                {meta}
              </p>
            </Reveal>
          )}
        </div>
      </Container>
    </section>
  );
}
