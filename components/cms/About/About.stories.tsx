import type { Meta, StoryObj } from "@storybook/nextjs";
import About from "./index";
import { defaultAbout, minimalAbout } from "./model";

const meta: Meta<typeof About> = {
  title: "CMS/About",
  component: About,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof About>;

export const Default: Story = {
  args: defaultAbout,
};

export const NoTags: Story = {
  args: minimalAbout,
};
