import { Container } from "@/components/ui/Container";
import map from "@/assets/maps/world-map.json";
import { cn } from "@/lib/utils";

const countries = [
  { id: "404", code: "ke", name: "Kenya" },
  { id: "646", code: "rw", name: "Rwanda" },
  { id: "834", code: "tz", name: "Tanzania" },
  { id: "508", code: "mz", name: "Mozambique" },
  { id: "120", code: "cm", name: "Cameroon" },
  { id: "566", code: "ng", name: "Nigeria" },
  { id: "288", code: "gh", name: "Ghana" },
  { id: "694", code: "sl", name: "Sierra Leone" },
  { id: "450", code: "mg", name: "Madagascar" },
  { id: "706", code: "so", name: "Somalia" },
  { id: "710", code: "za", name: "South Africa" },
  { id: "840", code: "us", name: "USA" },
  { id: "826", code: "gb", name: "UK" },
  { id: "276", code: "de", name: "Germany" },
  { id: "634", code: "qa", name: "Qatar" },
  { id: "356", code: "in", name: "India" },
  { id: "724", code: "es", name: "Spain" },
  { id: "784", code: "ae", name: "UAE" },
  { id: "682", code: "sa", name: "Saudi Arabia" },
] as const;

const names = new Map<string, string>(countries.map((country) => [country.id, country.name]));

export function CountriesServed() {
  return (
    <section aria-labelledby="countries-served" className="bg-white pt-14 lg:pt-20">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
          <div>
            <h2 id="countries-served" className="font-display text-3xl font-bold leading-[1.08] text-ink-900 sm:text-4xl">
              {countries.length} countries served
            </h2>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-body">
              Our distributed engineering teams support cross-border deployments and multi-country compliance requirements, enabling institutions with regional and international mandates to work with one vendor.
            </p>
            <ul className="mt-8 flex flex-wrap gap-2" aria-label="Countries">
              {countries.map((country) => (
                <li key={country.code}>
                  <span className="inline-flex h-11 items-center gap-2 rounded-[5px] border border-line bg-white px-2.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/flags/${country.code}.svg`}
                      alt=""
                      width={28}
                      height={20}
                      className="h-5 w-7 rounded-[2px] object-cover"
                    />
                    <span className="text-sm font-medium text-ink-900">{country.name}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <svg viewBox={map.viewBox} aria-hidden="true" className="h-auto w-full">
            {map.countries.map((country, index) =>
              country.d ? (
                <path
                  key={`${country.id}-${index}`}
                  d={country.d}
                  className={cn("stroke-white [stroke-width:0.7]", country.served ? "fill-brand-500" : "fill-surface-3")}
                >
                  {country.served ? <title>{names.get(country.id)}</title> : null}
                </path>
              ) : null,
            )}
            {map.countries.map((country, index) =>
              country.marker ? (
                <circle
                  key={`${country.id}-mark-${index}`}
                  cx={country.marker[0]}
                  cy={country.marker[1]}
                  r={4.5}
                  className="fill-brand-500 stroke-white [stroke-width:1.5]"
                >
                  <title>{names.get(country.id)}</title>
                </circle>
              ) : null,
            )}
          </svg>
        </div>
      </Container>
    </section>
  );
}
