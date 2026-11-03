import type { Metadata } from "next";
import { Hero } from "@/components/sections/Hero";
import { company } from "@/lib/content";
import { TechMarquee } from "@/components/sections/TechMarquee";
import { Capabilities } from "@/components/sections/Capabilities";
import { Services } from "@/components/sections/Services";
import { WhyUs } from "@/components/sections/WhyUs";
import { Products } from "@/components/sections/Products";
import { HowWeWork } from "@/components/sections/HowWeWork";
import { Industries } from "@/components/sections/Industries";
import { ClientsStrip } from "@/components/sections/ClientsStrip";
import { GoogleRating } from "@/components/sections/GoogleRating";
import { CTA } from "@/components/sections/CTA";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: {
    url: company.domain,
    title: `${company.name} · Software, Design & Marketing`,
    description:
      "Upeo Africa Technologies designs and builds custom web and mobile apps, M-Pesa and Airtel Money payments, branding, and digital marketing from Mombasa, Kenya, for businesses across Africa.",
  },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <ClientsStrip />
      <TechMarquee />
      <Capabilities />
      <Services />
      <WhyUs />
      <Products />
      <HowWeWork />
      <Industries />
      <GoogleRating />
      <CTA intro="Tell us the initiative. We scope it, price it, and stay with it through launch." />
    </>
  );
}
