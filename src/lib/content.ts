import type { LucideIcon } from "lucide-react";
import {
  Code2,
  PenTool,
  Cloud,
  Megaphone,
  CreditCard,
  ShieldCheck,
  Handshake,
  LifeBuoy,
  Award,
  KeyRound,
  Search as SearchIcon,
  DraftingCompass,
  Rocket,
  RefreshCw,
  HeartPulse,
  Landmark,
  ShoppingBag,
  GraduationCap,
  Tractor,
  Truck,
  Plane,
  Banknote,
  AppWindow,
  Puzzle,
  Store,
} from "lucide-react";
import { images } from "./images";

export const company = {
  name: "Upeo Africa Technologies",
  legalName: "Upeo Africa Technologies Ltd",
  shortName: "Upeo Africa",
  tagline: "Software, design and marketing, built for African businesses",
  location: "Mombasa, Kenya",
  email: "hello@upeoafricatechnologies.co.ke",
  phone: "+254 716 972 103",
  addressLine: "Yunis Building, Moi Avenue, Mombasa",
  poBox: "P.O. Box 88225-80100, Mombasa",
  street: "Moi Avenue",
  building: "Yunis Building",
  city: "Mombasa",
  postalCode: "80100",
  founded: 2019,
  googleRating: "5.0",
  // Replace with your exact Google Business "share" link (g.page/r/…) for the direct review flow.
  googleReviewUrl:
    "https://www.google.com/maps/search/?api=1&query=Upeo+Africa+Technologies+Ltd+Mombasa",
  domain: "https://upeoafricatechnologies.co.ke",
  social: {
    facebook: "https://www.facebook.com/upeoafrica",
    x: "https://x.com/upeoafrica",
    linkedin: "https://www.linkedin.com/company/upeoafrica",
    instagram: "https://www.instagram.com/upeoafrica",
  },
};

export const nav = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Our Work", href: "/work" },
  { label: "Our Process", href: "/process" },
  { label: "Blogs", href: "/blogs" },
  { label: "Contact Us", href: "/contact" },
];

export const legalNav = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Service Level Agreement", href: "/sla" },
];

// Mega-menu groupings (slugs reference `services` below).
export const megaServices = [
  { group: "Build", slugs: ["web-applications", "mobile-apps", "api-payments", "cloud-devops"] },
  { group: "Design", slugs: ["websites-portals", "product-design", "branding-creative"] },
  { group: "Grow", slugs: ["digital-marketing", "seo-content"] },
];

/* ── Hero rotating showcase ─────────────────────────────────────────────── */
export type HeroSlide = {
  label: string;
  caption: string;
  image: string;
  icon: LucideIcon;
  accent: string;
};

export const heroSlides: HeroSlide[] = [
  {
    label: "Custom Software",
    caption: "Web, mobile and enterprise apps that run your operations.",
    image: images.software,
    icon: Code2,
    accent: "text-brand-400",
  },
  {
    label: "Web & Product Design",
    caption: "High-converting websites and interfaces people love.",
    image: images.digital,
    icon: PenTool,
    accent: "text-sky-400",
  },
  {
    label: "Digital Marketing",
    caption: "SEO, social and campaigns that grow your brand.",
    image: images.marketing,
    icon: Megaphone,
    accent: "text-pink-400",
  },
  {
    label: "Payments & Integrations",
    caption: "M-Pesa, Airtel Money, bank and card, built right in.",
    image: images.payments,
    icon: CreditCard,
    accent: "text-green-400",
  },
];

/* ── Services ───────────────────────────────────────────────────────────── */
/* Services live in their own module: it is the largest body of copy on the
   site and it drives nine generated routes. Re-exported so every existing
   `@/lib/content` import keeps working. */
export type { Service, Specialism, ServiceFaq } from "./services";
export { services } from "./services";

/* ── Capabilities (alternating image + CTA rows) ────────────────────────── */
export type Capability = {
  eyebrow: string;
  title: string;
  description: string;
  bullets: string[];
  image: string;
  imageAlt: string;
  cta: { label: string; href: string };
};

