import { screen } from "@testing-library/react";

import { renderWithTheme } from "@test-utils/renderWithTheme";

import Heading from "../index";

describe("Heading", () => {
  it("renders heading with default props (h2, section size)", () => {
    const { container } = renderWithTheme(<Heading>Hello World</Heading>);

    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent("Hello World");
    expect(container.firstChild).toMatchSnapshot();
  });

  it("renders display size heading", () => {
    renderWithTheme(<Heading size="display">Display Heading</Heading>);

    const heading = screen.getByRole("heading");
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveStyle({ fontSize: "3.25rem", lineHeight: "1" });
  });

  it("renders section size heading", () => {
    renderWithTheme(<Heading size="section">Section Heading</Heading>);

    const heading = screen.getByRole("heading");
    expect(heading).toHaveStyle({ fontSize: "2rem", lineHeight: "1.1" });
  });

  it("renders card size heading", () => {
    renderWithTheme(<Heading size="card">Card Heading</Heading>);

    const heading = screen.getByRole("heading");
    expect(heading).toHaveStyle({ fontSize: "1.25rem", lineHeight: "1.2" });
  });

  it("renders as h1 when specified", () => {
    renderWithTheme(<Heading as="h1">H1 Heading</Heading>);

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();
  });

  it("renders as h3 when specified", () => {
    renderWithTheme(<Heading as="h3">H3 Heading</Heading>);

    const heading = screen.getByRole("heading", { level: 3 });
    expect(heading).toBeInTheDocument();
  });

  it("applies className prop", () => {
    renderWithTheme(<Heading className="custom-heading">Heading</Heading>);

    const heading = screen.getByRole("heading");
    expect(heading).toHaveClass("custom-heading");
  });

  it("applies id prop", () => {
    renderWithTheme(<Heading id="my-heading">Heading</Heading>);

    const heading = screen.getByRole("heading");
    expect(heading).toHaveAttribute("id", "my-heading");
  });
});
