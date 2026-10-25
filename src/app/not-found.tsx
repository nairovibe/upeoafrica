import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main id="main">
        <section className="flex min-h-[70vh] items-center bg-ink-950 pt-36 pb-32 text-white md:pt-48">
          <Container>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-400">404</p>
            <h1 className="mt-4 max-w-xl font-display text-4xl font-bold text-white sm:text-5xl">
              That page is not on this site.
            </h1>
            <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-white/65">
              The URL may be old, or the work has not been published yet. Head home, or tell us what you were looking for.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/">Home</Button>
              <Button href="/contact" variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10">
                Contact
              </Button>
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
