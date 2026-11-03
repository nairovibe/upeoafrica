import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Target, Telescope, Gem, Code2, PenTool, Megaphone, ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { stagger } from "@/components/ui/stagger";
import { SectionHeading } from "@/components/ui/Section";
import { PageHeader } from "@/components/site/PageHeader";
import { StatsBand } from "@/components/sections/StatsBand";
import { CTA } from "@/components/sections/CTA";
import { company, differentiators } from "@/lib/content";
import { pageImages } from "@/lib/images";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Meet the studio on Moi Avenue. Since 2019 we have delivered 791 projects in software, design, and marketing for clients across Africa, and nine in ten either come back or refer someone.",
};

const pillars = [
  {
    icon: Target,
    title: "Our mission",
    body: "Help African businesses grow with software, design, and marketing that is built for how they actually operate.",
  },
  {
    icon: Telescope,
    title: "Our vision",
    body: "An Africa where a serious business can get world-class product work from a studio that understands the market it sells into.",
  },
  {
    icon: Gem,
    title: "Our values",
    body: "Craft over shortcuts, plain language over jargon, and a partnership that continues after launch.",
  },
];

const teams = [
  { icon: Code2, label: "Engineering", desc: "Web, mobile, and cloud" },
  { icon: PenTool, label: "Design", desc: "Brand and product" },
  { icon: Megaphone, label: "Marketing", desc: "Search, content, and campaigns" },
];

const practice = [
  {
    href: "/founders",
    title: "Startups and founders",
    body: "Share the problem without handing over the mechanism. A confidentiality note can come before the detail.",
  },
  {
    href: "/partners",
    title: "Partners",
    body: "A short list of organisations we ship with. A logo is not a partnership.",
  },
  {
    href: "/blogs",
    title: "Blogs",
    body: "Articles on software, payments, design, and growing a business, published as they are ready.",
  },
  {
    href: "/events",
    title: "Events",
    body: "Talks and training in Mombasa and online. A seat is something you can buy.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "Home", href: "/" }, { label: "About Us" }]}
        title="About Us"
        intro="Meet the studio on Moi Avenue. Since 2019 we have delivered 791 projects in software, design, and marketing for clients across Africa, and nine in ten either come back or refer someone."
      />

      <section className="border-t border-line bg-surface-2 py-24 lg:py-32">
        <Container>
          <div className="grid items-center gap-14 lg:grid-cols-2">
            <div>
              <SectionHeading
                title="The studio"
                intro="Designers, software engineers, and marketers work on the same engagement. A client is not left refereeing three suppliers."
              />
              <div className="mt-8 space-y-4 text-lg leading-relaxed text-body">
                <p>
                  Upeo names the reach we build for. The work starts in Mombasa and is
                  made for businesses across Africa: the interface, the software, and the
                  customers who have to find it.
                </p>
                <p>
                  One studio stays on the engagement from the first scope through launch
                  and support. The product, the brand, and the marketing are not handed
                  between companies.
                </p>
              </div>

              <div className="mt-8 grid grid-cols-3 gap-3">
                {teams.map((t) => (
                  <div key={t.label} className="border border-line bg-white p-4">
                    <t.icon className="h-5 w-5 text-brand-600" aria-hidden />
                    <p className="mt-3 text-sm font-semibold text-ink-900">{t.label}</p>
                    <p className="text-xs text-muted">{t.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <Reveal delay={0.1}>
              <div className="relative aspect-[4/5] overflow-hidden border border-line">
                <Image
                  src={pageImages.aboutTeam}
                  alt="Colleagues reviewing project plans together around a table"
                  fill
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover object-[50%_60%]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/60 to-transparent" />
                <div className="absolute inset-x-5 bottom-5 flex items-center gap-2 bg-white/90 px-4 py-2.5 text-sm font-medium text-ink-900 backdrop-blur">
                  <MapPin className="h-4 w-4 shrink-0 text-brand-600" aria-hidden />
                  {company.addressLine}
                </div>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      <section className="bg-white py-24 lg:py-32">
        <Container>
          <SectionHeading
            title="What we stand for"
            intro="This is the standard on every engagement: what the studio is here to do, where it is headed, and what it will not cut."
          />
          <div className="mt-14 grid gap-px border border-ink-900/10 bg-ink-900/10 md:grid-cols-3">
            {pillars.map((p, i) => (
              <Reveal key={p.title} delay={stagger(i, 3)} className="flex">
                <div className="group flex h-full w-full flex-col bg-white p-8 transition-colors duration-300 ease-out-expo hover:bg-surface-2">
                  <span className="inline-flex h-12 w-12 items-center justify-center bg-brand-50 text-brand-600 transition-colors duration-300 ease-out-expo group-hover:bg-brand-500 group-hover:text-white">
                    <p.icon className="h-6 w-6" aria-hidden />
                  </span>
                  <h3 className="mt-5 font-display text-lg font-semibold text-ink-900">{p.title}</h3>
                  <p className="mt-2 text-lg leading-relaxed text-body">{p.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-[#edf3f8] py-24 lg:py-32">
        <Container>
          <SectionHeading
            title="Where to go next"
            intro="The studio is one practice. These are the doors into it, depending on what you came for."
          />
          <div className="mt-14 grid gap-5 sm:grid-cols-2">
            {practice.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex flex-col border border-ink-900/10 bg-white p-8 transition-colors duration-300 hover:border-brand-300"
              >
                <h3 className="font-display text-xl font-semibold text-ink-900 group-hover:text-brand-600">
                  {item.title}
                </h3>
                <p className="mt-3 flex-1 text-lg leading-relaxed text-body">{item.body}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-ink-900">
                  Open
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <StatsBand />

      <section className="bg-white py-24 lg:py-32">
        <Container>
          <SectionHeading
            align="center"
            title="Why clients stay"
            intro="These are the commitments on every project, from the first scope through the support that follows launch."
          />
          <div className="mt-16 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {differentiators.map((d, i) => (
              <Reveal key={d.title} delay={(i % 3) * 0.06}>
                <div className="group">
                  <span className="inline-flex h-12 w-12 items-center justify-center border border-line bg-surface-2 text-brand-600 transition-colors duration-300 ease-out-expo group-hover:border-brand-200 group-hover:bg-brand-50">
                    <d.icon className="h-6 w-6" aria-hidden />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold text-ink-900">{d.title}</h3>
                  <p className="mt-2 text-lg leading-relaxed text-body">{d.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <CTA
        title="Work with the studio"
        intro="Tell us the initiative. We will say honestly whether we are the right team, and what the first step is."
      />
    </>
  );
}
