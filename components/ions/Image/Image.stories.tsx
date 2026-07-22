import type { Meta, StoryObj } from "@storybook/nextjs";

import Image from "./index";

const meta: Meta<typeof Image> = {
  title: "Ions/Image",
  component: Image,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    src: {
      control: "text",
      description: "Source URL of the image",
    },
    alt: {
      control: "text",
      description: "Alternative text for the image",
    },
    width: {
      control: "number",
      description: "Width of the image in px. Required when not using fill.",
    },
    height: {
      control: "number",
      description: "Height of the image in px. Required when not using fill.",
    },
    loading: {
      control: "select",
      options: ["lazy", "eager"],
      description: "Loading strategy for the image",
    },
    priority: {
      control: "boolean",
      description: "Preloads the image. Use for above-the-fold images.",
    },
    longDescription: {
      control: "text",
      description:
        "Long description — rendered as visually hidden figcaption and referenced via aria-labelledby",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Image>;

export const Default: Story = {
  args: {
    src: "https://picsum.photos/400/300",
    alt: "Random image",
    width: 400,
    height: 300,
  },
};

export const WithLongDescription: Story = {
  args: {
    src: "https://picsum.photos/400/300",
    alt: "Image with long description",
    width: 400,
    height: 300,
    longDescription:
      "A detailed description of the image content for screen readers",
  },
};

export const EagerLoading: Story = {
  args: {
    src: "https://picsum.photos/400/300",
    alt: "Eager loaded image",
    width: 400,
    height: 300,
    loading: "eager",
  },
};
