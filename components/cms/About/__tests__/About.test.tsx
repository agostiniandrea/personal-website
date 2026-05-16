import { screen } from "@testing-library/react";
import { renderWithTheme } from "@test-utils/renderWithTheme";
import About from "../index";
import { defaultAbout, minimalAbout } from "../model";

describe("About", () => {
  it("renders correctly with all props", () => {
    const { container } = renderWithTheme(<About {...defaultAbout} />);
    expect(container).toMatchSnapshot();
  });

  it("renders correctly without optional tags", () => {
    const { container } = renderWithTheme(<About {...minimalAbout} />);
    expect(container).toMatchSnapshot();
  });

  it("renders the section label", () => {
    renderWithTheme(<About {...defaultAbout} />);
    expect(screen.getByText(defaultAbout.sectionLabel)).toBeInTheDocument();
  });

  it("renders the heading", () => {
    renderWithTheme(<About {...defaultAbout} />);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      defaultAbout.heading,
    );
  });

  it("renders the bio text", () => {
    renderWithTheme(<About {...defaultAbout} />);
    expect(screen.getByText(defaultAbout.bio)).toBeInTheDocument();
  });

  it("renders location and availability tags when provided", () => {
    renderWithTheme(<About {...defaultAbout} />);
    expect(screen.getByText(defaultAbout.location!)).toBeInTheDocument();
    expect(screen.getByText(defaultAbout.availability!)).toBeInTheDocument();
  });

  it("does not render tags when neither location nor availability is provided", () => {
    renderWithTheme(<About {...minimalAbout} />);
    expect(screen.queryByText(defaultAbout.location!)).not.toBeInTheDocument();
    expect(
      screen.queryByText(defaultAbout.availability!),
    ).not.toBeInTheDocument();
  });
});
