import { techStack } from "@/lib/content";

function StackRow({ hidden = false }: { hidden?: boolean }) {
  return (
    <div aria-hidden={hidden || undefined} className="flex shrink-0 items-center gap-8 pr-8 md:gap-10 md:pr-10">
      {techStack.map((t) => (
        <span key={t.slug + t.name} className="flex shrink-0 items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/logos/${t.slug}.svg`}
            alt=""
            width={48}
            height={48}
            className="h-8 w-8 object-contain md:h-12 md:w-12"
            loading="lazy"
          />
          <span className="whitespace-nowrap text-sm font-medium text-ink-900 md:text-[15px]">
            {t.name}
          </span>
        </span>
      ))}
    </div>
  );
}

/**
 * Sits on the join between the hero and the section under it: half on the
 * white hero, half on the section below. It is not its own band.
 */
export function TechMarquee() {
  return (
    <section
      aria-label="The modern stack we build on"
      className="relative z-10 -mt-6 -mb-6 md:-mt-8 md:-mb-8"
    >
      <div className="px-5 sm:px-10 lg:px-20">
        <div className="h-16 overflow-hidden rounded-full bg-[#f5f5f5] md:h-20">
          <div className="flex h-full w-max animate-marquee items-center motion-reduce:animate-none">
            <StackRow />
            <StackRow hidden />
          </div>
        </div>
      </div>
    </section>
  );
}
