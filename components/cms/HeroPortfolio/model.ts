import { HeroPortfolioProps } from "./index";

export const defaultHeroPortfolio: HeroPortfolioProps = {
  greeting: "Hi, I'm",
  personName: "Andrea Agostini",
  role: "Senior Frontend Developer & Tech Lead",
  tagline:
    "Building headless ecommerce and design systems with Next.js, React, TypeScript and Shopify. Based in Bangkok, fully remote.",
  image: {
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=800&fit=crop",
    alt: "Andrea Agostini",
    width: 800,
    height: 800,
    type: "image/jpeg",
  },
  ctaPrimaryLabel: "View Projects",
  ctaPrimaryUrl: "#projects",
  ctaSecondaryLabel: "Get in touch",
  ctaSecondaryUrl: "mailto:a.agostini92@gmail.com",
  cvDownloadLabel: "Download CV",
  cvDownloadFile: "https://assets.ctfassets.net/placeholder/cv.pdf",
};

export const noCta: HeroPortfolioProps = {
  ...defaultHeroPortfolio,
  ctaSecondaryLabel: undefined,
  ctaSecondaryUrl: undefined,
};
