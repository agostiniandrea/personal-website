import { ForestProps, OriginItem } from "./index";

export const defaultOriginItems: OriginItem[] = [
  {
    date: "May 2026",
    text: "🌱  Started planting trees every month — a personal commitment, before any portfolio.",
  },
  {
    date: "July 2026",
    text: "🌳  Forest was born. The portfolio invites others to become part of that journey.",
  },
  {
    date: "Today",
    text: "→  Every meaningful contribution can shape the portfolio — community feedback grows a pair of real trees.",
  },
];

export const defaultForest: ForestProps = {
  originItems: defaultOriginItems,
  badge: "Growing in public",
  sectionLabel: "🌳 Forest",
  heading: "This portfolio grows through feedback, research and iteration.",
  subheading:
    "Forest didn't start with this website — it began months earlier, as a personal commitment to give something back. Today it grows in three ways: community feedback, focused research, and my own iteration on the portfolio.",
  insightsCollectedCount: 10,
  treesDedicatedCount: 4,
  improvementsShippedCount: 8,
  communityContributionsCount: 2,
  treeCount: 34,
  treeCountTitle: "My Forest",
  ctaHeading: "Help this portfolio grow.",
  ctaBody:
    "Every meaningful contribution can shape the portfolio. Community feedback grows a pair of real trees — one dedicated to you, one matched by me.",
  ctaButtonLabel: "🌱 Plant a leaf",
  treeCountLabel: "Trees planted since May 2026",
  viewForestLabel: "View the living forest",
  seasonTarget: 50,
  seasonProjectLabel: "Season One project",
  seasonProjectName: "Community Reforestation in Indonesia",
  seasonProjectMeta: "Indonesia · Tropical community reforestation",
  seasonProjectStats: "4 trees · 1.5 t CO₂ · 2 species",
  seasonProjectTreesCount: 4,
  seasonProjectCo2Kg: 1500,
  seasonProjectSpecies: ["Sengon", "Kadamba"],
  seasonProjectUrl:
    "https://tree-nation.com/projects/community-reforestation-in-indonesia",
  seasonProjectLinkLabel: "View project",
  changelogItems: [],
};

export const minimalForest: ForestProps = {};

export const oneStatForest: ForestProps = {
  ...defaultForest,
  insightsCollectedCount: 1,
  treesDedicatedCount: 0,
  improvementsShippedCount: 0,
  communityContributionsCount: 0,
};

export const twoStatForest: ForestProps = {
  ...defaultForest,
  insightsCollectedCount: 5,
  treesDedicatedCount: 2,
  improvementsShippedCount: 0,
  communityContributionsCount: 1,
};

export const fullStatForest: ForestProps = {
  ...defaultForest,
  insightsCollectedCount: 68,
  treesDedicatedCount: 25,
  improvementsShippedCount: 25,
  communityContributionsCount: 12,
};
