import type { Meta, StoryObj } from "@storybook/nextjs";
import HeadingBox from "./index";
import {
  defaultHeadingBox,
  aboutHeadingBox,
  minimalHeadingBox,
  withLongContent,
  withSpecialCharacters,
} from "./model";

const meta: Meta<typeof HeadingBox> = {
  title: "Molecules/HeadingBox",
  component: HeadingBox,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof HeadingBox>;

export const Default: Story = {
  args: defaultHeadingBox,
};

export const WithoutCta: Story = {
  args: aboutHeadingBox,
};

export const MinimalContent: Story = {
  args: minimalHeadingBox,
};

export const LongContent: Story = {
  args: withLongContent,
};

export const SpecialCharacters: Story = {
  args: withSpecialCharacters,
};

export const MobileView: Story = {
  args: defaultHeadingBox,
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
};
