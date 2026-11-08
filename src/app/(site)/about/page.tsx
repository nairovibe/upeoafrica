import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Code2, PenTool, Megaphone, ArrowRight, ArrowUpRight, Building2, HeartHandshake, Lightbulb } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { stagger } from "@/components/ui/stagger";
import { SectionHeading } from "@/components/ui/Section";
import { PageHeader } from "@/components/site/PageHeader";
import { OpenInquiry } from "@/components/site/OpenInquiry";
import { CTA } from "@/components/sections/CTA";
import { company } from "@/lib/content";
import { pageImages } from "@/lib/images";
import { ExpertSocials } from "@/components/site/ExpertSocials";
import { getExperts, getPublicSettings } from "@/lib/cms";
import { publicMediaUrl } from "@/lib/constants";

const ABOUT_DESCRIPTION =
  "Upeo Africa Technologies builds enterprise-grade software, custom web applications, and digital platforms for businesses, SMEs, and founders scaling across Africa.";

export const metadata: Metadata = {
  title: "About Us",
  description: ABOUT_DESCRIPTION,
};

const chapters = [
  {
    label: "Build",
    title: "Software people can rely on",
    body: "High-performance websites, complex custom web applications, UI/UX design, and mobile apps. This is the foundation every engagement starts from.",
  },
  {
    label: "Launch",
    title: "A platform people can find",
    body: "An intuitive interface means nothing if users can't find it. Once a site, portal, or app goes live, the same team stays on it.",
  },
  {
    label: "Grow",
    title: "Traction from the same team",
    body: "Targeted digital marketing campaigns, run by the people who built the product, designed to capture traction after launch.",
  },
];

const audiences = [
  {
    icon: Building2,
    href: "/services",
    title: "Businesses and SMEs",
    body: "Websites, custom applications, and platforms built to be found and used.",
    cta: "See the services",
  },
  {
    icon: Lightbulb,
    href: "/founders",
    title: "Founders",
    body: "An idea turned into a product, then taken to the people who need to use it.",
    cta: "Share an idea",
  },
  {
    icon: HeartHandshake,
    href: "/contact",
    title: "NGOs",
    body: "Platforms a community can find and use, with one team on the build and the growth.",
    cta: "Talk to us",
  },
];

