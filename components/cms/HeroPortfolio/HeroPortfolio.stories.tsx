import type { Meta, StoryObj } from "@storybook/nextjs";
import HeroPortfolio from "./index";
import { defaultHeroPortfolio, noCta } from "./model";

const meta: Meta<typeof HeroPortfolio> = {
  title: "CMS/HeroPortfolio",
  component: HeroPortfolio,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof HeroPortfolio>;

export const Default: Story = {
  args: defaultHeroPortfolio,
};

export const NoCta: Story = {
  args: noCta,
};
