import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderWithTheme } from "@test-utils/renderWithTheme";

import StorySegmentedControl from "../StorySegmentedControl";

describe("StorySegmentedControl", () => {
  beforeEach(() => {
    window.history.replaceState(
      { mobileView: "story", storySub: "journey" },
      "",
      "/",
    );
    window.scrollTo = jest.fn();
  });

  it("keeps both rendered controls synchronized when the story view changes", async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <>
        <StorySegmentedControl />
        <StorySegmentedControl />
      </>,
    );

    await user.click(
      screen.getAllByRole("tab", { name: "Experience", hidden: true })[0],
    );

    expect(window.location.hash).toBe("");
    expect(window.history.state).toEqual(
      expect.objectContaining({ mobileView: "story", storySub: "experience" }),
    );
    screen
      .getAllByRole("tab", { name: "Experience", hidden: true })
      .forEach((tab) => {
        expect(tab).toHaveAttribute("aria-selected", "true");
      });
    screen
      .getAllByRole("tab", { name: "Journey", hidden: true })
      .forEach((tab) => {
        expect(tab).toHaveAttribute("aria-selected", "false");
      });
  });
});
