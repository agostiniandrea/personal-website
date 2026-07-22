import type { Meta, StoryObj } from "@storybook/nextjs";

import Container from "./index";

const meta: Meta<typeof Container> = {
  title: "Ions/Container",
  component: Container,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    verticalPadding: {
      control: "boolean",
      description: "Adds vertical padding to the container",
    },
    fullBleed: {
      control: "boolean",
      description:
        "Makes container full bleed (no side margins). Can be a boolean or array [default, mobile, tablet, desktop]",
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
    children: (
      <div
        style={{
          background: "#e3f2fd",
          padding: "2rem",
          border: "1px solid #2196f3",
        }}
      >
        <h2>Default Container</h2>
        <p>
          This container has constrained width (max 1440px) with side margins
          that adapt to screen size.
        </p>
      </div>
    ),
  },
};

export const FullBleed: Story = {
  args: {
    fullBleed: true,
    children: (
      <div
        style={{
          background: "#fff3e0",
          padding: "2rem",
          border: "1px solid #ff9800",
        }}
      >
        <h2>Full Bleed Container</h2>
        <p>
          This container spans the full width with no side margins at all
          breakpoints.
        </p>
      </div>
    ),
  },
};

export const ResponsiveFullBleed: Story = {
  args: {
    fullBleed: [true, true, false, false],
    children: (
      <div
        style={{
          background: "#f3e5f5",
          padding: "2rem",
          border: "1px solid #9c27b0",
        }}
      >
        <h2>Responsive Full Bleed</h2>
        <p>
          Full bleed on mobile and tablet (first two breakpoints), constrained
          width on desktop and larger.
        </p>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Using fullBleed=[true, true, false, false] - full bleed on default and mobile, constrained on tablet and desktop",
      },
    },
  },
};

export const WithVerticalPadding: Story = {
  args: {
    verticalPadding: true,
    children: (
      <div
        style={{
          background: "#e8f5e9",
          padding: "2rem",
          border: "1px solid #4caf50",
        }}
      >
        <h2>Container with Vertical Padding</h2>
        <p>
          This container has vertical padding that increases on larger screens.
        </p>
      </div>
    ),
  },
};

export const FullBleedWithVerticalPadding: Story = {
  args: {
    fullBleed: [true, true, false],
    verticalPadding: true,
    children: (
      <div
        style={{
          background: "#fce4ec",
          padding: "2rem",
          border: "1px solid #e91e63",
        }}
      >
        <h2>Full Bleed with Vertical Padding</h2>
        <p>
          Full bleed on mobile, constrained on tablet+, with vertical padding
          applied.
        </p>
      </div>
    ),
  },
};
