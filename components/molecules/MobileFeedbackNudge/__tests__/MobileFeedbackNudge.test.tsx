import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  blockBrowserStorage,
  captureUncaughtErrors,
} from "@test-utils/blockBrowserStorage";
import { renderWithTheme } from "@test-utils/renderWithTheme";

import MobileFeedbackNudge from "../index";

const prepareEligibleSession = () => {
  sessionStorage.setItem(
    "forest-feedback-nudge-started-at",
    String(Date.now() - 36_000),
  );
  sessionStorage.setItem(
    "forest-feedback-nudge-visited",
    JSON.stringify(["home", "work"]),
  );
};

describe("MobileFeedbackNudge", () => {
  afterEach(() => jest.restoreAllMocks());

  beforeEach(() => {
    sessionStorage.clear();
    localStorage.removeItem("forest-feedback-nudge-dismissed");
    localStorage.removeItem("forest-feedback-submitted");
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 390,
    });
  });

  it("appears only for an eligible session and navigates to Forest", async () => {
    prepareEligibleSession();
    const onNavigateToForest = jest.fn();
    renderWithTheme(
      <MobileFeedbackNudge
        blocked={false}
        currentView="work"
        onNavigateToForest={onNavigateToForest}
      />,
    );

    expect(
      await screen.findByText("Your feedback can grow two real trees."),
    ).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("button", { name: /see how it grows/i }),
    );
    expect(onNavigateToForest).toHaveBeenCalledTimes(1);
  });

  it("stays hidden in Forest and while another surface is open", async () => {
    prepareEligibleSession();
    const { rerender } = renderWithTheme(
      <MobileFeedbackNudge
        blocked
        currentView="work"
        onNavigateToForest={jest.fn()}
      />,
    );
    await act(async () => {});
    expect(
      screen.queryByTestId("mobile-feedback-nudge"),
    ).not.toBeInTheDocument();

    rerender(
      <MobileFeedbackNudge
        blocked={false}
        currentView="forest"
        onNavigateToForest={jest.fn()}
      />,
    );
    expect(
      screen.queryByTestId("mobile-feedback-nudge"),
    ).not.toBeInTheDocument();
  });

  it("stays out of the way of the cookie banner, which is not modal", async () => {
    prepareEligibleSession();
    const banner = document.createElement("div");
    banner.setAttribute("role", "dialog");
    banner.setAttribute("data-cookie-banner", "true");
    document.body.appendChild(banner);

    renderWithTheme(
      <MobileFeedbackNudge
        blocked={false}
        currentView="work"
        onNavigateToForest={jest.fn()}
      />,
    );
    await act(async () => {});

    expect(
      screen.queryByTestId("mobile-feedback-nudge"),
    ).not.toBeInTheDocument();
    banner.remove();
  });

  describe("when browser storage is unavailable", () => {
    it("renders without throwing", () => {
      blockBrowserStorage();
      const { errors, stop } = captureUncaughtErrors();
      expect(() =>
        renderWithTheme(
          <MobileFeedbackNudge
            blocked={false}
            currentView="work"
            onNavigateToForest={jest.fn()}
          />,
        ),
      ).not.toThrow();
      stop();
      expect(errors).toHaveLength(0);
    });

    it("still dismisses with Escape when the dismissal cannot be saved", async () => {
      prepareEligibleSession();
      blockBrowserStorage("local");
      const { errors, stop } = captureUncaughtErrors();
      renderWithTheme(
        <MobileFeedbackNudge
          blocked={false}
          currentView="work"
          onNavigateToForest={jest.fn()}
        />,
      );
      await screen.findByTestId("mobile-feedback-nudge");

      await userEvent.keyboard("{Escape}");

      await waitFor(() =>
        expect(
          screen.queryByTestId("mobile-feedback-nudge"),
        ).not.toBeInTheDocument(),
      );
      stop();
      expect(errors).toHaveLength(0);
    });

    it("still navigates to the Forest when the dismissal cannot be saved", async () => {
      prepareEligibleSession();
      blockBrowserStorage("local");
      const { errors, stop } = captureUncaughtErrors();
      const onNavigateToForest = jest.fn();
      renderWithTheme(
        <MobileFeedbackNudge
          blocked={false}
          currentView="work"
          onNavigateToForest={onNavigateToForest}
        />,
      );
      await screen.findByTestId("mobile-feedback-nudge");

      await userEvent.click(
        screen.getByRole("button", { name: /see how it grows/i }),
      );

      expect(onNavigateToForest).toHaveBeenCalledTimes(1);
      stop();
      expect(errors).toHaveLength(0);
    });
  });

  it("dismisses with Escape and persists the dismissal timestamp", async () => {
    const startedAt = Date.now();
    prepareEligibleSession();
    renderWithTheme(
      <MobileFeedbackNudge
        blocked={false}
        currentView="work"
        onNavigateToForest={jest.fn()}
      />,
    );
    await screen.findByTestId("mobile-feedback-nudge");
    await userEvent.keyboard("{Escape}");
    await waitFor(() =>
      expect(
        screen.queryByTestId("mobile-feedback-nudge"),
      ).not.toBeInTheDocument(),
    );
    // the dismissal is stored as a timestamp, so assert it is actually "now"
    // rather than any truthy number
    const dismissedAt = Number(
      localStorage.getItem("forest-feedback-nudge-dismissed"),
    );
    expect(dismissedAt).toBeGreaterThanOrEqual(startedAt);
    expect(dismissedAt).toBeLessThanOrEqual(Date.now());
  });
});
