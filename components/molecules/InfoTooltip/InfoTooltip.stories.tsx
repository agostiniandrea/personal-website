import type { Meta, StoryObj } from "@storybook/react";

import InfoTooltip from "./index";

const EN_BODY =
  "Estimated CO₂ capture over the trees’ expected lifetime, based on Tree-Nation data.";
const IT_BODY =
  "Stima della CO₂ assorbita durante il ciclo di vita previsto degli alberi, basata sui dati di Tree-Nation.";

const meta: Meta<typeof InfoTooltip> = {
  title: "Molecules/InfoTooltip",
  component: InfoTooltip,
  decorators: [
    (Story) => (
      <div style={{ padding: "8rem 4rem", fontSize: "0.875rem" }}>
        4 trees · 2 species · 1.5 t CO₂ lifetime estimate <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof InfoTooltip>;

export const DesktopClosed: Story = {
  args: { ariaLabel: "About the CO₂ estimate", children: EN_BODY },
};

export const DesktopOpen: Story = {
  args: {
    ariaLabel: "About the CO₂ estimate",
    children: EN_BODY,
    defaultOpen: true,
  },
};

export const MobileClosed: Story = {
  args: { ariaLabel: "About the CO₂ estimate", children: EN_BODY },
  parameters: { viewport: { defaultViewport: "mobile1" } },
};

export const MobileOpen: Story = {
  args: {
    ariaLabel: "About the CO₂ estimate",
    children: EN_BODY,
    defaultOpen: true,
  },
  parameters: { viewport: { defaultViewport: "mobile1" } },
};

export const LongItalianCopy: Story = {
  args: {
    ariaLabel: "Informazioni sulla stima della CO₂",
    children: IT_BODY,
    defaultOpen: true,
  },
};

export const ViewportEdgeCollision: Story = {
  args: {
    ariaLabel: "About the CO₂ estimate",
    children: EN_BODY,
    defaultOpen: true,
  },
  decorators: [
    (Story) => (
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          padding: "1rem 4px 8rem 0",
        }}
      >
        <Story />
      </div>
    ),
  ],
};
