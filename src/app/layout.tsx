import type { Metadata, Viewport } from "next";
import { DM_Sans, Sora } from "next/font/google";
import "./globals.css";
import { company } from "@/lib/content";

/** Display face for headings and UI. Body copy uses DM Sans. Wired in globals.css. */
const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm",
  display: "swap",
});

const siteUrl = "https://upeoafricatechnologies.co.ke";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${company.name} · Software, Design & Marketing Agency in Mombasa`,
    template: `%s · ${company.name}`,
  },
  description:
    "Upeo Africa Technologies designs and builds custom web and mobile apps, M-Pesa and Airtel Money payments, branding, and digital marketing from Mombasa, Kenya, for businesses across Africa.",
  keywords: [
    "software company Mombasa",
    "app development Kenya",
    "custom software Kenya",
    "web development Mombasa",
    "mobile app development Kenya",
    "UI UX design Kenya",
    "M-Pesa integration Kenya",
    "Airtel Money integration",
    "payment integration Kenya",
    "WordPress plugin developer Kenya",
    "POS system Kenya",
    "Upeo Africa Technologies",
  ],
  authors: [{ name: company.name }],
  creator: company.name,
  verification: {
    google: "WvISEi4b4smIm2spDJfIUWGCecyCqRq-WS5bdXAyj_M",
  },
  openGraph: {
    type: "website",
    locale: "en_KE",
    url: siteUrl,
    siteName: company.name,
    title: `${company.name} · Software, Design & Marketing`,
    description:
      "Upeo Africa Technologies designs and builds custom web and mobile apps, M-Pesa and Airtel Money payments, branding, and digital marketing from Mombasa, Kenya, for businesses across Africa.",
  },
  twitter: {
    card: "summary_large_image",
    title: `${company.name} · Software, Design & Marketing`,
    description:
      "Upeo Africa Technologies designs and builds custom web and mobile apps, M-Pesa and Airtel Money payments, branding, and digital marketing from Mombasa, Kenya, for businesses across Africa.",
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [{ url: "/icon.png", type: "image/png" }],
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0e14",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sora.variable} ${dmSans.variable}`}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
