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
      screen.getByRole("link", { name: ctaName, hidden: true }),
    ).toBeInTheDocument();
  });

  it("scrolls directly to the Forest impact and action area", async () => {
    const forestImpact = document.createElement("div");
    forestImpact.id = "forest-impact";
    forestImpact.scrollIntoView = jest.fn();
    document.body.appendChild(forestImpact);
    renderWithTheme(<ForestTeaser feedbackTrees={4} totalTrees={34} />);

    fireEvent.click(screen.getByRole("link", { name: ctaName, hidden: true }));

    expect(sessionStorage.getItem("forest-inline-teaser-engaged")).toBe("true");
    expect(forestImpact.scrollIntoView).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "start",
    });
    expect(
      screen.getByRole("link", { name: ctaName, hidden: true }),
    ).toHaveAttribute("href", "/#forest-impact");
    forestImpact.remove();
  });

  it("is an inline region without a dismiss control", () => {
    renderWithTheme(<ForestTeaser />);
    expect(screen.getByTestId("forest-teaser")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /dismiss/i }),
    ).not.toBeInTheDocument();
  });
});
