import type { Meta, StoryObj } from "@storybook/react";
import Link from "./index";

const meta: Meta<typeof Link> = {
  title: "Ions/Link",
  component: Link,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    href: {
      control: "text",
      description: "URL the link points to",
    },
    isExternal: {
      control: "boolean",
      description: "Whether the link opens in a new tab",
    },
    ariaLabel: {
      control: "text",
      description: "Accessibility label for the link",
    },
    styles: {
      control: "object",
      description: "Custom styles to apply to the link",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Link>;

export const Default: Story = {
  args: {
    href: "#",
    children: "Default Link",
  },
};

export const External: Story = {
  args: {
    href: "https://example.com",
    children: "External Link",
    isExternal: true,
  },
};

export const WithCustomStyles: Story = {
  args: {
    href: "#",
    children: "Styled Link",
    styles: {
      color: "red",
      textDecoration: "underline",
    },
  },
};

export const WithAriaLabel: Story = {
  args: {
    href: "#",
    children: "Link with aria-label",
    ariaLabel: "Description of the link",
  },
};
