import type { Meta, StoryObj } from "@storybook/react";
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
      description: "Width of the image",
    },
    height: {
      control: "number",
      description: "Height of the image",
    },
    loading: {
      control: "select",
      options: ["lazy", "eager"],
      description: "Loading strategy for the image",
    },
    "aria-hidden": {
      control: "boolean",
      description: "Whether the image is hidden from screen readers",
    },
    "aria-labelledby": {
      control: "text",
      description: "ID of the element that labels the image",
    },
    longDescription: {
      control: "text",
      description: "Long description of the image",
    },
    fallbackSrc: {
      control: "text",
      description: "Fallback image source in case of error",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Image>;

export const Default: Story = {
  args: {
    src: "https://picsum.photos/200/300",
    alt: "Random image",
    width: 200,
    height: 300,
  },
};

export const WithLongDescription: Story = {
  args: {
    src: "https://picsum.photos/200/300",
    alt: "Image with long description",
    width: 200,
    height: 300,
    longDescription: "This is a detailed description of the image content",
  },
};

export const WithFallback: Story = {
  args: {
    src: "https://invalid-url.com/image.jpg",
    alt: "Image with fallback",
    width: 200,
    height: 300,
    fallbackSrc: "https://picsum.photos/200/300",
  },
};

export const Decorative: Story = {
  args: {
    src: "https://picsum.photos/200/300",
    alt: "",
    width: 200,
    height: 300,
    "aria-hidden": true,
  },
};

export const EagerLoading: Story = {
  args: {
    src: "https://picsum.photos/200/300",
    alt: "Eager loaded image",
    width: 200,
    height: 300,
    loading: "eager",
  },
};
