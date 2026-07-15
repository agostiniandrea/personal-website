import type { Meta, StoryObj } from "@storybook/nextjs";

import Skills from "./index";
import { defaultSkills, minimalSkills } from "./model";

const meta: Meta<typeof Skills> = {
  title: "CMS/Skills",
  component: Skills,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof Skills>;

export const Default: Story = {
  args: defaultSkills,
};

export const Minimal: Story = {
  args: minimalSkills,
};
