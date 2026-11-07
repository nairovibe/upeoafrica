import type { Metadata } from "next";
import Link from "next/link";
import { FileLock, LockKeyhole, MessageSquareText } from "lucide-react";
import { PageHeader } from "@/components/site/PageHeader";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/Section";
import { CTA } from "@/components/sections/CTA";
import { IdeaWizard } from "@/components/founders/IdeaWizard";
import { getPublishedArticles, getPublishedWork } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Founders Zone",
  description:
    "At Upeo Africa Technologies, we build for startups and founders who need an idea held in confidence while it is still being shaped. Share the problem without the mechanism, ask for a confidentiality note before any detail, and keep the product and the code.",
};

const guards = [
  {
    icon: MessageSquareText,
    title: "Start with the problem",
    body: "Tell us who it is for and what is hard. The method can wait. That is enough for us to say if we are the right team.",
  },
  {
    icon: FileLock,
    title: "A note before the detail",
    body: "If you want a confidentiality note before anything specific, the wizard records that. The first reply is the note, not a request for the mechanism.",
  },
  {
    icon: LockKeyhole,
    title: "The work stays yours",
    body: "We do not take an idea from one conversation and build it for someone else. On a project, the product, the repositories, and the intellectual property are yours.",
  },
];

const paths = [
  {
    title: "A first version",
    body: "Web, Android, and iOS, scoped to what the first customers actually need.",
    href: "/services/web-applications",
  },
  {
    title: "A brand people trust",
    body: "Identity and product screens, so the idea can be shown before it is finished.",
    href: "/services/branding-creative",
  },
  {
    title: "Payments",
    body: "M-Pesa, Airtel Money, cards, and bank transfer, in the product or on a checkout.",
    href: "/services/api-payments",
  },
  {
    title: "Customers who can find it",
    body: "Search, content, and campaigns once there is something real to send people to.",
    href: "/services/seo-content",
  },
];

export default async function FoundersPage() {
  const [work, notes] = await Promise.all([
    getPublishedWork(3),
    getPublishedArticles({ audience: "founders", limit: 3 }),
  ]);
  const published = [
    ...work.map((item) => ({ href: `/work/${item.slug}`, title: item.title, text: item.summary })),
    ...notes.map((item) => ({ href: `/blogs/${item.slug}`, title: item.title, text: item.excerpt })),
  ];

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "Home", href: "/" }, { label: "About", href: "/about" }, { label: "Founders" }]}
        title="We build for startups and founders"
        intro="At Upeo Africa Technologies, we build for startups and founders who need an idea held in confidence while it is still being shaped. Share the problem without the mechanism, ask for a confidentiality note before any detail, and keep the product and the code."
      />

      <section className="bg-white py-24 lg:py-32">
        <Container>
          <SectionHeading
            title="You can hold the idea back"
            intro="Most people who write to us are founders. A lot of them stop at the first sentence because they think the idea will be taken. The conversation is built so you do not have to hand it over."
          />
          <div className="mt-14 grid gap-5 lg:grid-cols-3">
            {guards.map((item) => (
              <article key={item.title} className="border border-line bg-white p-8">
                <item.icon className="h-6 w-6 text-brand-600" aria-hidden />
                <h3 className="mt-5 font-display text-xl font-semibold text-ink-900">{item.title}</h3>
                <p className="mt-3 text-lg leading-relaxed text-body">{item.body}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-[#edf3f8] py-24 lg:py-32">
        <Container>
          <SectionHeading
            title="What we take on"
            intro="One team holds design, the product, payments, and the work of being found. You pick the piece that matters now. The wizard asks only what that piece needs."
          />
          <div className="mt-14 grid gap-5 sm:grid-cols-2">
            {paths.map((item) => (
              <Link key={item.href} href={item.href} className="group border border-ink-900/10 bg-white p-8 transition-colors duration-300 hover:border-brand-300">
                <h3 className="font-display text-xl font-semibold text-ink-900 group-hover:text-brand-600">{item.title}</h3>
                <p className="mt-3 text-lg leading-relaxed text-body">{item.body}</p>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section id="share" className="scroll-mt-36 bg-white py-24 lg:py-32">
        <Container>
          <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
            <SectionHeading
              title="Share an idea"
              intro="Seven short steps. The questions change with what you select, and the note we receive is written from those answers. You choose how much of the idea is in it."
            />
            <IdeaWizard />
          </div>
        </Container>
      </section>

      {published.length > 0 && (
        <section className="border-t border-line bg-surface-2 py-24 lg:py-32">
          <Container>
            <SectionHeading title="From work already shipped" intro="Projects and notes that are public. Your idea is not added to this list." />
            <ul className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {published.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="font-display text-lg font-semibold text-ink-900 hover:text-brand-600">
                    {item.title}
                  </Link>
                  <p className="mt-2 text-lg leading-relaxed text-body">{item.text}</p>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      <CTA
        title="Not ready to write it down?"
        intro="Use the project form when you would rather talk in the open. Use the wizard above when the idea should stay narrow."
      />
    </>
  );
}
