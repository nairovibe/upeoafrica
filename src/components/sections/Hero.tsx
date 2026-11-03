import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { OpenInquiry } from "@/components/site/OpenInquiry";
import { Container } from "@/components/ui/Container";
import { company } from "@/lib/content";

const tel = company.phone.replace(/\s/g, "");

const mobileDesigns = [
  {
    src: "/hero/mobile-pay.svg",
    alt: "Mobile wallet design with a KES balance, send and request actions, and recent payments",
  },
  {
    src: "/hero/mobile-shop.svg",
    alt: "Mobile shop design with product cards priced in Kenyan shillings and a checkout bar",
  },
  {
    src: "/hero/mobile-insights.svg",
    alt: "Mobile insights design with a weekly orders chart and visit statistics",
  },
];

function PhoneStack({ hidden = false }: { hidden?: boolean }) {
  return (
    <div aria-hidden={hidden || undefined} className="flex flex-col gap-3 pb-3">
      {mobileDesigns.map((design) => (
        // SVGs are original interface designs, served as images so the phone
        // frame stays crisp inside the scrolling column.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={design.src}
          src={design.src}
          alt={hidden ? "" : design.alt}
          className="w-full drop-shadow-[0_10px_18px_rgba(11,14,20,0.16)]"
        />
      ))}
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="bg-hero-grid pointer-events-none absolute inset-0" aria-hidden />
      <Container className="relative grid items-center gap-12 pt-36 pb-28 md:pt-44 md:pb-36 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-16 lg:pt-52 lg:pb-44">
        <div className="order-1 max-w-[650px]">
          <h1 className="text-3xl font-bold leading-[1.08] text-black sm:text-4xl md:text-[2.75rem]">
            We design, build, and scale software for businesses across Africa.
          </h1>

          <p className="mt-6 max-w-[560px] text-lg leading-relaxed text-body">
            Upeo Africa Technologies is a software company in Mombasa, Kenya. We deliver custom
            web and mobile apps, payment rails integration, branding, and digital marketing.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <OpenInquiry className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-full bg-brand-500 px-6 font-display text-[14px] font-semibold leading-5 text-white transition-colors duration-300 hover:bg-brand-600">
              Start a project
              <ArrowRight className="h-4 w-4" aria-hidden />
            </OpenInquiry>
            <a
              href={`tel:${tel}`}
              className="inline-flex h-9 items-center justify-center rounded-full border border-black px-5 font-display text-[14px] font-medium leading-5 text-black transition-colors duration-300 hover:bg-black hover:text-white"
            >
              Call {company.phone}
            </a>
          </div>
        </div>

        <div className="order-2 grid grid-cols-[minmax(108px,0.42fr)_minmax(0,1fr)] items-stretch gap-4 sm:grid-cols-[minmax(148px,0.4fr)_minmax(0,1fr)]">
          <div
            className="hero-reel relative min-h-0 overflow-hidden"
            role="region"
            tabIndex={0}
            aria-roledescription="carousel"
            aria-label="Mobile product designs. Hover or focus to pause."
          >
            <div className="absolute inset-0 overflow-hidden">
              <div className="animate-hero-phones flex flex-col px-1 pt-2 motion-reduce:animate-none">
                <PhoneStack />
                <PhoneStack hidden />
              </div>
            </div>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-white to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white to-transparent" />
          </div>

          <div className="relative aspect-[4/5] overflow-hidden rounded-[7px] sm:aspect-[5/4]">
            <Image
              src="/capabilities/build.jpg"
              alt="Laptop on a desk with source code on the screen"
              fill
              priority
              sizes="(min-width: 1024px) 420px, 70vw"
              className="object-cover object-[center_30%]"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
