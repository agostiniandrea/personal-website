import { fireEvent, screen } from "@testing-library/react";

import { useI18n } from "@lib/utils/i18n";
import { renderWithTheme } from "@test-utils/renderWithTheme";

import ForestTeaser from "../index";

const t = useI18n("en");
const ctaName = new RegExp(t.forestInlineCta, "i");

describe("ForestTeaser", () => {
  it("renders localized, data-driven inline Forest copy", () => {
    renderWithTheme(<ForestTeaser feedbackTrees={4} totalTrees={34} />);
    expect(
      screen.getByRole("heading", {
        name: t.forestInlineHeading,
        hidden: true,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(t.forestInlineMetric(4, 34), { exact: false }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: ctaName, hidden: true }),
    ).toBeInTheDocument();
  });

  it("engages the session and scrolls to the Forest section on click", async () => {
    const forest = document.createElement("section");
    forest.id = "forest";
    forest.scrollIntoView = jest.fn();
    document.body.appendChild(forest);
    renderWithTheme(<ForestTeaser feedbackTrees={4} totalTrees={34} />);

    fireEvent.click(
      screen.getByRole("button", { name: ctaName, hidden: true }),
    );

    expect(sessionStorage.getItem("forest-inline-teaser-engaged")).toBe("true");
    // reduced-motion in tests -> instant scroll
    expect(forest.scrollIntoView).toHaveBeenCalledWith({
      behavior: "auto",
      block: "start",
    });
    forest.remove();
  });

  it("is an inline region without a dismiss control", () => {
    renderWithTheme(<ForestTeaser />);
    expect(screen.getByTestId("forest-teaser")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /dismiss/i }),
    ).not.toBeInTheDocument();
  });
});