export const capabilities: Capability[] = [
  {
    eyebrow: "Design",
    title: "Brand identity and product UI that earn trust",
    description:
      "Our designers shape logos, visual identity, websites, and app interfaces that look credible and convert, from first wireframe to a reusable design system your team can build on.",
    bullets: ["Brand identity & creative", "UI/UX & product design", "Design systems"],
    image: "/capabilities/design.jpg",
    imageAlt: "Upeo Africa Technologies designers working on brand and product UI",
    cta: { label: "See design work", href: "/work" },
  },
  {
    eyebrow: "Build",
    title: "Custom web and mobile apps, engineered to last",
    description:
      "Our software engineers develop custom web platforms, Android and iOS apps, and the APIs behind them, with M-Pesa and Airtel Money payments, secure cloud hosting, and DevOps built to scale as your business grows.",
    bullets: ["Web & mobile apps", "M-Pesa & Airtel Money APIs", "Cloud & DevOps"],
    image: "/capabilities/build.jpg",
    imageAlt: "Upeo Africa Technologies engineer building a web and mobile application",
    cta: { label: "Explore development", href: "/services" },
  },
  {
    eyebrow: "Scale",
    title: "SEO and marketing that bring customers in",
    description:
      "Our marketers get you found and chosen with technical SEO, content, social, and paid campaigns, all tracked against real leads and sales so every shilling of marketing spend is accountable.",
    bullets: ["SEO & content", "Social & paid ads", "Analytics & reporting"],
    image: "/capabilities/scale.jpg",
    imageAlt: "Upeo Africa Technologies marketing team driving SEO and growth",
    cta: { label: "Grow with us", href: "/contact" },
  },
];

export type Differentiator = { title: string; description: string; icon: LucideIcon };

export const differentiators: Differentiator[] = [
  {
    title: "End-to-End Synergy",
    description:
      "Stop playing referee between a design team, an offshore dev shop, and a marketing agency. We bring engineering, UI/UX, and growth strategy into one room under one contract. Every product we ship is designed to scale and built to sell, with absolute accountability from day one.",
    icon: Handshake,
  },
  {
    title: "African Payment Mastery",
    description:
      "Navigating pan-African checkout rails isn't something an offshore team should learn on your dime. From M-Pesa and Airtel Money to regional card switches and bank transfers, we engineer seamless, battle-tested payment experiences that keep your conversion rates high and failure rates low.",
    icon: CreditCard,
  },
  {
    title: "700+ Ships & Proven Retention",
    description:
      "We don't measure success in launched code; we measure it in long-term momentum. With over 791 projects delivered since 2019, 90% of our business comes from clients who return or send us their network. The people who know our work best are the ones who keep trusting us.",
    icon: Award,
  },
  {
    title: "Architectural & Data Security",
    description:
      "Security isn't a patch you buy after a breach--it's built into the foundation. We bake enterprise-grade encryption, strict access control, automated backups, and real-time monitoring directly into your system's architecture before a single line of client data touches it.",
    icon: ShieldCheck,
  },
  {
    title: "100% IP & Code Ownership",
    description:
      "Your platform is your asset, period. Once the project is delivered, full intellectual property rights, repositories, and cloud access belong entirely to you in writing. We keep our client partnerships thriving through exceptional execution, never by holding codebase keys hostage.",
    icon: KeyRound,
  },
  {
    title: "SLA-Backed Reliability",
    description:
      "Launch day is just the beginning. Our Service Level Agreements commit us to target response times under one hour for critical operational issues. We keep your systems monitored, updated, and performing reliably long after your go-live party ends.",
    icon: LifeBuoy,
  },
];

export type Step = { n: string; title: string; description: string; icon: LucideIcon };

