import { screen } from "@testing-library/react";

import { renderWithTheme } from "@test-utils/renderWithTheme";

import Journey, { formatJourneyDate } from "../index";
import { journeyData } from "../model";

describe("Journey", () => {
  it("renders correctly with default data", () => {
    const { container } = renderWithTheme(<Journey />);
    expect(container).toMatchSnapshot();
  });

  it("renders the section label", () => {
    renderWithTheme(<Journey />);
    expect(screen.getByText(journeyData.sectionLabel!)).toBeInTheDocument();
  });

  it("renders the heading", () => {
    renderWithTheme(<Journey />);
    expect(
      screen.getByRole("heading", { name: journeyData.heading }),
    ).toBeInTheDocument();
  });

  it("renders the intro", () => {
    renderWithTheme(<Journey />);
    expect(screen.getByText(journeyData.intro!)).toBeInTheDocument();
  });

  it("renders all city names", () => {
    renderWithTheme(<Journey />);
    journeyData.chapters?.forEach(({ city }) => {
      expect(screen.getByText(city)).toBeInTheDocument();
    });
  });

  it("renders the timeline landmark", () => {
    renderWithTheme(<Journey />);
    expect(
      screen.getByRole("list", { name: "Life journey timeline" }),
    ).toBeInTheDocument();
  });

  it("renders only location periods and localizes the open ending", () => {
    const ongoing = journeyData.chapters![0];
    expect(formatJourneyDate(ongoing, "Now")).toBe("2025 – Now");
    expect(formatJourneyDate(ongoing, "Oggi")).toBe("2025 – Oggi");
    journeyData.chapters?.forEach((chapter) => {
      expect(formatJourneyDate(chapter, "Now")).not.toMatch(/y\.o\.|anni|\?/);
    });
  });
});
