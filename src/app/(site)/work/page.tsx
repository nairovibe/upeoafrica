import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { PageHeader } from "@/components/site/PageHeader";
import { Container } from "@/components/ui/Container";
import { CTA } from "@/components/sections/CTA";
import { getPublishedWork } from "@/lib/cms";
import { publicMediaUrl } from "@/lib/constants";

const intro =
  "Get to explore projects delivered for clients across Africa and abroad. Custom software, product design, and digital marketing, each engagement carried from the agreed scope through handover.";

export const metadata: Metadata = {
  title: "Our Work",
  description: intro,
};

export default async function WorkPage() {
  const work = await getPublishedWork();
  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Our Work" }]}
        title="Our Work"
        intro={intro}
      />
      <section className="bg-white py-24 lg:py-32">
        <Container>
          {work.length === 0 ? (
            <p className="max-w-xl text-[15px] leading-relaxed text-body">
              Case studies are being written up from live projects. In the meantime, start with{" "}
              <Link href="/services" className="font-medium text-brand-600 hover:underline">
                services
              </Link>{" "}
              or{" "}
              <Link href="/contact" className="font-medium text-brand-600 hover:underline">
                talk to us
              </Link>
              .
            </p>
          ) : (
            <div className="grid gap-12 lg:grid-cols-2">
              {work.map((item) => {
                const cover = publicMediaUrl(item.cover_path);
                return (
                  <Link key={item.id} href={`/work/${item.slug}`} className="group block">
                    {cover && (
                      <div className="relative mb-5 aspect-[16/10] overflow-hidden border border-line">
                        <Image src={cover} alt="" fill className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" sizes="(max-width: 1024px) 100vw, 50vw" />
                      </div>
                    )}
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">
                      {item.industry || "Project"}
                    </p>
                    <h2 className="mt-2 font-display text-2xl font-semibold text-ink-900 group-hover:text-brand-600">
                      {item.title}
                    </h2>
                    <p className="mt-2 text-[15px] leading-relaxed text-body">{item.summary}</p>
                  </Link>
                );
              })}
            </div>
          )}
        </Container>
      </section>
      <CTA title="Have something similar in mind?" intro="Bring the brief. We will tell you if we are the right team." />
    </>
  );
}
