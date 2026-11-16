import { screen } from "@testing-library/react";

import { renderWithTheme } from "@test-utils/renderWithTheme";

import Section from "../index";

describe("Section", () => {
  it("renders its heading as an h2 by default", () => {
    renderWithTheme(
      <Section eyebrow="Projects" heading="Selected work">
        <p>content</p>
      </Section>,
    );

    expect(
      screen.getByRole("heading", { level: 2, name: "Selected work" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Projects")).toBeInTheDocument();
  });

  it("lets a single-section page make its heading the h1", () => {
    renderWithTheme(
      <Section eyebrow="Privacy" heading="Privacy policy" headingAs="h1">
        <p>content</p>
      </Section>,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "Privacy policy" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 2 })).not.toBeInTheDocument();
  });
});
