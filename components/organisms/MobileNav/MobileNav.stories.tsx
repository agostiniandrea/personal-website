import type { Meta, StoryObj } from "@storybook/react";

import MobileNav from "./index";

const meta: Meta<typeof MobileNav> = {
  title: "Organisms/MobileNav",
  component: MobileNav,
  parameters: {
    layout: "fullscreen",
    viewport: { defaultViewport: "mobile1" },
  },
};

export default meta;
type Story = StoryObj<typeof MobileNav>;

export const Default: Story = {
  args: {
    cvDownloadUrl: "https://example.com/cv.pdf",
  },
};

export const WithoutCv: Story = {
  args: {},
};