export const process: Step[] = [
  {
    n: "01",
    title: "Discover",
    description: "We dig into your goals, users, and constraints to define what success looks like.",
    icon: SearchIcon,
  },
  {
    n: "02",
    title: "Design",
    description: "We map the architecture and craft the experience, validated with prototypes first.",
    icon: DraftingCompass,
  },
  {
    n: "03",
    title: "Build",
    description: "We engineer in tested, reviewable increments with regular demos, never a black box.",
    icon: Code2,
  },
  {
    n: "04",
    title: "Launch",
    description: "We ship to production with confidence, monitoring, and a clear rollout plan.",
    icon: Rocket,
  },
  {
    n: "05",
    title: "Grow",
    description: "We market, measure, and improve, turning your product into a compounding advantage.",
    icon: RefreshCw,
  },
];

export const stats = [
  { value: 791, suffix: "", label: "Projects delivered" },
  { value: 98, suffix: "%", label: "Client satisfaction" },
  { value: 6, suffix: "+", label: "Years of expertise" },
  { value: 90, suffix: "%", label: "Repeat & referral clients" },
];

/* Tech stack, keyed to Simple Icons slugs for real brand marks. */
export const techStack: { name: string; slug: string }[] = [
  { name: "React", slug: "react" },
  { name: "Next.js", slug: "nextdotjs" },
  { name: "TypeScript", slug: "typescript" },
  { name: "Node.js", slug: "nodedotjs" },
  { name: "React Native", slug: "react" },
  { name: "Flutter", slug: "flutter" },
  { name: "Python", slug: "python" },
  { name: "PostgreSQL", slug: "postgresql" },
  { name: "MongoDB", slug: "mongodb" },
  { name: "Tailwind CSS", slug: "tailwindcss" },
  { name: "WordPress", slug: "wordpress" },
  { name: "Magento", slug: "magento" },
  { name: "Docker", slug: "docker" },
  { name: "Figma", slug: "figma" },
];

export type Product = { title: string; icon: LucideIcon; description: string; tags: string[] };

export const products: Product[] = [
  {
    title: "Apps & SaaS products",
    icon: AppWindow,
    description:
      "Web and mobile products we've designed, launched, and continue to run. Reliable, scalable, and a pleasure to use.",
    tags: ["Web apps", "Mobile apps", "Dashboards"],
  },
  {
    title: "WordPress plugins",
    icon: Puzzle,
    description:
      "Custom plugins that extend WordPress with exactly the features your site needs, with no bloat and no compromises.",
    tags: ["Custom features", "Integrations", "Maintenance"],
  },
  {
    title: "POS systems & plugins",
    icon: Store,
    description:
      "Point-of-sale software and plugins that keep retail and hospitality businesses running smoothly, on and offline.",
    tags: ["Retail", "Hospitality", "Inventory"],
  },
];

export const payments = ["M-Pesa", "Airtel Money", "Bank transfers", "Card payments"];

export type Industry = { title: string; icon: LucideIcon };

export const industries: Industry[] = [
  { title: "Healthcare", icon: HeartPulse },
  { title: "Financial Services", icon: Banknote },
  { title: "Government", icon: Landmark },
  { title: "Retail & E-commerce", icon: ShoppingBag },
  { title: "Education", icon: GraduationCap },
  { title: "Tours & Travel", icon: Plane },
  { title: "Agriculture", icon: Tractor },
  { title: "Logistics & Transport", icon: Truck },
  { title: "NGOs & Nonprofits", icon: Handshake },
];

export const faqs = [
  {
    q: "Where is Upeo Africa Technologies based?",
    a: "We're a software and digital agency headquartered on Moi Avenue, Mombasa, Kenya, working with clients across the country and the wider African continent, both on-site and remotely.",
  },
  {
    q: "Do you only build software, or marketing too?",
    a: "Both. We're a full-service team spanning software engineering, design and branding, and digital marketing, so you can build, launch, and grow with one accountable partner.",
  },
  {
    q: "How do engagements usually start?",
    a: "With a short discovery conversation. We learn your goals, recommend an approach, and give you a clear plan, timeline, and quote before any commitment.",
  },
  {
    q: "Do you support products after launch?",
    a: "Yes. Ongoing maintenance, monitoring, marketing, and iterative improvement are core to how we work, and most of our clients stay with us long after go-live.",
  },
];
