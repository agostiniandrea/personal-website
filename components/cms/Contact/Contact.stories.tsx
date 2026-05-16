import type { Meta, StoryObj } from "@storybook/nextjs";
import Contact from "./index";
import { defaultContact, minimalContact } from "./model";

const meta: Meta<typeof Contact> = {
  title: "CMS/Contact",
  component: Contact,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof Contact>;

export const Default: Story = {
  args: defaultContact,
};

export const Minimal: Story = {
  args: minimalContact,
};
