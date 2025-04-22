import type { Meta, StoryObj } from "@storybook/react";
import Container from "./index";

const meta: Meta<typeof Container> = {
  title: "Ions/Container",
  component: Container,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    verticalPadding: {
      control: "boolean",
      description: "Adds vertical padding to the container",
    },
    styles: {
      control: "object",
      description: "Custom styles to apply to the container",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Container>;

export const Default: Story = {
  args: {
    children: "Default container content",
  },
};

export const WithVerticalPadding: Story = {
  args: {
    children: "Container with vertical padding",
    verticalPadding: true,
  },
};

export const WithCustomStyles: Story = {
  args: {
    children: "Container with custom styles",
    styles: {
      backgroundColor: "#f0f0f0",
      padding: "2rem",
    },
  },
};
