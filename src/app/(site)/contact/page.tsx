import type { Metadata } from "next";
import Image from "next/image";
import { Mail, Phone, MapPin } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/Section";
import { PageHeader } from "@/components/site/PageHeader";
import { ContactForm } from "@/components/site/ContactForm";
import { company, faqs } from "@/lib/content";
import { images, pageImages } from "@/lib/images";
import { getSettings } from "@/lib/cms";
import { CalEmbed } from "@/components/site/CalEmbed";

export const metadata: Metadata = {
  title: "Contact Us",
  /* Same string as the header intro below: hero copy is the meta description. */
  description:
    "Get in touch with us for expert guidance on a software, design, or marketing project. Share what you need, and the team replies within one business day with a clear plan, timeline, and quote.",
};

const tel = company.phone.replace(/\s/g, "");

const details = [
  {
    icon: Mail,
    label: "Email",
    value: company.email,
    href: `mailto:${company.email}`,
  },
  {
    icon: Phone,
    label: "WhatsApp / Call / SMS",
    value: company.phone,
    href: `tel:${tel}`,
  },
  {
    icon: MapPin,
    label: "Address",
    value: company.addressLine,
    href: company.googleReviewUrl,
  },
];

export default async function ContactPage() {
  const settings = await getSettings();
  const cal = process.env.CAL_COM_EMBED_URL || settings?.cal_com_embed_url || "";
  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Contact Us" }]}
        title="Contact Us"
        intro="Get in touch with us for expert guidance on a software, design, or marketing project. Share what you need, and the team replies within one business day with a clear plan, timeline, and quote."
        image={pageImages.contactHeader}
        imageAlt="Client support specialist talking a caller through a question at her desk"
      />

      <section className="border-b border-line bg-white">
        <Container>
          <div className="grid md:grid-cols-3 md:divide-x md:divide-line">
            {details.map((d) => {
              const [user, domain] = d.label === "Email" ? d.value.split("@") : [];
              return (
                <a
                  key={d.label}
                  href={d.href}
                  className="flex items-start gap-4 border-b border-line py-7 last:border-b-0 md:border-b-0 md:px-8 md:first:pl-0 md:last:pr-0"
                >
                  <d.icon className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" aria-hidden />
                  <span>
                    <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                      {d.label}
                    </span>
                    <span className="mt-1.5 block text-base font-semibold leading-snug text-ink-900">
                      {user && domain ? (
                        <>
                          {user}@<wbr />
                          {domain}
                        </>
                      ) : (
                        d.value
                      )}
                    </span>
                  </span>
                </a>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="bg-white py-24 lg:py-32">
        <Container>
          <SectionHeading
            eyebrow="Send Us Your Brief"
            intro="Fill in the form and the right person on our team answers you directly."
          />

          <div className="mt-14 grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <Reveal>
                <div className="relative overflow-hidden border border-line shadow-[0_30px_80px_-45px_rgba(11,14,20,0.45)]">
                  <div className="relative aspect-[5/4] w-full">
                    <Image
                      src={images.support}
                      alt="Upeo Africa Technologies support specialist at her desk, ready to help"
                      fill
                      sizes="(max-width: 1024px) 100vw, 40vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink-950/75 via-ink-950/10 to-transparent" />
                  </div>
                  <div className="absolute inset-x-5 bottom-5">
                    <span className="inline-flex items-center gap-2 bg-brand-500 px-3 py-1 text-xs font-semibold text-white">
                      <span className="h-1.5 w-1.5 rounded-full bg-white" /> We&apos;re here to
                      help
                    </span>
                    <p className="mt-3 text-lg font-semibold text-white">
                      Talk to a real person
                    </p>
                    <p className="mt-1 text-sm text-white/75">
                      No ticket queue. Our team replies within one business day.
                    </p>
                  </div>
                </div>
              </Reveal>
            </div>

            {/* Right: form */}
            <Reveal delay={0.1}>
              <ContactForm />
            </Reveal>
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="bg-white py-24 lg:py-32">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <SectionHeading
                eyebrow="Frequently Asked Questions"
                intro={
                  <>
                    Here are the questions clients ask us most. If yours is not below, email
                    us at{" "}
                    <a
                      href={`mailto:${company.email}`}
                      className="font-medium text-brand-600 hover:underline"
                    >
                      {company.email}
                    </a>{" "}
                    and we will answer it.
                  </>
                }
              />
            </div>

            <div className="divide-y divide-line">
              {faqs.map((f, i) => (
                <Reveal key={f.q} delay={i * 0.05}>
                  <details className="group py-5">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-ink-900 [&::-webkit-details-marker]:hidden">
                      {f.q}
                      <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center border border-line text-muted transition-all duration-200 group-open:rotate-45 group-open:border-brand-300 group-open:text-brand-600">
                        +
                      </span>
                    </summary>
                    <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-body">
                      {f.a}
                    </p>
                  </details>
                </Reveal>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {cal ? (
        <section className="border-t border-line bg-white py-24 lg:py-32">
          <Container>
            <SectionHeading
              eyebrow="Book a slot"
              intro="If you would rather talk live, take a discovery slot on the calendar. Same team, no ticket queue."
            />
            <div className="mt-10">
              <CalEmbed url={cal} />
            </div>
          </Container>
        </section>
      ) : null}
    </>
  );
}
