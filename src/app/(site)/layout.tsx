import type { Metadata } from "next";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { InquiryModal } from "@/components/site/InquiryModal";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { GtmSnippet } from "@/components/site/GtmSnippet";
import { TrackingTags } from "@/components/site/TrackingTags";
import { ClaritySnippet } from "@/components/site/ClaritySnippet";
import { AdSenseAuto } from "@/components/site/AdSenseAuto";
import { ADSENSE_CLIENT } from "@/lib/adsense";
import { company } from "@/lib/content";
import { getPublicSettings } from "@/lib/cms";
import { adsenseAccount, GOOGLE_VERIFICATION_FALLBACK, matchToken, measurementId, VERIFY } from "@/lib/search-presence";

const siteUrl = company.domain;

/** Serve public pages from cache. Console publishes call revalidate and refresh them. */
export const revalidate = 43200;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings();
  const google = matchToken(settings?.google_site_verification, VERIFY.google) || GOOGLE_VERIFICATION_FALLBACK;
  const other: Record<string, string> = {};
  const bing = matchToken(settings?.bing_site_verification, VERIFY.bing);
  const baidu = matchToken(settings?.baidu_site_verification, VERIFY.baidu);
  const yandex = matchToken(settings?.yandex_site_verification, VERIFY.yandex);
  const facebook = matchToken(settings?.facebook_domain_verification, VERIFY.facebook);
  const adsense = adsenseAccount(settings?.google_adsense_account) || ADSENSE_CLIENT;
  if (bing) other["msvalidate.01"] = bing;
  if (baidu) other["baidu-site-verification"] = baidu;
  if (yandex) other["yandex-verification"] = yandex;
  if (facebook) other["facebook-domain-verification"] = facebook;
  if (adsense) other["google-adsense-account"] = adsense;
  return { verification: { google, other: Object.keys(other).length ? other : undefined } };
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getPublicSettings();
  const gtmRaw = process.env.NEXT_PUBLIC_GTM_ID || settings?.gtm_id || "";
  const gtmId = /^GTM-[A-Z0-9]+$/i.test(gtmRaw) ? gtmRaw : "";

  return (
    <>
      {gtmId ? <GtmSnippet id={gtmId} /> : null}
      <TrackingTags
        pixelId={settings?.meta_pixel_id}
        adsId={settings?.google_ads_id}
        gaId={gtmId ? "" : measurementId(settings?.google_analytics_id)}
      />
      <ClaritySnippet />
      <AdSenseAuto />
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
