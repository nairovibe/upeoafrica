import type { Metadata } from "next";
import { Suspense } from "react";
import { CTA } from "@/components/sections/CTA";
import { WorkIndex, WorkIndexFromUrl } from "@/components/work/WorkIndex";
import { getPublishedWork } from "@/lib/cms";

const intro =
  "Projects we have delivered for businesses in Kenya and abroad: custom software, web and mobile apps, M-Pesa and card payments, branding, and marketing. Each case study covers the brief, what we built, and the results after launch.";

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
      <Suspense fallback={<WorkIndex work={work} />}>
        <WorkIndexFromUrl work={work} />
      </Suspense>
      <CTA
        title="Have a similar project in mind?"
        intro="Send us the brief. We reply with how we would approach it, a timeline, and a price."
      />
    </>
  );
}
