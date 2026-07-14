import { screen } from "@testing-library/react";

import { renderWithTheme } from "@test-utils/renderWithTheme";

import Grid from "../index";

describe("Grid", () => {
  it("renders grid with children", () => {
    const { container } = renderWithTheme(
      <Grid>
        <div>Item 1</div>
        <div>Item 2</div>
      </Grid>,
    );

    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
    expect(container.firstChild).toMatchSnapshot();
  });

  it("renders with a numeric columns value", () => {
    const { container } = renderWithTheme(
      <Grid columns={3}>
        <div>A</div>
        <div>B</div>
        <div>C</div>
      </Grid>,
    );

    expect(container.firstChild).toMatchSnapshot();
  });

  it("renders with a string columns value", () => {
    const { container } = renderWithTheme(
      <Grid columns="200px 1fr">
        <div>Left</div>
        <div>Right</div>
      </Grid>,
    );

    expect(container.firstChild).toMatchSnapshot();
  });

  it("renders with responsive columns array", () => {
    const columns: (number | undefined)[] = [1, undefined, 2, 3];
    const { container } = renderWithTheme(
      <Grid columns={columns}>
        <div>A</div>
        <div>B</div>
        <div>C</div>
      </Grid>,
    );

    expect(container.firstChild).toMatchSnapshot();
  });

  it("renders with gap token", () => {
    const { container } = renderWithTheme(
      <Grid columns={2} gap="md">
        <div>A</div>
        <div>B</div>
      </Grid>,
    );

    expect(container.firstChild).toMatchSnapshot();
  });

  it("applies className prop", () => {
    const { container } = renderWithTheme(
      <Grid className="custom-grid">
        <div>Item</div>
      </Grid>,
    );

    expect(container.firstChild).toHaveClass("custom-grid");
  });

  it("renders as ol when specified", () => {
    renderWithTheme(
      <Grid as="ol">
        <li>Item</li>
      </Grid>,
    );

    const list = screen.getByRole("list");
    expect(list.tagName).toBe("OL");
  });
});
