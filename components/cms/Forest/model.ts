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
    text: "→  Every meaningful suggestion grows a pair of trees — one for you, one matched by me.",
  },
];

export const defaultForest: ForestProps = {
  originItems: defaultOriginItems,
  badge: "Growing in public",
  sectionLabel: "🌳 Forest",
  heading: "This portfolio grows with your feedback.",
  subheading:
    "Forest didn't start with this website. It started months earlier — a personal commitment to give something back. This page simply invites others to become part of that journey.",
  feedbackCount: 0,
  treesDedicatedCount: 0,
  improvementsCount: 0,
  treeCount: 34,
  treeCountTitle: "My Forest",
  ctaHeading: "Help this portfolio grow.",
  ctaBody:
    "Every meaningful suggestion plants two real trees — one dedicated to you, one matched by me. Together, we're growing this forest.",
  ctaButtonLabel: "🌱 Plant a leaf",
  seasonName: "Season One",
  seasonCurrentLabel: "Trees planted through portfolio feedback",
  treeCountLabel: "Trees planted since May 2026",
  viewForestLabel: "View the living forest",
  feedbackCountLabel: "feedback received",
  treesDedicatedCountLabel: "trees dedicated",
  improvementsCountLabel: "improvements shipped",
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
  feedbackCount: 1,
  treesDedicatedCount: 0,
  improvementsCount: 0,
};

export const twoStatForest: ForestProps = {
  ...defaultForest,
  feedbackCount: 5,
  treesDedicatedCount: 2,
  improvementsCount: 0,
};

export const fullStatForest: ForestProps = {
  ...defaultForest,
  feedbackCount: 68,
  treesDedicatedCount: 25,
  improvementsCount: 25,
};
