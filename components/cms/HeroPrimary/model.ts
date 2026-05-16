import { HeroPrimaryProps } from "./index";

const mockImage: ImageProps = {
  url: "https://images.unsplash.com/photo-1499750310107-5fef28a66643",
  alt: "Hero image",
  height: 800,
  width: 1200,
  type: "image/jpeg",
};

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

export const longContent: HeroPrimaryProps = {
  heading: "The Future of Web Development: Trends and Predictions for 2024",
  description:
    "In this comprehensive guide, we explore the latest trends in web development, from AI integration to new frameworks and tools that are shaping the future of the industry.",
  image: mockImage,
};

export const withCustomSizes: HeroPrimaryProps = {
  ...defaultHeroPrimary,
  sizes: ["100vw", "100vw", "800px", "1200px"],
};
