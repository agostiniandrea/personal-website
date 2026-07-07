import type { Meta, StoryObj } from "@storybook/nextjs";
import Forest from "./index";
import { defaultForest, minimalForest } from "./model";

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
    seasonCurrent: 25,
    seasonTarget: 25,
    treeCount: 25,
    reviewCount: 68,
    improvementsCount: 25,
  },
};

export const EarlySeason: Story = {
  args: {
    ...defaultForest,
    seasonCurrent: 1,
    seasonTarget: 25,
    treeCount: 1,
    reviewCount: 3,
    improvementsCount: 1,
  },
};

export const Minimal: Story = {
  args: minimalForest,
};
