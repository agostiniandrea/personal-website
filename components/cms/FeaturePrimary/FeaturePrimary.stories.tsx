import type { Meta, StoryObj } from "@storybook/nextjs";
import FeaturePrimary from "./index";
import {
  defaultFeature,
  minimalFeature,
  longContentFeature,
  specialCharactersFeature,
} from "./model";

const meta: Meta<typeof FeaturePrimary> = {
  title: "CMS/FeaturePrimary",
  component: FeaturePrimary,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof FeaturePrimary>;

export const Default: Story = {
  args: defaultFeature,
};

export const Minimal: Story = {
  args: minimalFeature,
};

export const LongContent: Story = {
  args: longContentFeature,
};

export const SpecialCharacters: Story = {
  args: specialCharactersFeature,
};

export const MobileView: Story = {
  args: defaultFeature,
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
};
