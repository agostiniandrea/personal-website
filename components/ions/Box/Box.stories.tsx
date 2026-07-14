import type { Meta, StoryObj } from "@storybook/nextjs";

import Box from "./index";

const meta: Meta<typeof Box> = {
  title: "Ions/Box",
  component: Box,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    m: {
      control: "text",
      description: "Margin (all sides) - accepts spacing token (xs, sm, md, lg, xl, 2xl, etc.), number (px), or string",
    },
    p: {
      control: "text",
      description: "Padding (all sides) - accepts spacing token, number, or string",
    },
    gap: {
      control: "text",
      description: "Gap - accepts spacing token, number, or string",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Box>;

export const Default: Story = {
  args: {
    children: "Default Box with no spacing",
    styles: {
      background: "#f0f0f0",
      border: "1px solid #ccc",
    },
  },
};

export const WithPadding: Story = {
  args: {
    p: "lg",
    children: "Box with padding='lg' (1rem)",
    styles: {
      background: "#e3f2fd",
      border: "1px solid #2196f3",
    },
  },
};

export const WithMargin: Story = {
  args: {
    m: "xl",
    children: "Box with margin='xl' (1.5rem)",
    styles: {
      background: "#fff3e0",
      border: "1px solid #ff9800",
    },
  },
};

export const WithSpacingTokens: Story = {
  args: {
    p: "xl",
    m: "2xl",
    children: "Box with padding='xl' and margin='2xl'",
    styles: {
      background: "#f3e5f5",
      border: "1px solid #9c27b0",
    },
  },
};

export const WithAxisSpacing: Story = {
  args: {
    px: "lg",
    py: "xl",
    mx: "md",
    my: "sm",
    children: "Box with px='lg', py='xl', mx='md', my='sm'",
    styles: {
      background: "#e8f5e9",
      border: "1px solid #4caf50",
    },
  },
};

export const WithGap: Story = {
  args: {
    p: "lg",
    gap: "md",
    styles: {
      background: "#fff9c4",
      border: "1px solid #fbc02d",
      display: "flex",
    },
    children: (
      <>
        <div style={{ background: "#ffccbc", padding: "0.5rem" }}>Item 1</div>
        <div style={{ background: "#ffccbc", padding: "0.5rem" }}>Item 2</div>
        <div style={{ background: "#ffccbc", padding: "0.5rem" }}>Item 3</div>
      </>
    ),
  },
};

export const WithRowAndColumnGap: Story = {
  args: {
    p: "lg",
    rowGap: "md",
    columnGap: "xl",
    styles: {
      background: "#e1f5fe",
      border: "1px solid #03a9f4",
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
    },
    children: (
      <>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            style={{ background: "#b3e5fc", padding: "0.5rem", textAlign: "center" }}
          >
            {i + 1}
          </div>
        ))}
      </>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: "Using rowGap='md' and columnGap='xl' in a grid layout",
      },
    },
  },
};

export const WithIndividualSides: Story = {
  args: {
    pt: "lg",
    pr: "xl",
    pb: "md",
    pl: "sm",
    mt: "2xl",
    mr: "lg",
    mb: "xl",
    ml: "md",
    children: "Box with individual spacing on each side",
    styles: {
      background: "#fce4ec",
      border: "1px solid #e91e63",
    },
  },
};

export const WithNumberValue: Story = {
  args: {
    p: 20, // Will be converted to 20px
    m: "lg", // Token
    children: "Box mixing token (margin='lg') and number (padding=20px)",
    styles: {
      background: "#e0f2f1",
      border: "1px solid #009688",
    },
  },
};

