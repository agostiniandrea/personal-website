import { fireEvent, screen } from "@testing-library/react";

import { renderWithTheme } from "@test-utils/renderWithTheme";

import ForestTeaser from "../index";

describe("ForestTeaser", () => {
  it("renders localized, data-driven inline Forest copy", () => {
    renderWithTheme(<ForestTeaser feedbackTrees={4} totalTrees={34} />);
    expect(
      screen.getByRole("heading", {
        name: "Thoughtful feedback grows into real trees.",
        hidden: true,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/4 trees planted.*34 trees/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /explore the forest/i, hidden: true }),
    ).toBeInTheDocument();
  });

  it("scrolls to Forest without adding a URL hash", async () => {
    const forest = document.createElement("section");
    forest.id = "forest";
    forest.scrollIntoView = jest.fn();
    document.body.appendChild(forest);
    renderWithTheme(<ForestTeaser feedbackTrees={4} totalTrees={34} />);

    fireEvent.click(
      screen.getByRole("button", { name: /explore the forest/i, hidden: true }),
    );

    expect(forest.scrollIntoView).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "start",
    });
    expect(window.location.hash).toBe("");
    forest.remove();
  });

  it("is an inline region without a dismiss control", () => {
    renderWithTheme(<ForestTeaser />);
    expect(screen.getByTestId("forest-teaser")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /dismiss/i })).not.toBeInTheDocument();
  });
});
