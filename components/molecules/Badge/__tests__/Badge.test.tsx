import { screen } from "@testing-library/react";

import { renderWithTheme } from "@test-utils/renderWithTheme";

import Badge from "../index";

describe("Badge", () => {
  it("renders badge with default props (md size, span)", () => {
    const { container } = renderWithTheme(<Badge>TypeScript</Badge>);

    const badge = screen.getByText("TypeScript");
    expect(badge).toBeInTheDocument();
    expect(container.firstChild).toMatchSnapshot();
  });

  it("renders md size badge with correct styles", () => {
    renderWithTheme(<Badge size="md">React</Badge>);

    const badge = screen.getByText("React");
    expect(badge).toHaveStyle({ fontSize: "0.875rem" });
  });

  it("renders sm size badge with correct styles", () => {
    renderWithTheme(<Badge size="sm">Next.js</Badge>);

    const badge = screen.getByText("Next.js");
    expect(badge).toHaveStyle({ fontSize: "0.75rem" });
  });

  it("renders as li when specified", () => {
    renderWithTheme(
      <ul>
        <Badge as="li">Skill</Badge>
      </ul>,
    );

    const item = screen.getByRole("listitem");
    expect(item).toBeInTheDocument();
    expect(item).toHaveTextContent("Skill");
  });

  it("applies className prop", () => {
    renderWithTheme(<Badge className="custom-badge">Tag</Badge>);

    const badge = screen.getByText("Tag");
    expect(badge).toHaveClass("custom-badge");
  });
});
