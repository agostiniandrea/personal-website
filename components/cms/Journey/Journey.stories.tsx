import type { Meta, StoryObj } from "@storybook/nextjs";
import Journey from "./index";
import { journeyData } from "./model";

const meta: Meta<typeof Journey> = {
  title: "CMS/Journey",
  component: Journey,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof Journey>;

export const Default: Story = {
  args: journeyData,
};

export const SingleChapter: Story = {
  args: {
    ...journeyData,
    chapters: journeyData.chapters?.slice(0, 1),
  },
};

export const OngoingOnly: Story = {
  args: {
    ...journeyData,
    chapters: journeyData.chapters?.filter((c) => c.isOngoing),
  },
};
