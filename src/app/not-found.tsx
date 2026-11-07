import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { InquiryModal } from "@/components/site/InquiryModal";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { GoBackButton, NotFoundAnimation } from "@/components/site/NotFoundAnimation";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main id="main" className="bg-white">
        <section className="bg-white pt-32 pb-20 md:pt-40 md:pb-28">
          <Container className="mx-auto max-w-xl text-center">
            <NotFoundAnimation />
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">404</p>
            <h1 className="mt-3 text-3xl font-bold leading-[1.08] text-ink-900 sm:text-4xl md:text-[2.75rem]">
              This page is not here.
            </h1>
            <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-body">
              The link may be old, or the page was never published.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <GoBackButton />
              <Button href="/contact" variant="outline">
                Contact us
              </Button>
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
