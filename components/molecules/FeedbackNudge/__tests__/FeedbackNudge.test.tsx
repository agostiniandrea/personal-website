import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderWithTheme } from "@test-utils/renderWithTheme";

import FeedbackNudge from "../index";

describe("FeedbackNudge", () => {
  beforeEach(() => sessionStorage.clear());

  it("renders as the dismissible desktop feedback prompt", () => {
    renderWithTheme(<FeedbackNudge />);
    expect(
      screen.getByRole("complementary", { name: "Ideas that grow into trees." }),
    ).toBeInTheDocument();
  });

  it("announces its visibility and can be dismissed", async () => {
    const user = userEvent.setup();
    renderWithTheme(<FeedbackNudge />);
    expect(document.body.dataset.feedbackNudgeVisible).toBe("true");

    await user.click(
      screen.getByRole("button", { name: "Dismiss feedback prompt" }),
    );

    expect(screen.queryByTestId("feedback-nudge")).not.toBeInTheDocument();
    expect(document.body.dataset.feedbackNudgeVisible).toBe("false");
  });

  it("stays hidden for the session after the inline teaser is used", () => {
    renderWithTheme(<FeedbackNudge />);
    act(() => {
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
