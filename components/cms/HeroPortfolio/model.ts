import { HeroPortfolioProps } from "./index";

export const defaultHeroPortfolio: HeroPortfolioProps = {
  greeting: "Based in Bangkok, working worldwide",
  personName: "Andrea Agostini",
  role: "Senior Frontend Developer & Tech Lead",
  tagline:
    "I build ecommerce experiences and design systems that are fast, accessible and made to last. Working remotely with teams across Europe and North America, from Bangkok.",
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
