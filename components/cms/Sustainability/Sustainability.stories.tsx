import type { Meta, StoryObj } from "@storybook/nextjs";
import Sustainability from "./index";
import { defaultSustainability, minimalSustainability, noCarbonBadgeSustainability } from "./model";

const meta: Meta<typeof Sustainability> = {
  title: "CMS/Sustainability",
  component: Sustainability,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof Sustainability>;

export const Default: Story = {
  args: defaultSustainability,
};

export const NoCarbonBadge: Story = {
  args: noCarbonBadgeSustainability,
};

export const Minimal: Story = {
  args: minimalSustainability,
};
