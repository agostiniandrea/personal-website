import { screen } from "@testing-library/react";
import { renderWithTheme } from "@test-utils/renderWithTheme";
import Contact from "../index";
import { defaultContact, minimalContact } from "../model";

describe("Contact", () => {
  it("renders correctly with all links", () => {
    const { container } = renderWithTheme(<Contact {...defaultContact} />);
    expect(container).toMatchSnapshot();
  });

  it("renders correctly with a single link", () => {
    const { container } = renderWithTheme(<Contact {...minimalContact} />);
    expect(container).toMatchSnapshot();
  });

  it("renders the section label", () => {
    renderWithTheme(<Contact {...defaultContact} />);
    expect(screen.getByText(defaultContact.sectionLabel)).toBeInTheDocument();
  });

  it("renders the heading", () => {
    renderWithTheme(<Contact {...defaultContact} />);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      defaultContact.heading,
    );
  });

  it("renders the body text", () => {
    renderWithTheme(<Contact {...defaultContact} />);
    expect(screen.getByText(defaultContact.body)).toBeInTheDocument();
  });

  it("renders all contact links", () => {
    renderWithTheme(<Contact {...defaultContact} />);
    defaultContact.links.forEach(({ label, url }) => {
      const link = screen.getByRole("link", { name: label });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", url);
    });
  });

  it("sets target=_blank on external links", () => {
    renderWithTheme(<Contact {...defaultContact} />);
    const externalLinks = defaultContact.links.filter(
      ({ url }) => !url.startsWith("#") && !url.startsWith("/"),
    );
    externalLinks.forEach(({ label }) => {
      expect(screen.getByRole("link", { name: label })).toHaveAttribute(
        "target",
        "_blank",
      );
    });
  });
});
