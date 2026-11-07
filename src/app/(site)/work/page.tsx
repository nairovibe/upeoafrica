import type { Metadata } from "next";
import { Suspense } from "react";
import { CTA } from "@/components/sections/CTA";
import { PageHeader } from "@/components/site/PageHeader";
import { CountriesServed } from "@/components/work/CountriesServed";
import { WorkIndex, WorkIndexFromUrl } from "@/components/work/WorkIndex";
import { getPublishedWork } from "@/lib/cms";

const intro =
  "Projects we have delivered for clients in Kenya and abroad. Each one shows the work and the stack behind it, with a scrolling preview where the site can be shown. Work under NDA is listed without the client or the address.";

export const metadata: Metadata = {
  title: "Our Work",
  description: intro,
  alternates: { canonical: "/work" },
  openGraph: { title: "Our Work", description: intro, url: "/work" },
};

export default async function WorkPage() {
  const work = await getPublishedWork();

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Our Work" }]}
        title="Our Work"
        intro={intro}
      />
      <CountriesServed />
      <Suspense fallback={<WorkIndex work={work} page={1} />}>
        <WorkIndexFromUrl work={work} />
      </Suspense>
      <CTA
        title="Have a similar project in mind?"
        intro="Send us the brief. We reply with how we would approach it, a timeline, and a price."
      />
    </>
  );
}
