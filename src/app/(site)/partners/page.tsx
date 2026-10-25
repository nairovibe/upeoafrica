import type { Metadata } from "next";
import { PageHeader } from "@/components/site/PageHeader";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/Section";
import { CTA } from "@/components/sections/CTA";
import { getPartners } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Partners",
  description:
    "Meet the organisations we build with. Averis Systems Ltd is our official development partner, and a name is added here only after we have shipped together.",
};

const terms = [
  {
    title: "We ship, then we name it",
    body: "A partnership on this page means work has gone out under both names. A conversation, a pitch, or a shared event is not enough.",
  },
  {
    title: "One relationship, written plainly",
    body: "Official development partner means we build and maintain their product. Anything else is a company we have delivered with, and the note says so.",
  },
  {
    title: "The list stays short",
    body: "We do not collect logos. If a name is here, a client can ask what we actually did and get a straight answer.",
  },
];

function relationshipLabel(value: string) {
  if (value === "official_dev_partner") return "Official development partner";
  return "Shipped together";
}

export default async function PartnersPage() {
  const partners = await getPartners();
  const featured = partners.filter((p) => p.featured);
  const rest = partners.filter((p) => !p.featured);

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "Home", href: "/" }, { label: "About", href: "/about" }, { label: "Partners" }]}
        title="Partners"
        intro="Meet the organisations we build with. Averis Systems Ltd is our official development partner, and a name is added here only after we have shipped together."
      />

      <section className="bg-white py-24 lg:py-32">
        <Container>
          <SectionHeading
            title="How a partnership gets onto this page"
            intro="The standard is the same for every name below. If we have not shipped together, the name is not here."
          />
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {terms.map((item) => (
              <article key={item.title} className="border border-line p-8">
                <h3 className="font-display text-xl font-semibold text-ink-900">{item.title}</h3>
                <p className="mt-3 text-lg leading-relaxed text-body">{item.body}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-[#edf3f8] py-24 lg:py-32">
        <Container>
          <SectionHeading title="The list" intro="Organisations the studio has a real engagement with." />
          {partners.length === 0 ? (
            <p className="mt-10 max-w-2xl text-lg leading-relaxed text-body">
              Averis Systems Ltd is the official development partner. Other names are added here only after a project has shipped.
            </p>
          ) : (
            <div className="mt-14 space-y-16">
              {featured.map((p) => (
                <article key={p.id} className="max-w-3xl border-b border-ink-900/10 pb-16">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">{relationshipLabel(p.relationship)}</p>
                  <h3 className="mt-3 font-display text-3xl font-semibold text-ink-900">{p.name}</h3>
                  <p className="mt-4 text-lg leading-relaxed text-body">{p.blurb}</p>
                  {p.url && (
                    <a href={p.url} className="mt-5 inline-block text-sm font-medium text-brand-600 hover:underline" target="_blank" rel="noreferrer">
                      Visit {p.name}
                    </a>
                  )}
                </article>
              ))}
              {rest.length > 0 && (
                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((p) => (
                    <article key={p.id}>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">{relationshipLabel(p.relationship)}</p>
                      <h3 className="mt-2 font-display text-lg font-semibold text-ink-900">{p.name}</h3>
                      <p className="mt-2 text-lg leading-relaxed text-body">{p.blurb}</p>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}
        </Container>
      </section>

      <CTA title="Want to partner?" intro="We add a name after we have shipped together. Write with the work in mind, not a logo request." />
    </>
  );
}
