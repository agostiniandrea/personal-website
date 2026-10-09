import { act, fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  createMatchMediaMock,
  mockDesktopViewport,
} from "@test-utils/mockMatchMedia";
import { renderWithTheme } from "@test-utils/renderWithTheme";

import TreeNationPopover from "../index";

jest.mock("next/router", () => ({
  useRouter: () => ({ locale: "en" }),
}));

const PROFILE = "https://tree-nation.com/profile/andrea-agostini-103769";

const renderPopover = () =>
  renderWithTheme(
    <div>
      <button type="button">before</button>
      <TreeNationPopover
        ariaLabel="Certified by Tree-Nation"
        linkHref={PROFILE}
        linkLabel="View the forest on Tree-Nation"
      />
      <button type="button">after</button>
    </div>,
  );

const trigger = () =>
  screen.getByRole("button", { name: "Certified by Tree-Nation" });

describe("TreeNationPopover", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    document.querySelectorAll("script").forEach((el) => el.remove());
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("is closed by default and mounts no Tree-Nation label", () => {
    renderPopover();
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
    expect(trigger()).toHaveAttribute("aria-haspopup", "dialog");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(document.querySelector("[data-widget-type]")).toBeNull();
  });

  it("opens on click with the official Tree Counter in its light theme and the forest link", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderPopover();
    await user.click(trigger());

    const dialog = screen.getByRole("dialog", {
      name: "Certified by Tree-Nation",
    });
    expect(trigger()).toHaveAttribute("aria-expanded", "true");
    expect(trigger()).toHaveAttribute("aria-controls", dialog.id);

    const widget = dialog.querySelector("[data-widget-type]");
    expect(widget).toHaveAttribute("data-widget-type", "tree-counter");
    expect(widget).toHaveAttribute("data-tree-nation-code", "c128ea8ddf37a37a");
    // The panel is white, so the label is the light one even in a dark site.
    expect(widget).toHaveAttribute("data-theme", "light");

    const link = screen.getByRole("link", {
      name: /View the forest on Tree-Nation/i,
    });
    expect(link).toHaveAttribute("href", PROFILE);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
  });

  it("toggles on tap: the second tap closes it", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderPopover();
    await user.click(trigger());
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await user.click(trigger());
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens on hover and closes when the pointer leaves, on pointer-fine devices", () => {
    mockDesktopViewport();
    renderPopover();
    const wrapper = trigger().parentElement!;

    fireEvent.mouseEnter(wrapper);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    fireEvent.mouseLeave(wrapper);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("stays open after the pointer leaves once it has been clicked", async () => {
    mockDesktopViewport();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderPopover();
    const wrapper = trigger().parentElement!;

    fireEvent.mouseEnter(wrapper);
    await user.click(trigger());
    fireEvent.mouseLeave(wrapper);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("does not open on mouseenter when the device cannot hover", () => {
    window.matchMedia = createMatchMediaMock(false);
    renderPopover();
    fireEvent.mouseEnter(trigger().parentElement!);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes on Escape and gives focus back to the badge", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderPopover();
    await user.click(trigger());
    await user.tab();
    expect(screen.getByRole("link")).toHaveFocus();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger()).toHaveFocus();
  });

  it("closes on an outside click", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderPopover();
    await user.click(trigger());
    await user.click(document.body);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("is keyboard operable: Enter opens, Tab reaches the link, Tab again leaves and closes", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderPopover();
    await user.tab(); // "before"
    await user.tab(); // the badge
    expect(trigger()).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.tab();
    expect(screen.getByRole("link")).toHaveFocus();
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.tab(); // "after"
    expect(screen.getByRole("button", { name: "after" })).toHaveFocus();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("keeps the panel on the viewport: flips below when clipped at the top", () => {
    renderPopover();
    jest.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      bottom: 40,
      height: 40,
      left: 100,
      right: 300,
      top: 0,
      width: 200,
      x: 100,
      y: 0,
      toJSON: () => ({}),
    });
    jest.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      cb(0);
      return 1;
    });

    act(() => {
      fireEvent.click(trigger());
    });
    const positioner = screen.getByRole("dialog").parentElement!;
    expect(positioner).toHaveStyleRule("top", "100%");
    jest.restoreAllMocks();
  });
});
