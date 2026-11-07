import type { Metadata } from "next";
import Link from "next/link";
import { FileLock, LockKeyhole, MessageSquareText } from "lucide-react";
import { PageHeader } from "@/components/site/PageHeader";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/Section";
import { CTA } from "@/components/sections/CTA";
import { IdeaWizard } from "@/components/founders/IdeaWizard";
import { getPublishedArticles, getPublishedWork } from "@/lib/cms";

const FOUNDERS_DESCRIPTION =
  "Are you a startup founder? You came to the right place. Bring the idea while it is still being shaped. One team takes it from a private brief through the build, the launch, and the campaigns that get people using it.";

export const metadata: Metadata = {
  title: "Founder Zone",
  description: FOUNDERS_DESCRIPTION,
};

const guards = [
  {
    icon: MessageSquareText,
    title: "Start with the problem",
    body: "Tell us who it is for and what is hard. The method can wait. That is enough for us to say whether we are the right team.",
  },
  {
    icon: FileLock,
    title: "A note before the detail",
    body: "Ask for a confidentiality note before anything specific. The first reply is that note.",
  },
  {
    icon: LockKeyhole,
    title: "The work stays yours",
    body: "On a project, the product, the repositories, and the intellectual property are yours. An idea shared here is not built for someone else.",
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
        breadcrumb={[{ label: "Home", href: "/" }, { label: "About", href: "/about" }, { label: "Founder Zone" }]}
        title="Founder Zone"
        intro={FOUNDERS_DESCRIPTION}
      />

      <section className="bg-white py-24 lg:py-32">
        <Container>
          <SectionHeading
            title="The idea stays with you"
            intro="Share the problem without the mechanism. If you want a confidentiality note before any detail, say so. The product and the code remain yours."
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
            title="What the team takes on"
            intro="Design, the product, payments, and the work of being found. You pick the piece that matters now. The same team stays through launch."
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
              intro="A short set of questions. You choose how much of the idea is in the note we receive."
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
        title="Prefer to talk it through?"
        intro="Use the project form when the conversation can be open. Use the steps above when the idea should stay narrow."
      />
    </>
  );
}
