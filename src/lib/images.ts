/**
 * Curated, free-to-use stock imagery (Pexels). Each entry was reviewed visually
 * for fit. Widths are requested from the Pexels CDN; next/image re-optimises.
 */
const px = (id: number, w = 1400) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

export const images = {
  // Hero pillars
  software: px(3862599), // developer coding on a laptop
  digital: px(7653461), // modern office team building products
  marketing: px(789822), // bright, smiling professional, growth
  payments: px(4910129), // hand holding a phone, mobile payments

  // Feature / capability rows
  strategy: px(7693692), // diverse team collaborating over plans
  presentation: px(8761327), // training / consulting session
  codeOffice: px(6804612), // developer workspace with code screens

  // People
  support: px(8204317), // customer-service agent with headset
  team: px(7653461),
  brandPortrait: px(9222199, 700), // creative in an orange jacket (on-brand)
};

export type ImageKey = keyof typeof images;

/**
 * Page-level imagery, served from `public/` rather than the Pexels CDN. These
 * sit behind headline copy or fill large panels, so they were each downloaded,
 * reviewed at full size, and kept local so a CDN change can never blank a hero.
 * Sources (Pexels IDs): 19805878, 30688593, 7658323, 9489091.
 */
export const pageImages = {
  servicesHeader: "/pages/services-header.jpg",
  aboutHeader: "/pages/about-header.jpg",
  contactHeader: "/pages/contact-header.jpg",
  aboutTeam: "/pages/about-team.jpg",
} as const;
