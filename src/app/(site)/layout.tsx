import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { InquiryModal } from "@/components/site/InquiryModal";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { GtmSnippet } from "@/components/site/GtmSnippet";
import { company } from "@/lib/content";
import { getPublicSettings } from "@/lib/cms";

const siteUrl = "https://upeoafricatechnologies.co.ke";

/** Serve public pages from cache. Console publishes call revalidate and refresh them. */
export const revalidate = 43200;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getPublicSettings();
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID || settings?.gtm_id || "";

  return (
    <>
      {gtmId ? <GtmSnippet id={gtmId} /> : null}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ProfessionalService",
            name: company.legalName,
            description:
              "Full-service digital agency in Mombasa: custom software, web & mobile apps, UI/UX and branding, digital marketing, WordPress and POS plugins, and payment integrations (M-Pesa, Airtel Money, bank, card).",
            url: siteUrl,
            email: company.email,
            telephone: company.phone,
            areaServed: "KE",
            address: {
              "@type": "PostalAddress",
              streetAddress: "88225 Moi Avenue",
              postOfficeBoxNumber: "88225-80100",
              addressLocality: "Mombasa",
              postalCode: "80100",
              addressCountry: "KE",
            },
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: company.googleRating,
              reviewCount: 1,
              bestRating: 5,
            },
          }),
        }}
      />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-[5px] focus:bg-ink-900 focus:px-5 focus:py-2.5 focus:text-sm focus:font-medium focus:text-white"
      >
        Skip to content
      </a>
      <Navbar
        linkedin={settings?.linkedin_url}
        xUrl={settings?.x_url}
        github={settings?.github_url}
      />
      <main id="main">{children}</main>
      <Footer linkedin={settings?.linkedin_url} xUrl={settings?.x_url} />
      <InquiryModal />
      <WhatsAppButton />
    </>
  );
}
