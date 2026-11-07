import type { LucideIcon } from "lucide-react";
import {
  Code2,
  Smartphone,
  Globe,
  PenTool,
  Palette,
  Megaphone,
  Search,
  Plug,
  Cloud,
} from "lucide-react";

/**
 * The full service catalogue. Each entry carries everything its page needs:
 * the pitch, the specialisms underneath it, what the client walks away with,
 * and the questions they actually ask before signing.
 *
 * Kept apart from content.ts because this is the largest single body of copy on
 * the site and it drives nine generated routes on its own.
 */

export type ProcessStep = {
  title: string;
  description: string;
};

export type Specialism = {
  title: string;
  description: string;
};

export type ServiceFaq = {
  q: string;
  a: string;
};

export type Service = {
  slug: string;
  title: string;
  icon: LucideIcon;
  /** One line for the homepage grid. */
  short: string;
  /** Card copy: the client's problem first, then what they get from us. */
  description: string;
  features: string[];
  image: string;
  imageAlt: string;
  detail: {
    /**
     * The page's hero paragraph AND its meta description: they are the same
     * string by design, see `generateMetadata` in the service route.
     *
     * So it is never written for looks. Every lead must carry: the stake or
     * problem in the client's terms, the company name, the service keywords
     * someone would actually type into Google, the places we serve, and a
     * concrete outcome. This is the text that represents the page in search
     * results and in the sitemap we submit, so a vague or purely atmospheric
     * line here is a wasted ranking opportunity.
     */
    lead: string;
    /** How we work on it. */
    body: string[];
    /** What they actually walk away with. */
    outcomes: string[];
  };
  /** How this particular engagement runs. Curated per service, because an
   *  SEO retainer and a payment integration do not run the same way. */
  process: ProcessStep[];
  /** The distinct pieces of work sold under this service. */
  specialisms: Specialism[];
  faqs: ServiceFaq[];
};

