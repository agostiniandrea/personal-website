import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { useI18n } from "@lib/utils/i18n";
import { renderWithTheme } from "@test-utils/renderWithTheme";

import FeedbackNudge from "../index";

const t = useI18n("en");

describe("FeedbackNudge", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("renders as the dismissible desktop feedback prompt", () => {
    renderWithTheme(<FeedbackNudge />);
    expect(
      screen.getByRole("complementary", {
        name: t.feedbackNudgeTitle,
      }),
    ).toBeInTheDocument();
  });

  it("announces its visibility and can be dismissed", async () => {
    const user = userEvent.setup();
    renderWithTheme(<FeedbackNudge />);

    await waitFor(() => {
      expect(document.body.dataset.feedbackNudgeVisible).toBe("true");
    });

    await user.click(
      screen.getByRole("button", { name: t.feedbackNudgeDismiss }),
    );

    await waitFor(() => {
      expect(screen.queryByTestId("feedback-nudge")).not.toBeInTheDocument();
      expect(document.body.dataset.feedbackNudgeVisible).toBe("false");
      expect(sessionStorage.getItem("forest-desktop-nudge-dismissed")).toBe(
        "true",
      );
    });
  });

  it("stays hidden for the session after the inline teaser is used", async () => {
    renderWithTheme(<FeedbackNudge />);
    await act(async () => {
      window.dispatchEvent(new Event("forest-inline-teaser-engaged"));
    });
    expect(screen.queryByTestId("feedback-nudge")).not.toBeInTheDocument();
  });

  it("starts hidden when the inline teaser was used earlier in the session", () => {
    sessionStorage.setItem("forest-inline-teaser-engaged", "true");
    renderWithTheme(<FeedbackNudge />);
    expect(screen.queryByTestId("feedback-nudge")).not.toBeInTheDocument();
  });
});
