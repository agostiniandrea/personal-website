import type { Meta, StoryObj } from "@storybook/nextjs";

import AspectRatio from "./index";

const meta: Meta<typeof AspectRatio> = {
  title: "Ions/AspectRatio",
  component: AspectRatio,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    boxSize: {
      control: "text",
      description:
        "Box size can be a string like '16:9' or '3840:2880' (using colon), or an array for responsive values",
    },
  },
};

export default meta;
type Story = StoryObj<typeof AspectRatio>;

export const Default: Story = {
  args: {
    boxSize: "16:9",
    children: (
      <div
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: "24px",
        }}
      >
        16:9 Box Size
      </div>
    ),
  },
};

export const WithRatioString: Story = {
  args: {
    boxSize: "3840:2880",
    children: (
      <div
        style={{
          background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: "24px",
        }}
      >
        3840:2880 Box Size
      </div>
    ),
  },
};

export const WithObjectFormat: Story = {
  args: {
    boxSize: { width: 3840, height: 2880 },
    children: (
      <div
        style={{
          background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: "24px",
        }}
      >
        Object Format (3840x2880)
      </div>
    ),
  },
};

export const ResponsiveBreakpoints: Story = {
  args: {
    boxSize: ["4:3", "16:9", "21:9", "3840:2880"],
    children: (
      <div
        style={{
          background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: "24px",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        <div>Responsive Box Size</div>
        <div style={{ fontSize: "14px", opacity: 0.9 }}>
          Changes at different breakpoints: 4:3 → 16:9 → 21:9 → 3840:2880
        </div>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Using boxSize array: ['4:3', '16:9', '21:9', '3840:2880'] for [default, mobile, tablet, desktop]",
      },
    },
  },
};
