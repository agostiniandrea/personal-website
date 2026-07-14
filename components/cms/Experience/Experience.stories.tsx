import type { Meta, StoryObj } from "@storybook/nextjs";

import Experience from "./index";
import { defaultExperience, minimalExperience } from "./model";

const meta: Meta<typeof Experience> = {
  title: "CMS/Experience",
  component: Experience,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof Experience>;

export const Default: Story = {
  args: defaultExperience,
};

export const Minimal: Story = {
  args: minimalExperience,
};
