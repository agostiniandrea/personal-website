import type { Meta, StoryObj } from "@storybook/nextjs";
import SiteFooter from "./index";
import { defaultSiteFooter, minimalSiteFooter } from "./model";

const meta: Meta<typeof SiteFooter> = {
  title: "CMS/SiteFooter",
  component: SiteFooter,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof SiteFooter>;

export const Default: Story = {
  args: defaultSiteFooter,
};

export const Minimal: Story = {
  args: minimalSiteFooter,
};
