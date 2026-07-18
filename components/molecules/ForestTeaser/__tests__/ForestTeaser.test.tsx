import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderWithTheme } from "@test-utils/renderWithTheme";

import ForestTeaser from "../index";

describe("ForestTeaser", () => {
  it("renders the desktop Forest preview copy", () => {
    renderWithTheme(<ForestTeaser />);
    expect(
      screen.getByRole("complementary", {
        name: "Ideas that grow into trees.",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /see how it grows/i }),
    ).toBeInTheDocument();
  });

  it("scrolls to Forest without adding a URL hash", async () => {
    const user = userEvent.setup();
    const forest = document.createElement("section");
    forest.id = "forest";
    forest.scrollIntoView = jest.fn();
    document.body.appendChild(forest);
    renderWithTheme(<ForestTeaser />);

    await user.click(
      screen.getByRole("button", { name: /see how it grows/i }),
    );

    expect(forest.scrollIntoView).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "start",
    });
    expect(window.location.hash).toBe("");
    forest.remove();
  });

  it("can be dismissed", async () => {
    const user = userEvent.setup();
    renderWithTheme(<ForestTeaser />);
    await user.click(
      screen.getByRole("button", { name: "Dismiss Forest preview" }),
    );
    expect(
      screen.queryByRole("complementary", {
        name: "Ideas that grow into trees.",
      }),
    ).not.toBeInTheDocument();
  });
});
