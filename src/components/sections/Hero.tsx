import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { OpenInquiry } from "@/components/site/OpenInquiry";
import { Container } from "@/components/ui/Container";
import { company } from "@/lib/content";

const tel = company.phone.replace(/\s/g, "");

export function Hero() {
  return (
    <section className="bg-white">
      <Container className="grid items-start gap-10 pt-28 pb-16 md:pt-40 md:pb-20 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center lg:gap-10">
        <div className="max-w-[650px]">
          <h1 className="text-3xl font-bold leading-[1.08] text-black sm:text-4xl md:text-[2.75rem]">
            We design, build, and scale software for businesses across Africa.
          </h1>

          <p className="mt-6 max-w-[560px] text-lg leading-relaxed text-body">
            Upeo Africa Technologies is a software company in Mombasa, Kenya. We deliver custom
            web and mobile apps, payment rails integration, branding, and digital marketing.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <OpenInquiry
              className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-full bg-brand-500 px-6 font-display text-[14px] font-semibold leading-5 text-white transition-colors duration-300 hover:bg-brand-600"
            >
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

        <div className="relative mx-auto w-full max-w-[560px] lg:mx-0 lg:max-w-none lg:justify-self-end">
          <div className="relative aspect-[928/882] w-full overflow-hidden rounded-[7px] shadow-none">
            {/* Unsplash photo-1484417894907 — a laptop with code open, no person. */}
            <Image
              src="/hero/laptop.jpg"
              alt="Laptop open on a desk, with source code on the screen"
              fill
              priority
              sizes="(min-width: 1024px) 560px, 100vw"
              className="object-cover object-center shadow-none"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
