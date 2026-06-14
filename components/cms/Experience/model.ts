import { ExperienceProps } from "./index";

export const defaultExperience: ExperienceProps = {
  sectionLabel: "Experience",
  heading: "Where I've worked",
  items: [
    {
      role: "Senior Frontend Developer",
      company: "JIBE eCommerce",
      location: "Remote · Vancouver, CA",
      period: "May 2022 — Present",
      description:
        "Building and maintaining headless Shopify storefronts on Next.js/TypeScript for brands including 7mesh, Nest Designs and Saul Good. Core contributor and maintainer of Compass, the agency's internal design system powering all client storefronts. Tech lead on selected projects and epics — technical direction, code reviews, and mentoring.",
      tags: ["Next.js", "TypeScript", "Shopify", "Storybook", "styled-components"],
    },
    {
      role: "Senior Frontend Developer → Architect",
      company: "Overstappen.nl",
      location: "Hybrid · Amsterdam, NL",
      period: "Mar 2020 — Apr 2022",
      description:
        "Frontend developer on the Netherlands' main price comparison platform — built the energy comparison product, led the health insurance tool, and architected Kizi.nl, a new consumer brand, alongside the CTO. Promoted to define tech stacks, coding standards, and CI/CD pipelines across the development team.",
      tags: ["Next.js", "TypeScript", "Redux", "Storybook", "Jest", "Azure DevOps"],
    },
    {
      role: "Frontend Developer",
      company: "TWC / The Widget Company",
      location: "On-site · Amsterdam, NL",
      period: "Jan 2019 — Feb 2020",
      description:
        "Built Smart TV streaming applications for media companies — most notably Videoland, RTL Nederland's VOD service — deployed across Samsung, LG, Philips, Sony, Panasonic and PlayStation platforms.",
      tags: ["Vue.js", "TypeScript", "Vuex", "Jest", "Webpack"],
    },
    {
      role: "Frontend Developer",
      company: "Consoft Sistemi (now ALTEN Italia)",
      location: "On-site · Turin, IT",
      period: "Mar 2015 — Dec 2018",
      description:
        "Built and maintained FCA Group's Build & Price vehicle configurators for NAFTA and EMEA brand sites — Jeep, Ram, Dodge, Fiat, Alfa Romeo — and led frontend development of the Mopar accessories configurator. Nearly three years of ownership on high-traffic consumer tools.",
      tags: ["React", "Redux", "JavaScript", "Webpack", "Node.js"],
    },
  ],
};

export const minimalExperience: ExperienceProps = {
  sectionLabel: "Experience",
  heading: "Where I've worked",
  items: [
    {
      role: "Senior Frontend Developer",
      company: "JIBE eCommerce",
      period: "May 2022 — Present",
      description: "Leading frontend development for headless Shopify storefronts.",
    },
  ],
};
