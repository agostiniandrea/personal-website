import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { mockDesktopViewport } from "@test-utils/mockMatchMedia";
import { renderWithTheme } from "@test-utils/renderWithTheme";

import InfoTooltip from "../index";

const renderTooltip = (onOpen?: () => void) =>
  renderWithTheme(
    <InfoTooltip ariaLabel="About the CO₂ estimate" onOpen={onOpen}>
      Estimated CO₂ capture over the trees&apos; expected lifetime.
    </InfoTooltip>,
  );

describe("InfoTooltip", () => {
  it("renders a real button with the localized aria-label and no tooltip initially", () => {
    renderTooltip();
    const trigger = screen.getByRole("button", {
      name: "About the CO₂ estimate",
    });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("toggles on tap: first click opens, second closes", async () => {
    const user = userEvent.setup();
    const onOpen = jest.fn();
    renderTooltip(onOpen);
    const trigger = screen.getByRole("button");

    await user.click(trigger);
    const tooltip = screen.getByRole("tooltip");
    expect(tooltip).toHaveTextContent(/expected lifetime/);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(trigger).toHaveAttribute("aria-describedby", tooltip.id);
    expect(onOpen).toHaveBeenCalledTimes(1);

    await user.click(trigger);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    renderTooltip();
    await user.click(screen.getByRole("button"));
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("closes on outside click", async () => {
    const user = userEvent.setup();
    renderTooltip();
    await user.click(screen.getByRole("button"));
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
    await user.click(document.body);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("opens on keyboard focus and closes on focus loss", async () => {
    const user = userEvent.setup();
    renderTooltip();
    await user.tab();
    expect(screen.getByRole("button")).toHaveFocus();
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
    await user.tab();
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("stays open while the pointer moves from the trigger into the tooltip", () => {
    mockDesktopViewport();
    renderTooltip();

    const trigger = screen.getByRole("button");
    fireEvent.mouseEnter(trigger.parentElement!);
    const tooltip = screen.getByRole("tooltip");
    fireEvent.mouseLeave(trigger, { relatedTarget: tooltip });

    expect(tooltip).toBeInTheDocument();
    fireEvent.mouseLeave(trigger.parentElement!, {
      relatedTarget: document.body,
    });
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("keeps a single tooltip open at a time", async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <>
        <InfoTooltip ariaLabel="First">first body</InfoTooltip>
        <InfoTooltip ariaLabel="Second">second body</InfoTooltip>
      </>,
    );
    await user.click(screen.getByRole("button", { name: "First" }));
    await user.click(screen.getByRole("button", { name: "Second" }));
    const tooltips = screen.getAllByRole("tooltip");
    expect(tooltips).toHaveLength(1);
    expect(tooltips[0]).toHaveTextContent("second body");
  });
});
