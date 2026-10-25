import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { CTA } from "@/components/sections/CTA";
import { ProcessTimeline } from "@/components/process/ProcessTimeline";
import { pageImages } from "@/lib/images";

const intro =
  "At Upeo Africa Technologies, we follow a structured, end-to-end onboarding and delivery framework for software projects. The framework aligns each engagement with organizational goals, keeps scope, timeline, and investment transparent, and delivers secure, scalable systems for businesses across Africa.";

const steps: { n: string; title: string; body: string }[] = [
  {
    n: "01",
    title: "Initial Engagement",
    body: "We receive your inquiry through the official channels of Upeo Africa Technologies, by phone, email, or the project form. The team replies within one business day, addresses the opening questions, and schedules a formal project discovery session.",
  },
  {
    n: "02",
    title: "Confidentiality Alignment",
    body: "Before any product mechanism is shared, we issue a confidentiality note that protects proprietary and sensitive information. You describe the business problem. The idea, the product, and the code remain yours.",
  },
  {
    n: "03",
    title: "Project Briefing and Requirements Workshop",
    body: "A structured session with the people who will operate the system. We document the business processes and challenges, define the system objectives and requirements, and assess technical and operational fit before a solution is proposed.",
  },
  {
    n: "04",
    title: "Formal Proposal Submission",
    body: "We submit a written proposal covering the detailed scope of work, the system architecture and technical approach, the delivery timeline and milestones, the investment, the recommended technology stack, and the project team, including post-deployment support.",
  },
  {
    n: "05",
    title: "Research and Solution Development",
    body: "After the briefing, our designers and software engineers research the operation further and develop a solution aligned to your workflows, scalability needs, and security requirements, including payment rails where the product must take payment.",
  },
  {
    n: "06",
    title: "Negotiation and Agreement",
    body: "We refine scope, timelines, and the investment structure with you until they match internal budgets and operational expectations. Delivery does not start on terms that have not been accepted.",
  },
  {
    n: "07",
    title: "Written Agreement",
    body: "The agreed scope, timeline, investment, and ownership are confirmed in writing before kick-off. That document is the agreement the team builds against.",
  },
  {
    n: "08",
    title: "Project Milestone Mapping",
    body: "The delivery team maps the key milestones and the dates attached to each one. During the build, working software is demonstrated every fortnight, so progress is visible against that plan.",
  },
  {
    n: "09",
    title: "Project Kick-off",
    body: "Design begins on the user experience while engineering establishes the system architecture and the environments the product will run in. Both tracks follow one plan, held by the same team.",
  },
  {
    n: "10",
    title: "Governance and Progress Reporting",
    body: "We maintain consistent communication through fortnightly demonstrations, stakeholder review sessions, and direct reporting on milestones and risks. What you review is working software, with issues stated in the same session.",
  },
  {
    n: "11",
    title: "Testing and Quality Assurance",
    body: "Each increment is tested before it is presented. Before launch we validate stability, security, function, and usability, including payment flows, under the conditions your customers actually use.",
  },
  {
    n: "12",
    title: "Project Completion and Handover",
    body: "We hand over the source-code repository and access credentials, the compiled web and mobile builds, technical documentation, and the design assets that belong to the product. Intellectual property, repositories, and cloud access transfer to you in writing.",
  },
  {
    n: "13",
    title: "Ongoing Support and Partnership",
    body: "Upeo Africa Technologies remains the technology partner after go-live, covering system maintenance, continuous improvement, and scalability support. Critical operational issues carry a target response of under one hour under our service level agreement, and digital marketing stays with the same team as the product grows.",
  },
];

export const metadata: Metadata = {
  title: "Our Client Onboarding & Delivery Framework",
  description: intro,
};

export default function ProcessPage() {
  return (
    <>
      <section className="bg-white pt-32 pb-16 md:pt-40 lg:pb-24">
        <Container className="grid items-start gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.85fr)] lg:gap-16">
          <div>
            <nav aria-label="Breadcrumb" className="mb-5">
              <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium uppercase tracking-[0.14em] text-muted">
                <li>
                  <Link href="/" className="transition-colors duration-300 hover:text-brand-600">
                    Home
                  </Link>
                </li>
                <li aria-hidden className="text-ink-900/30">
                  /
                </li>
                <li className="text-ink-900">Our Process</li>
              </ol>
            </nav>
            <h1 className="max-w-xl text-3xl font-bold leading-[1.08] text-ink-900 sm:text-4xl md:text-[2.75rem]">
              Our Client Onboarding &amp; Delivery Framework
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-body">{intro}</p>
          </div>
          <div className="relative aspect-[4/5] max-h-[520px] overflow-hidden rounded-[7px]">
            <Image
              src={pageImages.aboutTeam}
              alt="Upeo Africa Technologies team reviewing a project plan"
              fill
              sizes="(max-width: 1024px) 100vw, 42vw"
              className="object-cover object-center"
              priority
            />
          </div>
        </Container>
      </section>

      <section className="bg-[#edf3f8] py-24 lg:py-32">
        <Container>
          <h2 className="max-w-3xl text-3xl font-bold leading-[1.08] text-ink-900 sm:text-4xl md:text-[2.75rem]">
            Process Overview
          </h2>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-body">
            Thirteen stages, from the first inquiry to ongoing support. Each stage produces a written outcome and is delivered by the same designers, software engineers, and marketers.
          </p>
          <ProcessTimeline steps={steps} />
        </Container>
      </section>

      <CTA
        title="Begin with a formal discovery session"
        intro="Tell us the initiative. Upeo Africa Technologies will scope it, price it, and stay with it through launch and support."
      />
    </>
  );
}
