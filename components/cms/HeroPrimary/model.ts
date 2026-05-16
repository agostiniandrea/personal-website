import { HeroPrimaryProps } from "./index";

export const defaultHeroPrimary: HeroPrimaryProps = {
  heading: "Iceland: Fire & Ice",
  description: "A journey through volcanoes, glaciers, and the midnight sun.",
  image: {
    url: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1920&h=1440",
    alt: "Iceland landscape",
    width: 1920,
    height: 1440,
    type: "image/jpeg",
  },
};

export const withCustomSizes: HeroPrimaryProps = {
  ...defaultHeroPrimary,
  sizes: ["100vw", "100vw", "800px", "1200px"],
};
