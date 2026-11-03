import { Hero } from "@/components/sections/Hero";
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
