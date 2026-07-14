import { screen } from "@testing-library/react";

import { renderWithTheme } from "@test-utils/renderWithTheme";

import Skills from "../index";
import { defaultSkills, minimalSkills } from "../model";

describe("Skills", () => {
  it("renders correctly with all categories", () => {
    const { container } = renderWithTheme(<Skills {...defaultSkills} />);
    expect(container).toMatchSnapshot();
  });

  it("renders correctly with a single category", () => {
    const { container } = renderWithTheme(<Skills {...minimalSkills} />);
    expect(container).toMatchSnapshot();
  });

  it("renders the section label", () => {
    renderWithTheme(<Skills {...defaultSkills} />);
    expect(screen.getByText(defaultSkills.sectionLabel)).toBeInTheDocument();
  });

  it("renders the heading", () => {
    renderWithTheme(<Skills {...defaultSkills} />);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      defaultSkills.heading,
    );
  });

  it("renders all category titles", () => {
    renderWithTheme(<Skills {...defaultSkills} />);
    defaultSkills.categories.forEach(({ title }) => {
      expect(screen.getByText(title)).toBeInTheDocument();
    });
  });

  it("renders skill items within each category", () => {
    renderWithTheme(<Skills {...defaultSkills} />);
    const firstCategory = defaultSkills.categories[0];
    firstCategory.skills.forEach((skill) => {
      expect(screen.getByText(skill)).toBeInTheDocument();
    });
  });
});
