import { screen } from "@testing-library/react";
import { renderWithTheme } from "@test-utils/renderWithTheme";
import Experience from "../index";
import { defaultExperience, minimalExperience } from "../model";

describe("Experience", () => {
  it("renders correctly with all items", () => {
    const { container } = renderWithTheme(<Experience {...defaultExperience} />);
    expect(container).toMatchSnapshot();
  });

  it("renders correctly with a single item and no tags", () => {
    const { container } = renderWithTheme(<Experience {...minimalExperience} />);
    expect(container).toMatchSnapshot();
  });

  it("renders the section label", () => {
    renderWithTheme(<Experience {...defaultExperience} />);
    expect(screen.getByText(defaultExperience.sectionLabel)).toBeInTheDocument();
  });

  it("renders the heading", () => {
    renderWithTheme(<Experience {...defaultExperience} />);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      defaultExperience.heading,
    );
  });

  it("renders all roles as headings", () => {
    renderWithTheme(<Experience {...defaultExperience} />);
    defaultExperience.items.forEach(({ role }) => {
      expect(screen.getAllByText(role).length).toBeGreaterThan(0);
    });
  });

  it("renders all company names", () => {
    renderWithTheme(<Experience {...defaultExperience} />);
    defaultExperience.items.forEach(({ company }) => {
      expect(screen.getByText(company)).toBeInTheDocument();
    });
  });

  it("renders all periods", () => {
    renderWithTheme(<Experience {...defaultExperience} />);
    defaultExperience.items.forEach(({ period }) => {
      expect(screen.getByText(period)).toBeInTheDocument();
    });
  });

  it("renders tags when provided", () => {
    renderWithTheme(<Experience {...defaultExperience} />);
    const firstItem = defaultExperience.items[0];
    firstItem.tags?.forEach((tag) => {
      expect(screen.getAllByText(tag).length).toBeGreaterThan(0);
    });
  });

  it("does not render tags when absent", () => {
    renderWithTheme(<Experience {...minimalExperience} />);
    expect(screen.queryByText("Next.js")).not.toBeInTheDocument();
  });
});
