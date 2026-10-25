import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { getFeaturedClients } from "@/lib/cms";
import { publicMediaUrl } from "@/lib/constants";

export async function ClientsStrip() {
  const clients = await getFeaturedClients();
  if (clients.length === 0) return null;
  return (
    <section className="bg-[#f3f6f8] py-8 sm:py-10">
      <Container>
        <p className="text-center text-sm text-muted">Organisations we have shipped for</p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-12 gap-y-6 rounded-2xl bg-white px-6 py-5 shadow-[0_10px_30px_-20px_rgba(11,14,20,0.35)]">
          {clients.map((c) => {
            const logo = publicMediaUrl(c.logo_path);
            const inner = logo ? (
              <Image src={logo} alt={c.name} width={120} height={40} className="h-8 w-auto object-contain" />
            ) : (
              <span className="text-sm font-medium text-ink-900">{c.name}</span>
            );
            return c.url ? (
              <a key={c.id} href={c.url} target="_blank" rel="noreferrer" className="opacity-80 hover:opacity-100">
                {inner}
              </a>
            ) : (
              <span key={c.id}>{inner}</span>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
