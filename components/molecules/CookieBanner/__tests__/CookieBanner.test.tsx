import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CONSENT_KEY } from "@lib/utils/consent";
import { renderWithTheme } from "@test-utils/renderWithTheme";

import CookieBanner from "../index";

const blockStorage = () => {
  const denied = () => {
    throw new DOMException("The operation is insecure.", "SecurityError");
  };
  jest.spyOn(Storage.prototype, "getItem").mockImplementation(denied);
  jest.spyOn(Storage.prototype, "setItem").mockImplementation(denied);
};

describe("CookieBanner", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => jest.restoreAllMocks());

  it("asks on a first visit", () => {
    renderWithTheme(<CookieBanner />);
    expect(
      screen.getByRole("dialog", { name: "This site uses cookies" }),
    ).toBeInTheDocument();
  });

  it("stays away once a choice is stored", () => {
    localStorage.setItem(CONSENT_KEY, "rejected");
    renderWithTheme(<CookieBanner />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("stores the choice and announces accepted analytics", async () => {
    const user = userEvent.setup();
    const onAccepted = jest.fn();
    window.addEventListener("cookie-consent-accepted", onAccepted);
    renderWithTheme(<CookieBanner />);

    await user.click(screen.getByRole("button", { name: "Accept all" }));

    expect(localStorage.getItem(CONSENT_KEY)).toBe("accepted");
    expect(onAccepted).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    window.removeEventListener("cookie-consent-accepted", onAccepted);
  });

  it("does not announce analytics when non-essential cookies are rejected", async () => {
    const user = userEvent.setup();
    const onAccepted = jest.fn();
    window.addEventListener("cookie-consent-accepted", onAccepted);
    renderWithTheme(<CookieBanner />);

    await user.click(
      screen.getByRole("button", { name: "Reject non-essential" }),
    );

    expect(localStorage.getItem(CONSENT_KEY)).toBe("rejected");
    expect(onAccepted).not.toHaveBeenCalled();
    window.removeEventListener("cookie-consent-accepted", onAccepted);
  });

  describe("when localStorage is unavailable", () => {
    it("still renders the banner instead of crashing on the read", () => {
      blockStorage();
      expect(() => renderWithTheme(<CookieBanner />)).not.toThrow();
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("still lets the visitor answer, even though the choice cannot be saved", async () => {
      blockStorage();
      const user = userEvent.setup();
      const onAccepted = jest.fn();
      window.addEventListener("cookie-consent-accepted", onAccepted);
      renderWithTheme(<CookieBanner />);

      await user.click(screen.getByRole("button", { name: "Accept all" }));

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(onAccepted).toHaveBeenCalledTimes(1);
      window.removeEventListener("cookie-consent-accepted", onAccepted);
    });
  });

  describe("accessibility", () => {
    it("is a labelled, non-modal dialog", () => {
      renderWithTheme(<CookieBanner />);
      const dialog = screen.getByRole("dialog");
      expect(dialog).not.toHaveAttribute("aria-modal", "true");
      expect(dialog).toHaveAccessibleName("This site uses cookies");
      expect(dialog).toHaveAccessibleDescription(/Essential cookies/);
    });

    it("is marked for the feedback nudges to recognise", () => {
      renderWithTheme(<CookieBanner />);
      expect(document.querySelector("[data-cookie-banner]")).toBe(
        screen.getByRole("dialog"),
      );
    });
  });
});
