import { ForestProps } from "./index";

export const defaultForest: ForestProps = {
  sectionLabel: "🌳 Forest",
  heading: "This portfolio grows with your feedback.",
  subheading:
    "Every meaningful suggestion helps shape the next version. As a thank you, I dedicate a real tree.",
  reviewCount: 47,
  treeCount: 47,
  improvementsCount: 12,
  ctaHeading: "Help this portfolio grow.",
  ctaBody: "If you spot something, leave a leaf.",
  ctaButtonLabel: "🌱 Plant a leaf",
  seasonName: "Season One",
  seasonCurrent: 5,
  seasonTarget: 25,
  changelogItems: [
    { date: "2026-07-07", description: "Forest section launched" },
    { date: "2026-07-07", description: "Storybook dark/light theme toggle" },
    { date: "2026-07-05", description: "Hero image load time optimized" },
    { date: "2026-07-04", description: "Footer divider visibility fixed" },
    { date: "2026-06-30", description: "Scroll hint arrow repositioned" },
  ],
};

export const minimalForest: ForestProps = {};
