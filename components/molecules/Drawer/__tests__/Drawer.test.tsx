import React from "react";
import { screen } from "@testing-library/react";
import { Drawer, DrawerTopBar, Overlay } from "../index";
import { renderWithTheme } from "@test-utils/renderWithTheme";

describe("Overlay", () => {
  it("renders overlay when open", () => {
    const { container } = renderWithTheme(<Overlay isOpen={true} />);
    expect(container.firstChild).toBeInTheDocument();
    expect(container.firstChild).toMatchSnapshot();
  });

  it("renders overlay when closed", () => {
    const { container } = renderWithTheme(<Overlay isOpen={false} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});

describe("DrawerTopBar", () => {
  it("renders children", () => {
    renderWithTheme(<DrawerTopBar>Close Button</DrawerTopBar>);
    expect(screen.getByText("Close Button")).toBeInTheDocument();
  });

  it("matches snapshot", () => {
    const { container } = renderWithTheme(
      <DrawerTopBar>
        <button>X</button>
      </DrawerTopBar>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});

describe("Drawer", () => {
  it("renders open drawer with children", () => {
    renderWithTheme(
      <Drawer isOpen={true} aria-label="Navigation menu">
        <p>Drawer content</p>
      </Drawer>,
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(screen.getByText("Drawer content")).toBeInTheDocument();
  });

  it("renders closed drawer", () => {
    const { container } = renderWithTheme(
      <Drawer isOpen={false} id="mobile-nav">
        <p>Content</p>
      </Drawer>,
    );

    expect(container.firstChild).toMatchSnapshot();
  });

  it("forwards ref to underlying div", () => {
    const ref = React.createRef<HTMLDivElement>();
    renderWithTheme(
      <Drawer isOpen={false} ref={ref}>
        <p>Content</p>
      </Drawer>,
    );

    expect(ref.current).not.toBeNull();
  });
});
