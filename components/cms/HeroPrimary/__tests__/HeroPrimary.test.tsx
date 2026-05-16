import { screen } from "@testing-library/react";
import { renderWithTheme } from "@test-utils/renderWithTheme";
import HeroPrimary from "../index";
import { defaultHeroPrimary, longContent, withCustomSizes } from "../model";

describe("HeroPrimary", () => {
  it("renders correctly with default props", () => {
    const { container } = renderWithTheme(
      <HeroPrimary {...defaultHeroPrimary} />,
    );
    expect(container).toMatchSnapshot();
  });

  it("renders correctly with long content", () => {
    const { container } = renderWithTheme(<HeroPrimary {...longContent} />);
    expect(container).toMatchSnapshot();
  });

  it("renders correctly with custom sizes", () => {
    const { container } = renderWithTheme(
      <HeroPrimary {...withCustomSizes} />,
    );
    expect(container).toMatchSnapshot();
  });

  it("renders the heading as h1", () => {
    renderWithTheme(<HeroPrimary {...defaultHeroPrimary} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      defaultHeroPrimary.heading,
    );
  });

  it("renders the description", () => {
    renderWithTheme(<HeroPrimary {...defaultHeroPrimary} />);
    expect(
      screen.getByText(defaultHeroPrimary.description),
    ).toBeInTheDocument();
  });

  it("renders the image", () => {
    renderWithTheme(<HeroPrimary {...defaultHeroPrimary} />);
    expect(screen.getByRole("img")).toHaveAttribute(
      "alt",
      defaultHeroPrimary.image.alt,
    );
  });
});
