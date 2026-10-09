import { fireEvent, screen } from "@testing-library/react";

import { useI18n } from "@lib/utils/i18n";
import {
  blockBrowserStorage,
  captureUncaughtErrors,
} from "@test-utils/blockBrowserStorage";
import { renderWithTheme } from "@test-utils/renderWithTheme";

import ForestTeaser from "../index";

const t = useI18n("en");
const ctaName = new RegExp(t.forestInlineCta, "i");

describe("ForestTeaser", () => {
  afterEach(() => jest.restoreAllMocks());

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

  it("still engages and scrolls to the Forest when sessionStorage is unavailable", () => {
    blockBrowserStorage("session");
    const { errors, stop } = captureUncaughtErrors();
    const forest = document.createElement("section");
    forest.id = "forest";
    forest.scrollIntoView = jest.fn();
    document.body.appendChild(forest);
    const onEngaged = jest.fn();
    window.addEventListener("forest-inline-teaser-engaged", onEngaged);
    renderWithTheme(<ForestTeaser feedbackTrees={4} totalTrees={34} />);

    fireEvent.click(
      screen.getByRole("button", { name: ctaName, hidden: true }),
    );

    // The page-level signal and the scroll still happen; only the remembered
    // flag is lost.
    expect(onEngaged).toHaveBeenCalledTimes(1);
    expect(forest.scrollIntoView).toHaveBeenCalled();
    stop();
    expect(errors).toHaveLength(0);
    window.removeEventListener("forest-inline-teaser-engaged", onEngaged);
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
