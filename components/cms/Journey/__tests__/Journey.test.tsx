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

  it("uses Now/Oggi for the open-ended Journey period", () => {
    const ongoing = journeyData.chapters![0];
    expect(formatJourneyDate(ongoing, "en")).toBe("33 y.o. · 2025 – Now");
    expect(formatJourneyDate(ongoing, "it")).toBe("33 anni · 2025 – Oggi");
    expect(formatJourneyDate(ongoing, "en")).not.toContain("?");
  });
});
