import { screen } from "@testing-library/react";

import { renderWithTheme } from "@test-utils/renderWithTheme";

import BeyondCode from "../index";
import {
  defaultBeyondCode,
  noIntrosBeyondCode,
  noTagsBeyondCode,
} from "../model";

describe("BeyondCode", () => {
  it("renders correctly with all props", () => {
    const { container } = renderWithTheme(
      <BeyondCode {...defaultBeyondCode} />,
    );
    expect(container).toMatchSnapshot();
  });

  it("renders correctly without intro", () => {
    const { container } = renderWithTheme(
      <BeyondCode {...noIntrosBeyondCode} />,
    );
    expect(container).toMatchSnapshot();
  });

  it("renders correctly without tags", () => {
    const { container } = renderWithTheme(<BeyondCode {...noTagsBeyondCode} />);
    expect(container).toMatchSnapshot();
  });

  it("renders the section label", () => {
    renderWithTheme(<BeyondCode {...defaultBeyondCode} />);
    expect(
      screen.getByText(defaultBeyondCode.sectionLabel),
    ).toBeInTheDocument();
  });

  it("renders the heading", () => {
    renderWithTheme(<BeyondCode {...defaultBeyondCode} />);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      defaultBeyondCode.heading,
    );
  });

  it("renders the intro when provided", () => {
    renderWithTheme(<BeyondCode {...defaultBeyondCode} />);
    expect(screen.getByText(defaultBeyondCode.intro!)).toBeInTheDocument();
  });

  it("does not render intro when absent", () => {
    renderWithTheme(<BeyondCode {...noIntrosBeyondCode} />);
    expect(
      screen.queryByText(defaultBeyondCode.intro!),
    ).not.toBeInTheDocument();
  });

  it("renders all category headings", () => {
    renderWithTheme(<BeyondCode {...defaultBeyondCode} />);
    defaultBeyondCode.items.forEach(({ category }) => {
      expect(
        screen.getByRole("heading", { name: category }),
      ).toBeInTheDocument();
    });
  });

  it("renders all descriptions", () => {
    renderWithTheme(<BeyondCode {...defaultBeyondCode} />);
    defaultBeyondCode.items.forEach(({ description }) => {
      expect(screen.getByText(description)).toBeInTheDocument();
    });
  });

  it("renders tags when provided", () => {
    renderWithTheme(<BeyondCode {...defaultBeyondCode} />);
    const firstItem = defaultBeyondCode.items[0];
    firstItem.tags?.forEach((tag) => {
      expect(screen.getAllByText(tag).length).toBeGreaterThan(0);
    });
  });

  it("does not render tags section when absent", () => {
    renderWithTheme(<BeyondCode {...noTagsBeyondCode} />);
    expect(screen.queryByText("Bologna FC")).not.toBeInTheDocument();
  });
});
