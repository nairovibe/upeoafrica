import Image from "next/image";
import { Star, ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { company } from "@/lib/content";
import { getSettings } from "@/lib/cms";

export async function GoogleRating() {
  const settings = await getSettings();
  const reviewUrl = settings?.google_review_url || company.googleReviewUrl;
  return (
    <section className="border-y border-line bg-surface-2 py-14">
      <Container>
        <Reveal>
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 text-center sm:flex-row sm:justify-center sm:gap-8 sm:text-left">
            <div className="flex items-center gap-3">
              {/* Official Google mark, then stars in Google's own review gold.
                  Brand orange here would misrepresent a third-party rating. */}
              <Image
                src="/logos/google-g.svg"
                alt="Google"
                width={24}
                height={24}
                unoptimized
                className="h-6 w-6 shrink-0"
              />
              <span className="flex gap-0.5" style={{ color: "#FBBC05" }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-current" aria-hidden />
                ))}
              </span>
              <span className="font-display text-3xl font-bold text-ink-900">
                {company.googleRating}
              </span>
            </div>

            <span className="hidden h-10 w-px bg-line sm:block" />

            <p className="text-[15px] leading-relaxed text-body">
              Rated {company.googleRating} by our clients on Google. We&apos;d love to earn
              yours too.
            </p>

            <a
              href={reviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex shrink-0 items-center gap-1.5 border-b-2 border-brand-500 pb-0.5 text-sm font-semibold text-ink-900 transition-colors duration-300 ease-out-expo hover:text-brand-600"
            >
              Review us on Google
              <ArrowUpRight
                className="h-4 w-4 transition-transform duration-300 ease-out-expo group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                aria-hidden
              />
            </a>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
