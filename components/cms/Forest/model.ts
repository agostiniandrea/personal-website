import { ForestProps, OriginItem } from "./index";

export const defaultOriginItems: OriginItem[] = [
  { date: "May 2026",  text: "🌱  Started planting trees every month — a personal commitment, before any portfolio." },
  { date: "July 2026", text: "🌳  Forest was born. The portfolio invites others to become part of that journey." },
  { date: "Today",     text: "→  Every meaningful suggestion earns a dedicated tree from my forest." },
];

export const defaultForest: ForestProps = {
  originItems: defaultOriginItems,
  badge: "Growing in public",
  sectionLabel: "🌳 Forest",
  heading: "This portfolio grows with your feedback.",
  subheading:
    "Forest didn't start with this website. It started months earlier — a personal commitment to give something back. This page simply invites others to become part of that journey.",
  reviewCount: 0,
  treeCount: 30,
  improvementsCount: 0,
  ctaHeading: "Help this portfolio grow.",
  ctaBody: "Every meaningful suggestion earns a new tree. My goal: 25 trees planted through feedback this season.",
  ctaButtonLabel: "🌱 Plant a leaf",
  seasonName: "Season One",
  seasonCurrentLabel: "Current season",
  treeCountLabel: "planted since May 2026",
  viewForestLabel: "View the living forest",
  seasonCurrent: 0,
  seasonTarget: 25,
  changelogItems: [],
};

export const minimalForest: ForestProps = {};
