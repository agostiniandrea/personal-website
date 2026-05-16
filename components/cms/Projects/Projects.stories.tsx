import type { Meta, StoryObj } from "@storybook/nextjs";
import Projects from "./index";
import { defaultProjects, fewItemsProjects, noTagsProject } from "./model";

const meta: Meta<typeof Projects> = {
  title: "CMS/Projects",
  component: Projects,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof Projects>;

export const Default: Story = {
  args: defaultProjects,
};

export const FewItems: Story = {
  args: fewItemsProjects,
};

export const NoTags: Story = {
  args: noTagsProject,
};
