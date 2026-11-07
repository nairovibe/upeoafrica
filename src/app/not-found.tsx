import Link from "next/link";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { InquiryModal } from "@/components/site/InquiryModal";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { NotFoundAnimation } from "@/components/site/NotFoundAnimation";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

const waysBack = [
  { href: "/services", label: "Services" },
  { href: "/products", label: "Products" },
  { href: "/work", label: "Our work" },
  { href: "/founders", label: "Founders Zone" },
  { href: "/events", label: "Events" },
  { href: "/blogs", label: "Blogs" },
];

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main id="main">
        <section className="relative overflow-hidden bg-ink-950 pt-36 pb-24 text-white md:pt-44 md:pb-32">
          <div className="pointer-events-none absolute inset-0 bg-grid opacity-30" aria-hidden />
          <div
            className="pointer-events-none absolute -left-24 top-24 h-[420px] w-[420px] rounded-full bg-brand-500/20 blur-3xl"
            aria-hidden
          />
          <Container className="relative grid items-center gap-6 lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)] lg:gap-16">
            <NotFoundAnimation />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-400">Error 404</p>
              <h1 className="mt-4 max-w-xl font-display text-4xl font-bold leading-[1.05] text-white sm:text-5xl">
                This page is off the map.
              </h1>
              <p className="mt-5 max-w-lg text-[16px] leading-relaxed text-white/70">
                The address may be old, or the page was never published. The studio is still here:
                services, products, and a team that answers.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button href="/" withArrow>
                  Back home
                </Button>
                <Button
                  href="/products"
                  variant="outline"
                  withArrow
                  className="border-white/20 bg-transparent text-white hover:border-brand-500 hover:bg-brand-500 hover:text-white"
                >
                  Browse products
                </Button>
                <Button
                  href="/contact"
                  variant="outline"
                  className="border-white/20 bg-transparent text-white hover:border-white hover:bg-white hover:text-ink-950"
                >
                  Contact the studio
                </Button>
              </div>
              <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
                {waysBack.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm font-medium text-white/70 underline decoration-transparent underline-offset-4 transition-[color,text-decoration-color] duration-300 hover:text-brand-400 hover:decoration-brand-400"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </Container>
        </section>
      </main>
      <Footer />
      <InquiryModal />
      <WhatsAppButton />
    </>
  );
}
