import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExpertSocials } from "@/components/site/ExpertSocials";
import { Container } from "@/components/ui/Container";
import { getExpertBySlug, getExperts } from "@/lib/cms";
import { publicMediaUrl } from "@/lib/constants";
import { company } from "@/lib/content";
import { safeHttpUrl } from "@/lib/stack";

type Params = Promise<{ slug: string }>;

export const revalidate = 43200;

function descriptionFor(name: string, title: string, bio: string) {
  const text = bio.trim().replace(/\s+/g, " ");
  if (text.length >= 40) return text.length > 160 ? `${text.slice(0, 157).replace(/\s+\S*$/, "")}…` : text;
  return `${name} is ${title} at ${company.name}.`;
}

export async function generateStaticParams() {
  const people = await getExperts();
  return people.map((person) => ({ slug: person.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const person = await getExpertBySlug(slug);
  if (!person) return { title: "Team" };
  const description = descriptionFor(person.name, person.title, person.bio);
  const image = publicMediaUrl(person.photo_path);
  const url = `/experts/${person.slug}`;
  return {
    title: `${person.name}, ${person.title}`,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "profile",
      url,
      title: `${person.name}, ${person.title}`,
      description,
      siteName: company.name,
      locale: "en_KE",
      images: image ? [{ url: image, alt: `${person.name}, ${person.title}` }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: `${person.name}, ${person.title}`,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ExpertPage({ params }: { params: Params }) {
  const { slug } = await params;
  const person = await getExpertBySlug(slug);
  if (!person) notFound();

  const photo = publicMediaUrl(person.photo_path);
  const pageUrl = `${company.domain}/experts/${person.slug}`;
  const sameAs = [person.linkedin_url, person.x_url, person.facebook_url, person.instagram_url, person.github_url]
    .map((value) => safeHttpUrl(value))
    .filter((value): value is string => Boolean(value));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: person.name,
    jobTitle: person.title,
    description: person.bio.trim() || undefined,
    image: photo || undefined,
    url: pageUrl,
    email: person.email || undefined,
    sameAs: sameAs.length ? sameAs : undefined,
    worksFor: {
      "@type": "Organization",
      name: company.name,
      url: company.domain,
    },
  };

  return (
    <section className="bg-white pt-32 pb-20 md:pt-40 md:pb-28">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Container>
        <nav aria-label="Breadcrumb" className="text-sm text-muted">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="hover:text-brand-600">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/about" className="hover:text-brand-600">
                About
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-ink-900">{person.name}</li>
          </ol>
        </nav>

        <div className="mt-8 grid items-start gap-10 lg:grid-cols-[minmax(0,22rem)_1fr] lg:gap-16">
          <div className="relative aspect-square overflow-hidden rounded-[5px] border border-line bg-surface-2">
            {photo ? (
              <Image
                src={photo}
                alt={`${person.name}, ${person.title}`}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 352px"
                className="object-contain object-center"
                unoptimized
              />
            ) : (
              <span className="absolute inset-0 flex items-center justify-center font-display text-6xl font-semibold text-ink-900/30">
                {person.name.slice(0, 1)}
              </span>
            )}
          </div>

          <div>
            <h1 className="font-display text-3xl font-semibold leading-[1.1] text-ink-900 sm:text-4xl">{person.name}</h1>
            <p className="mt-3 text-lg font-medium text-body">{person.title}</p>
            <div className="mt-5">
              <ExpertSocials person={person} />
            </div>
            {person.bio.trim() ? (
              <div className="mt-8 max-w-2xl space-y-4 text-lg leading-relaxed text-body">
                {person.bio
                  .trim()
                  .split(/\n{2,}/)
                  .map((paragraph) => (
                    <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                  ))}
              </div>
            ) : null}
            <Link href="/about" className="mt-8 inline-flex text-sm font-medium text-brand-600 hover:underline">
              Back to About
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
