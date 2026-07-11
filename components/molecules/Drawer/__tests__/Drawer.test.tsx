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

describe("Drawer — open state", () => {
  it("renders as dialog with aria-modal when open", () => {
    renderWithTheme(
      <Drawer isOpen={true} aria-label="Navigation menu">
        <p>Drawer content</p>
      </Drawer>,
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute("aria-modal", "true");
  });

  it("exposes children to the accessibility tree when open", () => {
    renderWithTheme(
      <Drawer isOpen={true} aria-label="Navigation menu">
        <button>Close</button>
      </Drawer>,
    );
    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
  });

  it("does not have aria-hidden when open", () => {
    renderWithTheme(
      <Drawer isOpen={true} aria-label="Navigation menu">
        <p>Content</p>
      </Drawer>,
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog).not.toHaveAttribute("aria-hidden");
  });

  it("forwards ref to underlying div when open", () => {
    const ref = React.createRef<HTMLDivElement>();
    renderWithTheme(
      <Drawer isOpen={true} ref={ref}>
        <p>Content</p>
      </Drawer>,
    );
    expect(ref.current).not.toBeNull();
  });
});

describe("Drawer — closed state", () => {
  it("is not queryable as a dialog when closed", () => {
    renderWithTheme(
      <Drawer isOpen={false} id="mobile-nav" aria-label="Navigation menu">
        <p>Content</p>
      </Drawer>,
    );
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("has aria-hidden=true when closed", () => {
    const { container } = renderWithTheme(
      <Drawer isOpen={false} id="mobile-nav">
        <p>Content</p>
      </Drawer>,
    );
    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
  });

  it("has inert attribute when closed", () => {
    const { container } = renderWithTheme(
      <Drawer isOpen={false} id="mobile-nav">
        <button>Should not be reachable</button>
      </Drawer>,
    );
    expect(container.firstChild).toHaveAttribute("inert");
  });

  it("does not have role=dialog when closed", () => {
    const { container } = renderWithTheme(
      <Drawer isOpen={false} id="mobile-nav">
        <p>Content</p>
      </Drawer>,
    );
    expect(container.firstChild).not.toHaveAttribute("role", "dialog");
  });

  it("forwards ref when closed", () => {
    const ref = React.createRef<HTMLDivElement>();
    renderWithTheme(
      <Drawer isOpen={false} ref={ref}>
        <p>Content</p>
      </Drawer>,
    );
    expect(ref.current).not.toBeNull();
  });

  it("matches snapshot when closed", () => {
    const { container } = renderWithTheme(
      <Drawer isOpen={false} id="mobile-nav">
        <p>Content</p>
      </Drawer>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
