import { useRouter } from "next/router";

import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderWithTheme } from "@test-utils/renderWithTheme";

import MobileNav from "../index";

jest.mock("next/router", () => ({ useRouter: jest.fn() }));

const mockUseRouter = useRouter as jest.Mock;
const push = jest.fn();

/* The bar on a page that is not the homepage (the privacy policy): the same
   five destinations, but each one is a link back to the matching homepage
   view instead of a view swap on the current page. */
describe("MobileNav on a standalone page", () => {
  beforeAll(() => {
    window.scrollTo = jest.fn();
  });

  beforeEach(() => {
    push.mockReset();
    mockUseRouter.mockReturnValue({
      locale: "en",
      pathname: "/privacy",
      push,
    });
    window.history.replaceState(null, "", "/privacy");
  });

  afterEach(() => {
    window.history.replaceState(null, "", "/");
    document.documentElement.removeAttribute("data-mobile-view");
    document.documentElement.removeAttribute("data-story-sub");
  });

  it("renders nothing off the homepage unless asked to", () => {
    renderWithTheme(<MobileNav />);
    expect(screen.queryByTestId("mobile-nav")).not.toBeInTheDocument();
  });

  it("shows the five destinations with none marked as current", () => {
    renderWithTheme(<MobileNav standalone />);

    ["Home", "Work", "Story", "Forest", "More"].forEach((label) => {
      const button = screen.getByRole("button", { name: label });
      expect(button).toBeInTheDocument();
      expect(button).not.toHaveAttribute("aria-current");
    });
  });

  it("turns on the mobile layout without hiding any section, and cleans up", () => {
    const { unmount } = renderWithTheme(<MobileNav standalone />);
    expect(document.documentElement).toHaveAttribute(
      "data-mobile-view",
      "page",
    );
    expect(document.documentElement).not.toHaveAttribute("data-story-sub");

    unmount();
    expect(document.documentElement).not.toHaveAttribute("data-mobile-view");
  });

  it.each([
    ["Home", "/"],
    ["Work", "/#work"],
    ["Story", "/#journey"],
    ["Forest", "/#forest"],
  ])("takes %s to the homepage view at %s", async (label, href) => {
    const user = userEvent.setup();
    renderWithTheme(<MobileNav standalone />);

    await user.click(screen.getByRole("button", { name: label }));

    expect(push).toHaveBeenCalledWith(href);
  });

  it("opens the More sheet in place, without a history entry or hash", async () => {
    const user = userEvent.setup();
    const before = window.history.length;
    renderWithTheme(<MobileNav standalone />);

    await user.click(screen.getByRole("button", { name: "More" }));

    expect(screen.getByTestId("more-sheet")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "More" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(window.location.pathname).toBe("/privacy");
    expect(window.location.hash).toBe("");
    expect(window.history.length).toBe(before);
    expect(push).not.toHaveBeenCalled();
  });

  it("closes the sheet when More is tapped again", async () => {
    const user = userEvent.setup();
    renderWithTheme(<MobileNav standalone />);
    const more = screen.getByRole("button", { name: "More" });

    await user.click(more);
    await user.click(more);

    expect(more).not.toHaveAttribute("aria-current");
    expect(push).not.toHaveBeenCalled();
  });

  it("takes a More destination to its homepage view", async () => {
    const user = userEvent.setup();
    renderWithTheme(<MobileNav standalone />);

    await user.click(screen.getByRole("button", { name: "More" }));
    await user.click(
      screen.getByRole("button", {
        name: /Skills & tools Technologies and practices/i,
      }),
    );

    expect(push).toHaveBeenCalledWith("/#skills");
  });

  it("offers the social links in the sheet", async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <MobileNav
        standalone
        socialLinks={[
          { label: "LinkedIn", url: "https://linkedin.com/in/agostiniandrea" },
        ]}
      />,
    );

    await user.click(screen.getByRole("button", { name: "More" }));

    expect(screen.getByRole("link", { name: "LinkedIn" })).toHaveAttribute(
      "href",
      "https://linkedin.com/in/agostiniandrea",
    );
  });
});
