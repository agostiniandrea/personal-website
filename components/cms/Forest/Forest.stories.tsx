import type { Meta, StoryObj } from "@storybook/nextjs";

import Forest from "./index";
import { defaultForest, fullStatForest,minimalForest, oneStatForest, twoStatForest } from "./model";

const meta: Meta<typeof Forest> = {
  title: "CMS/Forest",
  component: Forest,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof Forest>;

export const Default: Story = {
  args: defaultForest,
};

export const SeasonComplete: Story = {
  args: {
    ...defaultForest,
    feedbackCount: 68,
    treesDedicatedCount: 25,
    improvementsCount: 25,
    seasonTarget: 25,
  },
};

export const EarlySeason: Story = {
  args: {
    ...defaultForest,
    treesDedicatedCount: 1,
    seasonTarget: 25,
    feedbackCount: 3,
    improvementsCount: 1,
    changelogItems: [
      { date: "2026-07-07", description: "Forest section launched" },
    ],
  },
};

export const NoChangelog: Story = {
  args: {
    ...defaultForest,
    changelogItems: [],
  },
};

export const Minimal: Story = {
  args: minimalForest,
};

export const OneStat: Story = {
  args: oneStatForest,
};

export const TwoStats: Story = {
  args: twoStatForest,
};

export const FullStats: Story = {
  args: fullStatForest,
};
