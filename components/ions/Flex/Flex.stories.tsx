import type { Meta, StoryObj } from "@storybook/nextjs";

import Flex from "./index";

/**
 * Spacing tokens:
 * xs = 0.25rem, sm = 0.5rem, md = 0.75rem, lg = 1rem (baseline),
 * xl = 1.5rem, 2xl = 2rem, 3xl = 3rem, 4xl = 4rem, 5xl = 5rem, etc.
 */

const meta: Meta<typeof Flex> = {
  title: "Ions/Flex",
  component: Flex,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    direction: {
      control: "text",
      description:
        "flex-direction (can be a string or object with breakpoints)",
    },
    gap: {
      control: "number",
      description:
        "gap value (can be a number, string, or object with breakpoints)",
    },
    alignItems: {
      control: "text",
      description: "align-items value",
    },
    justifyContent: {
      control: "text",
      description: "justify-content value",
    },
    wrap: {
      control: "text",
      description: "flex-wrap value",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Flex>;

const Box = ({ color, text }: { color: string; text: string }) => (
  <div
    style={{
      background: color,
      padding: "2rem",
      color: "white",
      borderRadius: "8px",
      minWidth: "150px",
      textAlign: "center",
    }}
  >
    {text}
  </div>
);

export const Default: Story = {
  args: {
    children: (
      <>
        <Box color="#667eea" text="Box 1" />
        <Box color="#764ba2" text="Box 2" />
        <Box color="#f093fb" text="Box 3" />
      </>
    ),
  },
};

export const WithDirection: Story = {
  args: {
    direction: "column",
    gap: "lg", // Token lg = 1rem
    children: (
      <>
        <Box color="#667eea" text="Box 1" />
        <Box color="#764ba2" text="Box 2" />
        <Box color="#f093fb" text="Box 3" />
      </>
    ),
  },
};

export const WithSpacingTokens: Story = {
  args: {
    direction: "row",
    gap: "xl", // Token xl = 1.5rem
    children: (
      <>
        <Box color="#667eea" text="Token xl" />
        <Box color="#764ba2" text="1.5rem gap" />
        <Box color="#f093fb" text="Box 3" />
      </>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Using spacing token 'xl' (1.5rem = 24px). Tokens: xs, sm, md, lg, xl, 2xl, 3xl, 4xl, etc.",
      },
    },
  },
};

export const ResponsiveTokens: Story = {
  args: {
    direction: ["column", "column", "row"],
    gap: ["sm", "md", "lg", "xl"], // [0.5rem, 0.75rem, 1rem, 1.5rem]
    children: (
      <>
        <Box color="#667eea" text="Box 1" />
        <Box color="#764ba2" text="Box 2" />
        <Box color="#f093fb" text="Box 3" />
      </>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Using spacing tokens in responsive array: ['sm', 'md', 'lg', 'xl'] = [0.5rem, 0.75rem, 1rem, 1.5rem]",
      },
    },
  },
};

export const ResponsiveDirection: Story = {
  args: {
    direction: ["column", "column", "row"],
    gap: [8, 12, 16, 24],
    children: (
      <>
        <Box color="#667eea" text="Box 1" />
        <Box color="#764ba2" text="Box 2" />
        <Box color="#f093fb" text="Box 3" />
      </>
    ),
  },
};

export const WithAlignment: Story = {
  args: {
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    children: (
      <>
        <Box color="#667eea" text="Box 1" />
        <Box color="#764ba2" text="Box 2" />
        <Box color="#f093fb" text="Box 3" />
      </>
    ),
  },
};

export const ResponsiveGap: Story = {
  args: {
    direction: "row",
    gap: ["sm", "md", "lg", "xl", "2xl"],
    wrap: "wrap",
    children: (
      <>
        <Box color="#667eea" text="Box 1" />
        <Box color="#764ba2" text="Box 2" />
        <Box color="#f093fb" text="Box 3" />
        <Box color="#4facfe" text="Box 4" />
        <Box color="#00f2fe" text="Box 5" />
      </>
    ),
  },
};

export const CompleteResponsive: Story = {
  args: {
    direction: ["column", "column", "row"],
    gap: ["sm", "sm", "lg", "xl"],
    alignItems: ["flex-start", "flex-start", "center"],
    justifyContent: ["flex-start", "flex-start", "space-between"],
    wrap: ["nowrap", "nowrap", "wrap"],
    children: (
      <>
        <Box color="#667eea" text="Box 1" />
        <Box color="#764ba2" text="Box 2" />
        <Box color="#f093fb" text="Box 3" />
        <Box color="#4facfe" text="Box 4" />
      </>
    ),
  },
};

export const PartialArray: Story = {
  args: {
    direction: ["column", "row"],
    gap: ["sm", "lg"],
    children: (
      <>
        <Box color="#667eea" text="Box 1" />
        <Box color="#764ba2" text="Box 2" />
        <Box color="#f093fb" text="Box 3" />
      </>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          "When array has fewer values than breakpoints, the last defined value is used for remaining breakpoints.",
      },
    },
  },
};