export default async function AboutPage() {
  const [experts, settings] = await Promise.all([getExperts(), getPublicSettings()]);
  const booking = settings?.cal_com_embed_url || company.bookingUrl;

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "Home", href: "/" }, { label: "About Us" }]}
        title="About Us"
        intro={ABOUT_DESCRIPTION}
      />

      <section className="border-t border-line bg-surface-2 py-24 lg:py-32">
        <Container>
          <div className="grid items-center gap-14 lg:grid-cols-2">
            <div>
              <SectionHeading
                title="The company"
                intro="Since 2019, our work has focused on solving a core problem: closing the gap between building great software and getting people to use it."
              />
              <div className="mt-8 space-y-4 text-lg leading-relaxed text-body">
                <p>
                  Our early days were rooted in foundational development: building high-performance websites and complex custom web applications. Over time, that scope expanded into comprehensive UI/UX design and mobile app development. We realized early on that an intuitive interface means nothing if users can&apos;t find the platform in the wild.
                </p>
                <p>
                  That&apos;s why our process bridges the divide between engineering and growth. Once your site, portal, or app goes live, the same team executes targeted digital marketing campaigns designed to capture immediate traction. One dedicated team manages your build, your launch, and your ongoing evolution.
                </p>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href={booking}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex h-11 items-center justify-center gap-2 bg-brand-500 px-6 text-[15px] font-semibold text-white transition-colors duration-300 hover:bg-brand-600"
                >
                  Book a call
                  <ArrowUpRight className="h-4 w-4" aria-hidden />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
                <Link
                  href="/services"
                  className="inline-flex h-11 items-center justify-center gap-2 border border-line bg-white px-6 text-[15px] font-semibold text-ink-900 transition-colors duration-300 hover:border-brand-300 hover:text-brand-600"
                >
                  See our services
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            </div>

            <Reveal delay={0.1}>
              <div className="relative aspect-[4/5] overflow-hidden border border-line">
                <Image
                  src={pageImages.aboutTeam}
                  alt="Engineers at Upeo Africa Technologies working through application code"
                  fill
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/40 to-transparent" />
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      <section className="bg-white py-24 lg:py-32">
        <Container>
          <SectionHeading
            title="Build, launch, and keep evolving"
            intro="The same team manages the build, the launch, and the campaigns that bring people to what just went live."
          />
          <ol className="mt-14 grid gap-px border border-ink-900/10 bg-ink-900/10 md:grid-cols-3">
            {chapters.map((chapter, i) => (
              <Reveal key={chapter.title} as="li" delay={stagger(i, 3)} className="flex h-full flex-col bg-white p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">{chapter.label}</p>
                <h3 className="mt-3 font-display text-xl font-semibold text-ink-900">{chapter.title}</h3>
                <p className="mt-3 flex-1 text-lg leading-relaxed text-body">{chapter.body}</p>
              </Reveal>
            ))}
          </ol>
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
            <OpenInquiry className="group inline-flex h-11 cursor-pointer items-center justify-center gap-2 bg-ink-900 px-6 text-[15px] font-semibold text-white transition-colors duration-300 hover:bg-brand-500">
              Start a project
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden />
            </OpenInquiry>
            <Link href="/work" className="text-[15px] font-semibold text-ink-900 underline-offset-4 hover:text-brand-600 hover:underline">
              See the work
            </Link>
          </div>
        </Container>
      </section>

      <section className="border-t border-line bg-surface-2 py-24 lg:py-32">
        <Container>
          <SectionHeading
            title="Our team of experts"
            intro="Design, engineering, and growth sit with the people who do the work. One team manages the build, the launch, and what happens once people start using it."
          />
          <ul className="mt-10 grid max-w-3xl gap-4 sm:grid-cols-3">
            {[
              { icon: PenTool, label: "Design", desc: "UI/UX, websites, and product" },
              { icon: Code2, label: "Engineering", desc: "Web, mobile, and custom systems" },
              { icon: Megaphone, label: "Growth", desc: "Digital campaigns after launch" },
            ].map((item) => (
              <li key={item.label} className="border border-line bg-white p-5">
                <item.icon className="h-5 w-5 text-brand-600" aria-hidden />
                <p className="mt-3 text-sm font-semibold text-ink-900">{item.label}</p>
                <p className="text-sm text-muted">{item.desc}</p>
              </li>
            ))}
          </ul>
          {experts.length > 0 ? (
            <ul className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {experts.map((person) => {
                const photo = publicMediaUrl(person.photo_path);
                return (
                  <li key={person.id} className="flex h-full flex-col rounded-[5px] border border-line bg-white">
                    <Link
                      href={`/experts/${person.slug}`}
                      className="group block rounded-[5px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
                    >
                      <div className="relative aspect-square overflow-hidden rounded-t-[5px] bg-surface-2">
                        {photo ? (
                          <Image
                            src={photo}
                            alt=""
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-contain object-center"
                            unoptimized
                          />
                        ) : (
                          <span className="absolute inset-0 flex items-center justify-center font-display text-4xl font-semibold text-ink-900/30">
                            {person.name.slice(0, 1)}
                          </span>
                        )}
                      </div>
                      <div className="px-5 pt-5">
                        <h3 className="font-display text-xl font-semibold text-ink-900 transition-colors duration-200 group-hover:text-brand-600">
                          {person.name}
                        </h3>
                        <p className="mt-1 text-sm font-medium text-body">{person.title}</p>
                      </div>
                    </Link>
                    <div className="px-4 pt-3 pb-4">
                      <ExpertSocials person={person} />
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-body">
              The people who design, engineer, and grow the product are introduced here as each portrait is ready.
            </p>
          )}
        </Container>
      </section>

      <section className="bg-[#edf3f8] py-24 lg:py-32">
        <Container>
          <SectionHeading
            title="Who the work is for"
            intro="The same team builds for companies that need software people will use, founders turning an idea into a product, and NGOs that need a platform a community can open."
          />
          <div className="mt-14 grid gap-5 lg:grid-cols-3">
            {audiences.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex flex-col border border-ink-900/10 bg-white p-8 transition-colors duration-300 hover:border-brand-300"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center bg-brand-50 text-brand-600">
                  <item.icon className="h-6 w-6" aria-hidden />
                </span>
                <h3 className="mt-5 font-display text-xl font-semibold text-ink-900 group-hover:text-brand-600">
                  {item.title}
                </h3>
                <p className="mt-3 flex-1 text-lg leading-relaxed text-body">{item.body}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-ink-900">
                  {item.cta}
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <CTA
        title="Close the gap between the build and the people who use it"
        intro="Tell us about the site, portal, or app. The same team can take it through launch and the campaigns that follow."
      />
    </>
  );
}
