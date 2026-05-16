import { screen } from "@testing-library/react";
import { renderWithTheme } from "@test-utils/renderWithTheme";
import FeaturePrimary from "../index";
import {
  defaultFeature,
  minimalFeature,
  longContentFeature,
} from "../model";

describe("FeaturePrimary", () => {
  it("renders correctly with all props", () => {
    const { container } = renderWithTheme(
      <FeaturePrimary {...defaultFeature} />,
    );
    expect(container).toMatchSnapshot();
  });

  it("renders correctly without optional fields", () => {
    const { container } = renderWithTheme(
      <FeaturePrimary {...minimalFeature} />,
    );
    expect(container).toMatchSnapshot();
  });

  it("renders correctly with long content", () => {
    const { container } = renderWithTheme(
      <FeaturePrimary {...longContentFeature} />,
    );
    expect(container).toMatchSnapshot();
  });

  it("renders the heading", () => {
    renderWithTheme(<FeaturePrimary {...defaultFeature} />);
    expect(
      screen.getByText(defaultFeature.heading!),
    ).toBeInTheDocument();
  });

  it("renders the pre-heading when provided", () => {
    renderWithTheme(<FeaturePrimary {...defaultFeature} />);
    expect(
      screen.getByText(defaultFeature.preHeading!),
    ).toBeInTheDocument();
  });

  it("renders the description when provided", () => {
    renderWithTheme(<FeaturePrimary {...defaultFeature} />);
    expect(
      screen.getByText(defaultFeature.description!),
    ).toBeInTheDocument();
  });

  it("renders the CTA link when provided", () => {
    renderWithTheme(<FeaturePrimary {...defaultFeature} />);
    const link = screen.getByRole("link", { name: defaultFeature.cta!.label });
    expect(link).toHaveAttribute("href", defaultFeature.cta!.url);
  });

  it("does not render CTA when not provided", () => {
    renderWithTheme(<FeaturePrimary {...minimalFeature} />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("renders the image", () => {
    renderWithTheme(<FeaturePrimary {...defaultFeature} />);
    expect(screen.getByRole("img")).toHaveAttribute("alt", defaultFeature.image.alt);
  });
});
