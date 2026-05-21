import { screen } from "@testing-library/react";
import { renderWithTheme } from "@test-utils/renderWithTheme";
import Sustainability from "../index";
import {
  defaultSustainability,
  minimalSustainability,
  noCarbonBadgeSustainability,
} from "../model";

jest.mock("@components/molecules/CarbonBadge", () => ({
  __esModule: true,
  default: () => <div data-testid="carbon-badge" />,
}));

describe("Sustainability", () => {
  it("renders correctly with all props", () => {
    const { container } = renderWithTheme(
      <Sustainability {...defaultSustainability} />,
    );
    expect(container).toMatchSnapshot();
  });

  it("renders correctly with minimal props", () => {
    const { container } = renderWithTheme(
      <Sustainability {...minimalSustainability} />,
    );
    expect(container).toMatchSnapshot();
  });

  it("renders the section label", () => {
    renderWithTheme(<Sustainability {...defaultSustainability} />);
    expect(
      screen.getByText(defaultSustainability.sectionLabel),
    ).toBeInTheDocument();
  });

  it("renders the heading", () => {
    renderWithTheme(<Sustainability {...defaultSustainability} />);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      defaultSustainability.heading,
    );
  });

  it("renders the intro text", () => {
    renderWithTheme(<Sustainability {...defaultSustainability} />);
    expect(screen.getByText(defaultSustainability.intro)).toBeInTheDocument();
  });

  it("renders values heading when provided", () => {
    renderWithTheme(<Sustainability {...defaultSustainability} />);
    expect(
      screen.getByText(defaultSustainability.valuesHeading!),
    ).toBeInTheDocument();
  });

  it("renders all value badges", () => {
    renderWithTheme(<Sustainability {...defaultSustainability} />);
    defaultSustainability.values.forEach((value) => {
      expect(screen.getAllByText(value).length).toBeGreaterThan(0);
    });
  });

  it("renders volunteering heading when provided", () => {
    renderWithTheme(<Sustainability {...defaultSustainability} />);
    expect(
      screen.getByText(defaultSustainability.volunteeringHeading!),
    ).toBeInTheDocument();
  });

  it("renders all volunteering organizations", () => {
    renderWithTheme(<Sustainability {...defaultSustainability} />);
    defaultSustainability.volunteeringItems.forEach(({ organization }) => {
      expect(screen.getByText(organization)).toBeInTheDocument();
    });
  });

  it("renders all volunteering periods", () => {
    renderWithTheme(<Sustainability {...defaultSustainability} />);
    defaultSustainability.volunteeringItems.forEach(({ period }) => {
      expect(screen.getAllByText(period).length).toBeGreaterThan(0);
    });
  });

  it("renders cause badges when provided", () => {
    renderWithTheme(<Sustainability {...defaultSustainability} />);
    const itemsWithCause = defaultSustainability.volunteeringItems.filter(
      (item) => item.cause,
    );
    itemsWithCause.forEach(({ cause }) => {
      expect(screen.getAllByText(cause!).length).toBeGreaterThan(0);
    });
  });

  it("renders the carbon badge when showCarbonBadge is true", () => {
    renderWithTheme(<Sustainability {...defaultSustainability} />);
    expect(screen.getByTestId("carbon-badge")).toBeInTheDocument();
  });

  it("renders the carbon badge label when provided", () => {
    renderWithTheme(<Sustainability {...defaultSustainability} />);
    expect(
      screen.getByText(defaultSustainability.carbonBadgeLabel!),
    ).toBeInTheDocument();
  });

  it("does not render the carbon badge when showCarbonBadge is false", () => {
    renderWithTheme(<Sustainability {...noCarbonBadgeSustainability} />);
    expect(screen.queryByTestId("carbon-badge")).not.toBeInTheDocument();
  });

  it("does not render optional headings when absent", () => {
    renderWithTheme(<Sustainability {...minimalSustainability} />);
    expect(screen.queryByText("What I care about")).not.toBeInTheDocument();
    expect(screen.queryByText("Where I've shown up")).not.toBeInTheDocument();
  });
});
