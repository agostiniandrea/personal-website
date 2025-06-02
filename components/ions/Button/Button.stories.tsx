import type { Meta, StoryObj } from "@storybook/nextjs";
import Button from "./index";

const meta: Meta<typeof Button> = {
  title: "Ions/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    disabled: {
      control: "boolean",
      description: "Whether the button is disabled",
    },
    type: {
      control: "select",
      options: ["button", "submit", "reset"],
      description: "Type of the button",
    },
    "aria-label": {
      control: "text",
      description: "Accessibility label for the button",
    },
    "aria-describedby": {
      control: "text",
      description: "ID of the element that describes the button",
    },
    "aria-expanded": {
      control: "boolean",
      description: "Whether the button controls an expanded element",
    },
    "aria-pressed": {
      control: "boolean",
      description: "Whether the button is pressed",
    },
    "aria-controls": {
      control: "text",
      description: "ID of the element controlled by the button",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    children: "Default Button",
  },
};

export const Disabled: Story = {
  args: {
    children: "Disabled Button",
    disabled: true,
  },
};

export const Submit: Story = {
  args: {
    children: "Submit Button",
    type: "submit",
  },
};

export const WithAriaLabel: Story = {
  args: {
    children: "Button with aria-label",
    "aria-label": "Description of the button",
  },
};

export const WithDescription: Story = {
  args: {
    children: "Button with description",
    description: "This is a detailed description of the button",
  },
};

export const WithAriaControls: Story = {
  args: {
    children: "Button with aria-controls",
    "aria-controls": "controlled-element",
    "aria-expanded": false,
  },
};