export const services: Service[] = [
  {
    slug: "web-applications",
    title: "Custom Web Applications",
    icon: Code2,
    short: "Scalable, secure platforms that run your operations.",
    description:
      "Spreadsheets and off-the-shelf tools stop fitting once the work outgrows them. Our developers build the web platform around the way your team actually works, so people stop keeping a second system on the side.",
    features: ["Enterprise dashboards", "Workflow automation", "Role-based access", "Real-time data"],
    image: "/services/web-applications.jpg",
    imageAlt: "Two developers at Upeo Africa Technologies writing application code at their workstations",
    detail: {
      lead:
        "Off-the-shelf software stops fitting the moment the work outgrows it. The developers at Upeo Africa Technologies build custom web applications for businesses in Kenya and across Africa: internal systems, customer portals, and reporting dashboards shaped around your approvals, your reports, and the way your team already works.",
      body: [
        "Our team sits with the people who will use the system every day and maps how the work really flows, not how a process document says it should. That is usually where the expensive surprises hide, and finding them in week one costs a conversation instead of a rebuild.",
        "Our developers then build the platform around that map: your rules, your approvals, your reports. It runs on infrastructure our team manages, it is secured from the first commit, and it is built so that doubling your staff does not mean starting again.",
      ],
      outcomes: [
        "A platform shaped around your workflow, not a template you bend to fit",
        "Role-based access so staff see exactly what they should and nothing more",
        "Dashboards and reports your managers actually open",
        "Source code, documentation, and handover so you are never locked in",
      ],
    },
    process: [
      {
        title: "Discovery workshop",
        description:
          "We sit with the people who will use the system daily and map how the work actually flows, including the exceptions nobody documented.",
      },
      {
        title: "Blueprint and fixed scope",
        description:
          "You get the screens, the data model, the timeline, and the price in writing before any code is written.",
      },
      {
        title: "Build in two-week increments",
        description:
          "Working software you can click through every fortnight, so you steer the build rather than waiting to see it at the end.",
      },
      {
        title: "User testing and handover",
        description:
          "Your team uses it against real work while we fix what trips them up, then we train them and hand over the repositories.",
      },
      {
        title: "Support and iterate",
        description:
          "We host it, monitor it, and keep improving it as your process changes. Most clients keep us on for exactly that reason.",
      },
    ],
    specialisms: [
      {
        title: "Internal Business Systems",
        description:
          "The system your operations run on: jobs, stock, approvals, and staff. Built around your process so people stop keeping a private spreadsheet on the side because the software does not fit.",
      },
      {
        title: "Customer Portals",
        description:
          "Give clients a place to check status, download documents, and pay, without calling your office. Fewer routine phone calls for your team and a better answer for the customer at 9pm.",
      },
      {
        title: "Dashboards & Reporting",
        description:
          "The numbers that decide your week, in one place and current. We build reports from the questions your managers keep asking, not from whatever the database happens to make easy.",
      },
      {
        title: "Workflow Automation",
        description:
          "The repetitive steps between systems, done automatically. Approvals routed, records created, notifications sent, so your team spends its day on judgement calls rather than data entry.",
      },
    ],
    faqs: [
      {
        q: "How long does a custom web application take to build?",
        a: "Most projects run eight to sixteen weeks from first workshop to launch, depending on how many workflows are involved. We break it into phases so you see working software early rather than waiting until the end to find out whether it fits.",
      },
      {
        q: "Do we own the code you write for us?",
        a: "Yes. On final payment the intellectual property in everything built for you is assigned to you in writing, with the repositories and the documentation. Our developers keep clients because the work is good, not because leaving is difficult.",
      },
      {
        q: "Can you work with the systems we already have?",
        a: "Usually, yes. Most businesses have an accounting package, a CRM, or a payment provider that has to stay. We integrate with what works and replace only what is genuinely holding you back.",
      },
    ],
  },
  {
    slug: "mobile-apps",
    title: "Mobile App Development",
    icon: Smartphone,
    short: "Native-grade Android and iOS apps people love to use.",
    description:
      "Your customers buy on a phone, often on a weak connection, and they pay with mobile money. Our developers build Android and iOS apps for those conditions, then take them live on both stores.",
    features: ["iOS & Android", "Offline-first", "Push & M-Pesa", "App Store launch"],
    image: "/services/mobile-apps.jpg",
    imageAlt: "A developer writing application code on a laptop while testing the build on a connected phone",
    detail: {
      lead:
        "Your customers buy on a phone, often on a weak connection, and they pay with mobile money. The developers at Upeo Africa Technologies build offline-first Android and iOS apps for businesses in Kenya and across Africa, with M-Pesa and Airtel Money integrated, then submit them to both stores and keep them updated.",
      body: [
        "Our developers build for the conditions your users are actually in: intermittent data, older Android handsets, and mobile money as the default way to pay. Offline-first is a decision our team makes in week one, not a patch added after the complaints start.",
        "Design, build, store submission, and the updates afterwards stay with one team. Our developers handle review policy and release notes, so you are not learning App Store rules against a launch deadline.",
      ],
      outcomes: [
        "One codebase serving both Android and iOS users",
        "Works on a weak connection instead of failing on it",
        "M-Pesa and Airtel Money built in, not bolted on",
        "Submitted, approved, and live on both stores",
      ],
    },
    process: [
      {
        title: "Scope and platform plan",
        description:
          "What the app must do, which devices matter, and where offline behaviour is non-negotiable. Decided before design, because it shapes everything after.",
      },
      {
        title: "Design and prototype",
        description:
          "Clickable screens you can hand to a real user before we build, which is the cheapest possible moment to change your mind.",
      },
      {
        title: "Build and device testing",
        description:
          "Built once for both platforms, then tested on the mid-range Android handsets your customers actually own, not just on a simulator.",
      },
      {
        title: "Store submission",
        description:
          "We handle developer accounts, listings, screenshots, privacy declarations, and the review process that catches most first-time launches out.",
      },
      {
        title: "Updates and monitoring",
        description:
          "Crash reporting, usage analytics, and the OS-upgrade releases that quietly break apps nobody is maintaining.",
      },
    ],
    specialisms: [
      {
        title: "Android & iOS Apps",
        description:
          "One codebase, both platforms, native-grade performance. Your Android users are the majority in this market and they are not an afterthought in how we build or how we test.",
      },
      {
        title: "Offline-First Apps",
        description:
          "For field teams, delivery riders, and agents who lose signal constantly. The app keeps working, queues what it cannot send, and syncs cleanly when the connection returns.",
      },
      {
        title: "Mobile Money & In-App Payments",
        description:
          "M-Pesa, Airtel Money, and card payments inside the app, with the callbacks and reconciliation handled properly so your finance team is not matching payments by hand.",
      },
      {
        title: "App Store Launch & Maintenance",
        description:
          "Submission, review, and the updates afterwards. We manage store listings, screenshots, and the OS upgrades that quietly break apps nobody is maintaining.",
      },
    ],
    faqs: [
      {
        q: "Do we need separate apps for Android and iOS?",
        a: "No. We build from a single codebase that ships to both stores, which keeps your build cost and your ongoing maintenance far lower than commissioning two native apps. Where a feature genuinely needs platform-specific code, we write it.",
      },
      {
        q: "Can the app work without internet?",
        a: "Yes, and for most businesses here it should. We design offline-first where it matters, so the app keeps working on a weak connection and syncs when signal returns rather than showing an error and losing the work.",
      },
      {
        q: "Who handles publishing to Google Play and the App Store?",
        a: "We do. That includes developer account setup, store listings, screenshots, privacy declarations, and the review process itself, which is where most first-time launches lose a week they had not planned for.",
      },
    ],
  },
  {
    slug: "websites-portals",
    title: "Websites & Portals",
    icon: Globe,
    short: "Fast, responsive sites that build trust and convert.",
    description:
      "A slow website loses the visitor who never calls. Our developers and designers build search-ready sites that load on mobile data and give your own team a way to update them.",
    features: ["SEO-ready", "CMS integration", "Fast on mobile data", "Analytics"],
    image: "/services/websites-portals.jpg",
    imageAlt: "A website open on a desktop monitor and on a phone held in front of it",
    detail: {
      lead:
        "A slow website loses the visitor who never calls. The developers and designers at Upeo Africa Technologies build websites, online stores, and customer portals for businesses in Kenya and across Africa that load quickly on mobile data, are structured for Google, and can be updated by your own team.",
      body: [
        "Our developers build each site to stay quick on a mid-range phone over mobile data, because that is how most of your visitors will see it. Performance is a requirement our team tests on every build, not a line we put in the proposal and forget.",
        "Every page is structured for search from the first layout, and the content system is one your own team can run. A price change should not need a ticket with our developers.",
      ],
      outcomes: [
        "Loads fast on mobile data, not just on office fibre",
        "Structured for search so you can rank rather than pay for every click",
        "A content system your team can update without a developer",
        "Analytics wired in so you can see what visitors actually do",
      ],
    },
    process: [
      {
        title: "Content and structure",
        description:
          "We agree what each page has to do and who it is for, then build the sitemap around search intent rather than your org chart.",
      },
      {
        title: "Design",
        description:
          "Mobile-first layouts you approve before build, designed for a phone on mobile data because that is how most visitors will arrive.",
      },
      {
        title: "Build and optimise",
        description:
          "Built for speed and structured for search from the first page, with a content system your own team can run.",
      },
      {
        title: "Launch and redirects",
        description:
          "Every old URL mapped to its new home so a redesign protects the rankings you already have instead of resetting them.",
      },
      {
        title: "Measure and improve",
        description:
          "Analytics wired in, then monthly changes based on what visitors actually do rather than what we assumed they would.",
      },
    ],
    specialisms: [
      {
        title: "Business Websites",
        description:
          "The site that has to earn trust before anyone calls you. Clear positioning, fast pages, and a contact path that works, built to convert visitors who are comparing you against three competitors.",
      },
      {
        title: "E-commerce Stores",
        description:
          "Product catalogue, checkout, and mobile money built to sell. We focus on the parts that lose sales quietly: search, delivery costs, and a checkout that survives a shaky connection.",
      },
      {
        title: "Landing Pages & Campaign Sites",
        description:
          "Single-purpose pages built for one campaign and one action. Fast to publish, measured properly, so you know what your ad spend actually returned.",
      },
      {
        title: "Website Redesign & Migration",
        description:
          "Rebuilding an existing site without losing the rankings you already have. Redirects mapped, content preserved, and search visibility protected through the move.",
      },
    ],
    faqs: [
      {
        q: "Will a redesign hurt our current Google rankings?",
        a: "It can, and it often does when redirects are not mapped properly. We audit your existing URLs, map every one to its new home, and keep the content that is already earning traffic, so the move protects your rankings instead of resetting them.",
      },
      {
        q: "Can we update the website ourselves afterwards?",
        a: "Yes. We build on a content system your team can use for text, images, prices, and blog posts, and we train you on it at handover. You should not need to pay a developer to change a phone number.",
      },
      {
        q: "How fast will the site be?",
        a: "We test on a mid-range Android phone over mobile data, not on office broadband, because that is what your visitors are using. Performance budgets are set at the start and checked before launch.",
      },
    ],
  },
  {
    slug: "product-design",
    title: "UI/UX & Product Design",
    icon: PenTool,
    short: "Intuitive interfaces focused on real engagement.",
    description:
      "If a person cannot finish the task in the first minute, they leave. Our designers test the interface with real users before our developers write the build, so more people complete what they came to do.",
    features: ["Product design", "Design systems", "Prototyping", "Usability testing"],
    image: "/services/product-design.jpg",
    imageAlt: "A designer reviewing interface sketches and wireframes pinned across a wall",
    detail: {
      lead:
        "If a person cannot finish the task in the first minute, they leave. The designers at Upeo Africa Technologies carry out UI and UX work for businesses in Kenya and across Africa: research, wireframes, a design system, and a prototype tested with real users before our developers write the build.",
      body: [
        "Our designers research before they draw. Who is using this, what are they trying to finish, and where do they currently give up? Those answers shape the interface far more than any trend does.",
        "You get a clickable prototype to react to before anything is built, which is the cheapest moment to change direction. Our designers then test it with real users and fix whatever trips them up.",
      ],
      outcomes: [
        "Prototypes you can click through before a line of code is written",
        "A design system that keeps every screen consistent as you grow",
        "Usability testing with real users, not internal opinion",
        "Fewer support calls because the interface explains itself",
      ],
    },
    process: [
      {
        title: "Research",
        description:
          "We talk to your users and watch them attempt real tasks, so the design solves an evidenced problem rather than an assumed one.",
      },
      {
        title: "Flows and wireframes",
        description:
          "The structure first, in grey boxes, because arguing about layout is far cheaper than arguing about colour.",
      },
      {
        title: "Visual design",
        description:
          "Your brand applied across every screen and every state, including the empty, loading, and error cases most designs forget.",
      },
      {
        title: "Prototype and test",
        description:
          "Clickable prototypes tested with five to eight people from your real audience, which surfaces most serious usability problems.",
      },
      {
        title: "Handover to build",
        description:
          "Component library, specs, and source files in a form your developers, or ours, can build from without guessing.",
      },
    ],
    specialisms: [
      {
        title: "UX Research & Audits",
        description:
          "Find out where your current product loses people, with evidence rather than opinion. We watch real users attempt real tasks and report exactly where and why they stop.",
      },
      {
        title: "Interface Design",
        description:
          "Screen-by-screen design for web and mobile, built mobile-first because that is where your users are. Clear hierarchy, obvious next steps, and states designed for errors as well as success.",
      },
      {
        title: "Design Systems",
        description:
          "A component library and the rules around it, so every new screen looks like it belongs and your developers stop rebuilding the same button. Consistency that survives your next hire.",
      },
      {
        title: "Prototyping & Usability Testing",
        description:
          "Clickable prototypes tested with people from your actual audience, before the build. Changing a prototype takes an afternoon; changing shipped software takes a sprint.",
      },
    ],
    faqs: [
      {
        q: "We already have a product. Can you improve it without a full rebuild?",
        a: "Often, yes. We start with a UX audit to find where users are actually failing, then prioritise fixes by impact against effort. Many products gain more from fixing three screens than from a redesign.",
      },
      {
        q: "What do we actually receive at the end of a design project?",
        a: "Clickable prototypes, final screen designs for every state, a component library, and the source files. Everything is handed over in a form your developers, or ours, can build from directly.",
      },
      {
        q: "How do you test designs with real users?",
        a: "We recruit people who match your actual audience, give them real tasks, and watch where they hesitate or take the wrong path. Five to eight participants surfaces the majority of serious usability problems.",
      },
    ],
  },
  {
    slug: "branding-creative",
    title: "Branding & Creative",
    icon: Palette,
    short: "Brand identities people remember and trust.",
    description:
      "A buyer decides whether you look capable before anyone picks up the phone. Our designers build the identity, then write the rules that keep it consistent once your team and suppliers start using it.",
    features: ["Logo & identity", "Brand guidelines", "Graphics & assets", "Pitch decks"],
    image: "/services/branding-creative.jpg",
    imageAlt: "Colour swatches on a desk while a brand identity is being specified",
    detail: {
      lead:
        "A buyer decides whether you look capable before anyone picks up the phone. The designers at Upeo Africa Technologies build brand identities for businesses in Kenya and across Africa: logo, colour, typography, and written guidelines your team and suppliers can follow.",
      body: [
        "Our designers work out what the business should stand for in the eyes of the people you want to sell to, then build the identity that carries it: logo, colour, type, and the rules that hold the whole thing together.",
        "You receive the guidelines and the source files, so the next person who makes a poster or a pitch deck does not quietly undo the work.",
      ],
      outcomes: [
        "A logo and identity that works at any size, in any medium",
        "Written brand guidelines your team and suppliers can follow",
        "Source files you own outright, in every format you need",
        "Templates for the documents you send out every week",
      ],
    },
    process: [
      {
        title: "Brand discovery",
        description:
          "Who you are selling to, what you want them to believe, and what your competitors have already claimed.",
      },
      {
        title: "Concept directions",
        description:
          "Two or three genuinely different territories to react to, not one idea and two weak versions of it.",
      },
      {
        title: "Refinement",
        description:
          "We take the direction you choose and test it where it will really live: signage, favicon, one colour, and a bad photocopy.",
      },
      {
        title: "Guidelines and assets",
        description:
          "Source files in every format, plus written rules so the next person to make a poster does not undo the work.",
      },
      {
        title: "Rollout support",
        description:
          "We apply it across your site, documents, and profiles so the new identity lands everywhere at once.",
      },
    ],
    specialisms: [
      {
        title: "Logo & Visual Identity",
        description:
          "The mark, the colours, and the type that carry your business everywhere. Designed to hold up at signage size and at favicon size, in full colour and in one colour.",
      },
      {
        title: "Brand Guidelines",
        description:
          "The written rules that keep everything consistent once other people start making things. Spacing, usage, tone, and the mistakes to avoid, in a document a printer or intern can follow.",
      },
      {
        title: "Marketing & Sales Collateral",
        description:
          "Profiles, proposals, pitch decks, and social templates that look like they came from the same company. The documents that go out weekly, made to raise your standing rather than lower it.",
      },
      {
        title: "Rebrands & Brand Refresh",
        description:
          "Modernising an identity without throwing away the recognition you have already earned. We work out what your customers actually remember you by, and keep it.",
      },
    ],
    faqs: [
      {
        q: "Do we own the logo and the source files?",
        a: "Yes. You receive the full source files and own the intellectual property outright on final payment. You are never in a position where you have to come back to us to get your own logo in a usable format.",
      },
      {
        q: "How is this different from buying a cheap logo online?",
        a: "A marketplace logo is a drawing with no system behind it. What you get here is positioning, a mark tested across every size and medium you will use, and written rules that keep it consistent once your team, printers, and suppliers start using it.",
      },
      {
        q: "Can you refresh our brand without losing recognition?",
        a: "That is usually the right call for an established business. We identify what your customers actually recognise you by, keep it, and modernise everything around it so you look current without becoming unfamiliar.",
      },
    ],
  },
  {
    slug: "digital-marketing",
    title: "Digital Marketing",
    icon: Megaphone,
    short: "Campaigns that reach the right people and convert.",
    description:
      "Ad spend without a target is just spend. Our marketing experts run the campaigns against a number you agree first, then show you what each shilling returned.",
    features: ["Social media", "Paid ads", "Email & content", "Campaign analytics"],
    image: "/services/digital-marketing.jpg",
    imageAlt: "Marketing experts reviewing campaign charts and reports around a working table",
    detail: {
      lead:
        "Ad spend without a target is just spend. The marketing experts at Upeo Africa Technologies run Google Ads, Meta, email, and content for businesses in Kenya and across Africa, tracked against leads and sales so you can see what each shilling returned.",
      body: [
        "Our marketing experts agree what a lead or a sale is worth before any budget is spent, then build the campaigns against that number. Reach and impressions stay as diagnostics, not as the result we are trying to buy.",
        "Each month you get a report in plain language: what our team spent, what it returned, what we are changing next, and why. There is no dashboard left for you to interpret on your own.",
      ],
      outcomes: [
        "Campaigns measured against sales and leads, not vanity metrics",
        "Tracking set up properly so the numbers can be trusted",
        "A monthly report you can read without a marketing degree",
        "Budget moved to what works and pulled from what does not",
      ],
    },
    process: [
      {
        title: "Goals and tracking",
        description:
          "We agree what a lead or sale is worth before spending anything, then set up conversion tracking so the numbers can be trusted.",
      },
      {
        title: "Audience and channel plan",
        description:
          "Where your buyers actually are and what they respond to, so budget goes to two channels properly rather than five badly.",
      },
      {
        title: "Creative and campaign build",
        description:
          "Copy, graphics, and video made for the platform and your brand, with variants built to be tested against each other.",
      },
      {
        title: "Launch and optimise",
        description:
          "We start deliberately small, find what converts, then move budget toward it and cut what does not.",
      },
      {
        title: "Report and scale",
        description:
          "A plain-language monthly report: spend, results, cost per result, and what we are changing next.",
      },
    ],
    specialisms: [
      {
        title: "Google Ads & Search",
        description:
          "Paid search aimed at people already looking to buy. Tight keyword targeting and negative lists so your budget goes to buyers rather than researchers and job seekers.",
      },
      {
        title: "Social Media Marketing",
        description:
          "Facebook, Instagram, TikTok, and LinkedIn, run as a channel that produces enquiries rather than a posting schedule. Content, community, and paid promotion working together.",
      },
      {
        title: "Meta & Paid Social Ads",
        description:
          "Paid campaigns built on real audience definitions and creative made for the feed. Tested against each other so spend concentrates on the version that actually converts.",
      },
      {
        title: "Email Marketing & Automation",
        description:
          "The channel you own outright, and the cheapest place to earn repeat business. Sequences that follow up automatically instead of relying on somebody remembering.",
      },
    ],
    faqs: [
      {
        q: "What budget do we need to start?",
        a: "It depends on what a customer is worth to you, which is where we start rather than with a package price. We would rather run a smaller budget properly and prove the return than spend big and guess.",
      },
      {
        q: "How do we know the spend is actually working?",
        a: "We set up conversion tracking before spending anything, so leads and sales are attributed to the campaigns that produced them. Your monthly report states spend, results, cost per result, and what we are changing next.",
      },
      {
        q: "Do you handle the content and creative too?",
        a: "Yes. Our marketing experts write the copy, and our designers produce the graphics and video, in your brand and for the platform. Campaigns that wait on a client to send assets tend to stall.",
      },
    ],
  },
  {
    slug: "seo-content",
    title: "SEO & Content",
    icon: Search,
    short: "Get found by the customers already searching.",
    description:
      "The people looking for what you sell are already searching. Our SEO specialists fix the technical problems first, then write for the searches that turn into enquiries.",
    features: ["Technical SEO", "Keyword strategy", "Content writing", "Local SEO"],
    image: "/services/seo-content.jpg",
    imageAlt: "Search engine optimisation performance data on screen",
    detail: {
      lead:
        "A page that Google cannot read will not be found, no matter how good the offer is. The SEO specialists at Upeo Africa Technologies handle technical SEO, on-page work, local search, and content for businesses in Kenya and across Africa, aimed at the searches that turn into enquiries.",
      body: [
        "Our SEO specialists start with the technical foundation, because no amount of writing rescues a site that search engines struggle to crawl. After that, our team targets the search terms buyers use, not the terms that only look large in a report.",
        "The work is white-hat and built to hold. No bought links, no keyword stuffing, and nothing that ranks for a quarter and then costs you a penalty. For a business that serves a specific place, local SEO is usually the part that pays back first.",
      ],
      outcomes: [
        "Technical issues fixed so your pages can rank at all",
        "A keyword plan aimed at buying intent, not raw search volume",
        "Content written for your customers and for search, in that order",
        "Monthly reporting on rankings, traffic, and the enquiries they produced",
      ],
    },
    process: [
      {
        title: "Audit and baseline",
        description:
          "A full technical, content, and backlink audit, plus where you rank today. Without a baseline you cannot tell progress from noise.",
      },
      {
        title: "Keyword and content plan",
        description:
          "The terms your buyers actually search, mapped to pages, prioritised by intent and by how realistic the win is.",
      },
      {
        title: "Technical fixes first",
        description:
          "Crawlability, speed, mobile usability, and structured data, because no amount of content rescues a site Google struggles to read.",
      },
      {
        title: "Content and on-page work",
        description:
          "New pages and rewrites targeting one clear intent each, written for your customers first and search second.",
      },
      {
        title: "Report and refine",
        description:
          "Monthly reporting on rankings, traffic, and the enquiries they produced, then the next month's priorities based on what moved.",
      },
    ],
    specialisms: [
      {
        title: "Technical SEO",
        description:
          "The foundation everything else sits on: crawlability, site speed, mobile usability, structured data, and the indexing problems quietly keeping your pages out of results. Fixed first, because content cannot rescue a site Google struggles to read.",
      },
      {
        title: "On-Page SEO",
        description:
          "Titles, headings, internal links, and page structure tuned so each page targets one clear intent. This goes well beyond adding keywords: it is making every page unmistakably about the thing someone searched for.",
      },
      {
        title: "Local SEO",
        description:
          "For businesses that serve a place. Google Business Profile, local citations, reviews, and location pages built so you appear in the map pack when someone nearby searches with intent to buy today.",
      },
      {
        title: "E-commerce SEO",
        description:
          "Category and product pages built to rank, which is where most online stores lose. Faceted navigation, duplicate content, and product schema handled so shoppers find your products, not just your homepage.",
      },
      {
        title: "Content Strategy & Writing",
        description:
          "Articles and landing pages built around what your customers actually search for, written for people first. Content that answers the question properly earns links and rankings without chasing either.",
      },
      {
        title: "SEO Audits & Reporting",
        description:
          "A clear picture of where you stand, what is holding you back, and what to fix in what order. Then monthly reporting that ties rankings and traffic back to enquiries rather than stopping at a graph.",
      },
    ],
    faqs: [
      {
        q: "How long does SEO take to show results?",
        a: "Technical fixes and local SEO often move within four to eight weeks. Competitive search terms take three to six months of consistent work. Anyone promising page one in a fortnight is either buying links or targeting terms nobody searches.",
      },
      {
        q: "Do you guarantee first-page rankings?",
        a: "No, and you should be wary of anyone who does, because nobody controls Google's results. What we commit to is the work that reliably produces rankings, and monthly reporting honest enough for you to judge whether it is paying back.",
      },
      {
        q: "What is white-hat SEO and why does it matter?",
        a: "It means earning rankings through technical quality and genuinely useful content, rather than bought links and keyword stuffing. Shortcuts can work for a quarter, then cost you a manual penalty that takes far longer to recover from than it did to earn.",
      },
      {
        q: "Is local SEO different from regular SEO?",
        a: "Yes. Local SEO targets the map pack and location-based searches, and depends heavily on your Google Business Profile, consistent listings, and reviews. For a business serving a specific area, it is usually the fastest-paying SEO work available.",
      },
    ],
  },
  {
    slug: "api-payments",
    title: "API & Payment Integration",
    icon: Plug,
    short: "Connect your tools, services, and payment rails.",
    description:
      "A payment that fails or cannot be reconciled becomes a support problem. Our developers wire M-Pesa, Airtel Money, bank, and card payments into the product, and connect the systems around them.",
    features: ["REST & GraphQL", "M-Pesa & Airtel", "Bank & card", "Webhooks"],
    image: "/services/api-payments.jpg",
    imageAlt: "Online checkout open on a laptop beside a payment card and a phone",
    detail: {
      lead:
        "A payment that fails, duplicates, or cannot be reconciled becomes a support problem. The developers at Upeo Africa Technologies integrate M-Pesa, Airtel Money, bank, and card payments, and the APIs between accounting, CRM, and inventory, for businesses in Kenya and across Africa.",
      body: [
        "Our developers have put M-Pesa, Airtel Money, bank transfer, and card payments into live products, and the failures are familiar: callback retries, timeouts, duplicate confirmations, and a reconciliation that has to survive an audit rather than only look right on screen.",
        "The same team connects accounting, CRM, inventory, and messaging, so the same record stops being retyped between three systems by three different people.",
      ],
      outcomes: [
        "M-Pesa and Airtel Money integrated and tested against real edge cases",
        "Card and bank rails for the customers who prefer them",
        "Reconciliation you can hand straight to your accountant",
        "Your existing tools connected instead of manually re-keyed",
      ],
    },
    process: [
      {
        title: "Requirements and rails",
        description:
          "Which payment methods your customers actually use, what your accountant needs to reconcile, and where the money has to land.",
      },
      {
        title: "Sandbox integration",
        description:
          "Built and tested against the provider sandbox first, including the failure paths: timeouts, retries, and duplicate confirmations.",
      },
      {
        title: "Reconciliation design",
        description:
          "Every transaction recorded with its provider reference, so your finance team can match payments without a spreadsheet.",
      },
      {
        title: "Go-live",
        description:
          "Production credentials, callback URLs, and a monitored first week, because real traffic finds edge cases sandboxes never will.",
      },
      {
        title: "Monitoring and support",
        description:
          "Alerting on failed callbacks and settlement mismatches, so a broken payment path is caught before your customers report it.",
      },
    ],
    specialisms: [
      {
        title: "M-Pesa Integration",
        description:
          "STK push, C2B, B2C, and paybill flows wired in properly. We handle the callbacks, timeouts, and duplicate confirmations that turn a demo integration into a support burden once real volume arrives.",
      },
      {
        title: "Airtel Money & Card Payments",
        description:
          "Airtel Money alongside card and bank rails, so customers pay the way they prefer instead of abandoning the checkout. One reconciled record regardless of which rail they chose.",
      },
      {
        title: "API Development",
        description:
          "REST and GraphQL APIs for your own products and partners, documented, versioned, and secured. Built so the team integrating against them next year does not need to call you.",
      },
      {
        title: "Third-Party Integrations",
        description:
          "Accounting, CRM, inventory, SMS, and logistics platforms connected to each other. Data flows once, automatically, instead of being exported and re-keyed by somebody every Friday.",
      },
    ],
    faqs: [
      {
        q: "Can you integrate M-Pesa with our existing system?",
        a: "In most cases yes, whether it is a website, a mobile app, or an internal system. Our developers work with the Daraja API and handle registration, callback URLs, and the go-live process, which is where most in-house attempts stall.",
      },
      {
        q: "How do you handle failed or duplicate payments?",
        a: "With idempotent handling and a reconciliation process, because at real volume both will happen. Every transaction is recorded with its provider reference so a duplicate confirmation cannot double-credit an order and a timeout does not lose a payment.",
      },
      {
        q: "Is the integration secure enough for financial data?",
        a: "Credentials are held in secrets management rather than in code, all traffic is encrypted, callbacks are verified against the provider, and access is logged. We do not store card data ourselves; that stays with the payment processor.",
      },
    ],
  },
  {
    slug: "cloud-devops",
    title: "Cloud & Server Management",
    icon: Cloud,
    short: "24/7 hosting, monitoring, and optimisation.",
    description:
      "When a system goes down, the sale and the trust go with it. Our team hosts, monitors, and patches it, and you hear about a problem from us before you hear it from a customer.",
    features: ["CI/CD pipelines", "Monitoring & alerts", "Security hardening", "Tested backups"],
    image: "/services/cloud-devops.jpg",
    imageAlt: "Server racks in a managed data centre aisle",
    detail: {
      lead:
        "When a system goes down, the sale and the trust go with it. The team at Upeo Africa Technologies hosts and manages servers for businesses in Kenya and across Africa, with monitoring that pages a person, backups that have been restored and checked, and a one-hour response on critical incidents.",
      body: [
        "Our team runs the infrastructure: automated deployments, monitoring that pages a person, backups tested by restoring them, and security patches applied on a schedule rather than after an incident.",
        "The service level agreement sets a one-hour response on critical incidents. We keep you informed while the work is underway, rather than going quiet until it is fixed.",
      ],
      outcomes: [
        "Monitoring that alerts us before your customers notice",
        "Backups that have been restored and verified, not just scheduled",
        "A one-hour response target on critical incidents",
        "Deployments that are repeatable instead of nerve-racking",
      ],
    },
    process: [
      {
        title: "Infrastructure audit",
        description:
          "What you are running, where, at what cost, and what is currently exposed. Usually the first honest picture anyone has had.",
      },
      {
        title: "Migration plan",
        description:
          "Sized to your real traffic and scheduled around your quietest window, with a rollback path agreed before we start.",
      },
      {
        title: "Provision and harden",
        description:
          "Access control, certificates, firewalls, and patching brought current, then automated so they stay that way.",
      },
      {
        title: "Monitoring and backups",
        description:
          "Alerting that pages a human, and backups tested by actually restoring them rather than trusting the schedule.",
      },
      {
        title: "Ongoing management",
        description:
          "Patching, scaling, and a one-hour response target on critical incidents, with updates while we work.",
      },
    ],
    specialisms: [
      {
        title: "Managed Cloud Hosting",
        description:
          "Your applications hosted, patched, and scaled by people who built them. Sized to your actual traffic so you are not paying for idle capacity or falling over at month end.",
      },
      {
        title: "Monitoring & Incident Response",
        description:
          "Uptime, performance, and error monitoring that alerts a human rather than filling a dashboard nobody watches. A one-hour response target on critical incidents, with updates while we work.",
      },
      {
        title: "Backups & Disaster Recovery",
        description:
          "Automated backups that are periodically restored to prove they work. A backup nobody has ever tested is a hope, not a plan, and the wrong day to find out is the day you need it.",
      },
      {
        title: "CI/CD & Security Hardening",
        description:
          "Automated deployment pipelines so releases are repeatable and reversible, plus access control, certificates, and patching kept current instead of revisited after an incident.",
      },
    ],
    faqs: [
      {
        q: "What happens if our site goes down at night?",
        a: "Monitoring alerts our team directly rather than waiting for a customer to report it. The service level agreement sets a one-hour response on critical incidents, and we keep you updated while the work is underway.",
      },
      {
        q: "Can you take over hosting we already have elsewhere?",
        a: "Yes. We audit the current setup, plan the migration around your quietest window, and move it with minimal downtime. In most cases we find backup or security gaps worth fixing during the move.",
      },
      {
        q: "Do you test that the backups actually work?",
        a: "Yes, by restoring them periodically. An untested backup is an assumption, and the morning of an outage is the worst possible time to discover the restore has been failing silently for months.",
      },
    ],
  },
];
