import { HeadingBoxProps } from "./index";

export const defaultHeadingBox: HeadingBoxProps = {
  preHeading: "Welcome to",
  heading: "Our Amazing Blog",
  description: "Discover interesting articles and stories from our team.",
  cta: {
    label: "Start Reading",
    url: "/blog",
  },
};

export const aboutHeadingBox: HeadingBoxProps = {
  preHeading: "About",
  heading: "Our Mission",
  description: "We strive to deliver the best content for our readers.",
};

export const minimalHeadingBox: HeadingBoxProps = {
  preHeading: null,
  heading: "Simple Heading",
  description: null,
};

export const withLongContent: HeadingBoxProps = {
  preHeading: "Featured Article",
  heading: "The Future of Web Development: Trends and Predictions for 2024",
  description:
    "In this comprehensive guide, we explore the latest trends in web development, from AI integration to new frameworks and tools that are shaping the future of the industry.",
  cta: {
    label: "Read More",
    url: "/articles/future-of-web-dev",
  },
};

export const withSpecialCharacters: HeadingBoxProps = {
  preHeading: "Special Edition",
  heading: "Café & More: A Guide to Local Eateries",
  description:
    "Discover the best places to eat, from cozy cafés to fine dining restaurants. Our curated list includes hidden gems and popular spots.",
  cta: {
    label: "View Guide",
    url: "/guides/local-eateries",
  },
};
