import Image from "next/image";
import { ArrowRight, CreditCard } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { stagger } from "@/components/ui/stagger";
import { OpenInquiry } from "@/components/site/OpenInquiry";
import {
  MpesaMark,
  AirtelMoneyMark,
  BankMark,
  CardMark,
} from "@/components/brand/PaymentLogos";
import { products, payments } from "@/lib/content";

/**
 * Each rail renders on its own white tile: the two mobile-money brands as their
 * own logos, the generic rails as a glyph plus label.
 */
const paymentMark: Record<string, React.ReactNode> = {
  "M-Pesa": <MpesaMark className="h-[26px] w-auto" />,
  "Airtel Money": <AirtelMoneyMark className="h-11 w-auto" />,
  "Bank transfers": (
    <>
      <BankMark className="h-[22px] w-[22px] text-white/70" />
      <span className="text-sm font-medium text-white/80">Bank transfers</span>
    </>
  ),
  "Card payments": (
    <>
      <CardMark className="h-[22px] w-[22px] text-white/70" />
      <span className="text-sm font-medium text-white/80">Card payments</span>
    </>
  ),
};

export function Products() {
  return (
    <section
      id="products"
      className="relative overflow-hidden bg-ink-950 py-24 lg:py-32 text-white"
    >
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-25" aria-hidden />
      <Container className="relative">
        <SectionHeading
          tone="light"
          eyebrow="Our products & platforms"
          intro="We build and run our own products alongside client work. Apps, plugins, and point-of-sale systems, with the payment rails already in them."
        />

        {/* Products: clean bordered grid, hairline dividers. The cards are not
            links, so hover stays a warming of the surface rather than a lift:
            the hairline gaps are drawn by the grid background and any transform
            would tear them open. */}
        <div className="mt-14 grid gap-px border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p, i) => (
            <Reveal key={p.title} delay={stagger(i, 3)} className="flex">
              <div className="group flex w-full flex-col bg-ink-950 p-8 transition-colors duration-300 ease-out-expo hover:bg-ink-900">
                <p.icon className="h-7 w-7 text-brand-500 transition-[color,transform] duration-300 ease-out-expo group-hover:scale-110 group-hover:text-brand-400" />
                <h3 className="mt-6 text-lg font-semibold text-white">{p.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-white/60 transition-colors duration-300 ease-out-expo group-hover:text-white/75">
                  {p.description}
                </p>
                <p className="mt-6 text-xs font-medium uppercase tracking-wide text-white/35 transition-colors duration-300 ease-out-expo group-hover:text-white/55">
                  {p.tags.join("  ·  ")}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Payments: minimal strip */}
        <Reveal delay={0.08}>
          <div className="mt-6 overflow-hidden border border-white/10">
            {/* Two real columns rather than a floating overlay: the photo can
                never sit under the copy, at any viewport width. */}
            <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,400px)]">
              <div className="p-8 lg:p-10">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-6 w-6 text-brand-500" />
                  <h3 className="text-xl font-semibold text-white">
                    Payment integrations
                  </h3>
                </div>
                <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-white/60">
                  Accept payments the way your customers actually pay. We wire mobile money,
                  bank, and card rails into your products, secure and reconciled.
                </p>
                <ul className="mt-7 grid grid-cols-2 gap-px border border-white/10 bg-white/10 sm:grid-cols-4">
                  {payments.map((pm) => (
                    <li
                      key={pm}
                      className="flex h-16 items-center justify-center gap-2.5 bg-ink-950 px-3"
                    >
                      {paymentMark[pm] ?? (
                        <span className="text-sm font-medium text-white/80">{pm}</span>
                      )}
                    </li>
                  ))}
                </ul>

                <OpenInquiry className="group mt-8 inline-flex cursor-pointer items-center gap-2 bg-brand-500 px-6 py-3.5 text-sm font-medium text-white transition-[background-color,box-shadow,transform] duration-300 ease-out-expo hover:-translate-y-0.5 hover:bg-brand-600 hover:shadow-[0_14px_34px_-12px_rgba(249,115,22,0.8)] active:translate-y-0 active:duration-100">
                  Integrate payments
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-300 ease-out-expo group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </OpenInquiry>
              </div>

              {/* Contactless-payment photo, feathered into the panel on its left edge. */}
              <div className="relative hidden lg:block" aria-hidden>
                <Image
                  src="/logos/payments/card-payments.jpg"
                  alt=""
                  fill
                  sizes="400px"
                  className="object-cover object-center"
                />
                {/* Already dark and warm, so only a light tint; the left feather
                    hands the edge back to the copy column. */}
                <div className="absolute inset-0 bg-ink-950/20" />
                <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/40 to-transparent" />
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
