import type { Meta, StoryObj } from "@storybook/nextjs";

import Text from "./index";

const meta: Meta<typeof Text> = {
  title: "Ions/Text",
  component: Text,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["small", "regular", "large"],
      description: "Size variant of the text",
    },
    as: {
      control: "select",
      options: ["p", "span", "div"],
      description: "HTML element to render as",
    },
    "aria-label": {
      control: "text",
      description: "Accessibility label for the text",
    },
    "aria-describedby": {
      control: "text",
      description: "ID of element that describes the text",
    },
    style: {
      control: "object",
      description: "Custom styles to apply to the text",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Text>;

export const Default: Story = {
  args: {
    children: "Default text",
  },
};

export const Small: Story = {
  args: {
    variant: "small",
    children: "Small text",
  },
};

export const Large: Story = {
  args: {
    variant: "large",
    children: "Large text",
  },
};

export const AsSpan: Story = {
  args: {
    as: "span",
    children: "Text rendered as span",
  },
};

export const WithAriaLabel: Story = {
  args: {
    children: "Text with aria-label",
    "aria-label": "Description of the text",
  },
};

export const WithCustomStyles: Story = {
  args: {
    children: "Text with custom styles",
    style: {
      color: "red",
      fontWeight: "bold",
    },
  },
};
