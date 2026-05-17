import type { Meta, StoryObj } from "@storybook/nextjs";
import SiteHeader from "./index";
import { defaultSiteHeader, minimalSiteHeader } from "./model";

const meta: Meta<typeof SiteHeader> = {
  title: "CMS/SiteHeader",
  component: SiteHeader,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof SiteHeader>;

export const Default: Story = {
  args: defaultSiteHeader,
};

export const Minimal: Story = {
  args: minimalSiteHeader,
};
