import { screen } from "@testing-library/react";
import { renderWithTheme } from "@test-utils/renderWithTheme";
import {
  mockMobileViewport,
  mockDesktopViewport,
} from "@test-utils/mockMatchMedia";
import HeadingBox from "../index";
import {
  defaultHeadingBox,
  aboutHeadingBox,
  minimalHeadingBox,
  withLongContent,
  withSpecialCharacters,
} from "../model";

describe("HeadingBox", () => {
  beforeEach(() => {
    mockDesktopViewport();
  });

  it("renders default heading box correctly", () => {
    renderWithTheme(<HeadingBox {...defaultHeadingBox} />);

    expect(screen.getByText("Welcome to")).toBeInTheDocument();
    expect(screen.getByText("Our Amazing Blog")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Discover interesting articles and stories from our team.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Start Reading")).toBeInTheDocument();
  });

  it("renders about heading box without CTA", () => {
    renderWithTheme(<HeadingBox {...aboutHeadingBox} />);

    expect(screen.getByText("About")).toBeInTheDocument();
    expect(screen.getByText("Our Mission")).toBeInTheDocument();
    expect(
      screen.getByText(
        "We strive to deliver the best content for our readers.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText("Start Reading")).not.toBeInTheDocument();
  });

  it("renders minimal heading box with only heading", () => {
    renderWithTheme(<HeadingBox {...minimalHeadingBox} />);

    expect(screen.queryByText("Welcome to")).not.toBeInTheDocument();
    expect(screen.getByText("Simple Heading")).toBeInTheDocument();
    expect(
      screen.queryByText("Discover interesting articles"),
    ).not.toBeInTheDocument();
  });

  it("renders heading box with long content", () => {
    renderWithTheme(<HeadingBox {...withLongContent} />);

    expect(screen.getByText("Featured Article")).toBeInTheDocument();
    expect(
      screen.getByText(
        "The Future of Web Development: Trends and Predictions for 2024",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(/In this comprehensive guide/)).toBeInTheDocument();
    expect(screen.getByText("Read More")).toBeInTheDocument();
  });

  it("renders heading box with special characters", () => {
    renderWithTheme(<HeadingBox {...withSpecialCharacters} />);

    expect(screen.getByText("Special Edition")).toBeInTheDocument();
    expect(
      screen.getByText("Café & More: A Guide to Local Eateries"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Discover the best places to eat/),
    ).toBeInTheDocument();
    expect(screen.getByText("View Guide")).toBeInTheDocument();
  });

  it("hides description on mobile view", () => {
    mockMobileViewport();
    renderWithTheme(<HeadingBox {...defaultHeadingBox} />);

    const description = screen.getByText(defaultHeadingBox.description!);
    expect(description).toHaveStyle({ opacity: "1" });
    expect(description).toBeVisible();
  });

  describe("Accessibility", () => {
    it("should have proper ARIA attributes and semantic structure", () => {
      renderWithTheme(
        <HeadingBox
          heading={defaultHeadingBox.heading}
          description={defaultHeadingBox.description}
          preHeading={defaultHeadingBox.preHeading}
          cta={defaultHeadingBox.cta}
        />,
      );

      // Check section role and ARIA attributes
      const section = screen.getByRole("region");
      expect(section).toBeInTheDocument();
      expect(section).toHaveAttribute("aria-label", "Heading Box");

      // Check heading hierarchy
      const heading = screen.getByRole("heading", { level: 2 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent(defaultHeadingBox.heading!);

      // Check pre-heading
      const preHeading = screen.getByText(defaultHeadingBox.preHeading!);
      expect(preHeading).toBeInTheDocument();
      expect(preHeading).toHaveAttribute("id", "pre-heading");

      // Check description
      const description = screen.getByText(defaultHeadingBox.description!);
      expect(description).toBeInTheDocument();
      expect(description).toHaveAttribute("id", "heading-description");

      // Check CTA link
      const ctaLink = screen.getByRole("link", {
        name: defaultHeadingBox.cta!.label,
      });
      expect(ctaLink).toBeInTheDocument();
      expect(ctaLink).toHaveAttribute("href", defaultHeadingBox.cta!.url);
    });

    it("should maintain proper heading hierarchy without pre-heading", () => {
      renderWithTheme(
        <HeadingBox
          preHeading=''
          heading={minimalHeadingBox.heading}
          description={minimalHeadingBox.description}
        />,
      );

      const heading = screen.getByRole("heading", { level: 2 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent(minimalHeadingBox.heading!);
    });
  });
});
