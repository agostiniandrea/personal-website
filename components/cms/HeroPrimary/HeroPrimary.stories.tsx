import type { Meta, StoryObj } from "@storybook/nextjs";
import HeroPrimary from "./index";
import { defaultHeroPrimary, longContent, withCustomSizes } from "./model";

const meta: Meta<typeof HeroPrimary> = {
  title: "CMS/HeroPrimary",
  component: HeroPrimary,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof HeroPrimary>;

export const Default: Story = {
  args: defaultHeroPrimary,
};

export const LongContent: Story = {
  args: longContent,
};

export const WithCustomSizes: Story = {
  args: withCustomSizes,
};

export const MobileView: Story = {
  args: defaultHeroPrimary,
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
};
