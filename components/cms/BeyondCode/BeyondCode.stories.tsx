import type { Meta, StoryObj } from "@storybook/nextjs";
import BeyondCode from "./index";
import { defaultBeyondCode, noIntrosBeyondCode, noTagsBeyondCode } from "./model";

const meta: Meta<typeof BeyondCode> = {
  title: "CMS/BeyondCode",
  component: BeyondCode,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof BeyondCode>;

export const Default: Story = {
  args: defaultBeyondCode,
};

export const NoIntro: Story = {
  args: noIntrosBeyondCode,
};

export const NoTags: Story = {
  args: noTagsBeyondCode,
};
