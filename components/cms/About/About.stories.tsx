import type { Meta, StoryObj } from "@storybook/nextjs";
import About from "./index";

const meta: Meta<typeof About> = {
  title: "CMS/About",
  component: About,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof About>;

export const Default: Story = {
  args: {
    sectionLabel: "About",
    heading: "Senior Frontend Developer & Tech Lead",
    bio: "I build high-performance ecommerce experiences with React, Next.js, TypeScript and Shopify. I've spent the last decade working across agencies and in-house teams, from Milan to Amsterdam to Bangkok — always remote-first, always shipping.",
    location: "📍 Bangkok, Thailand",
    availability: "💼 Open to remote roles",
  },
};

export const NoTags: Story = {
  args: {
    ...Default.args,
    location: undefined,
    availability: undefined,
  },
};
