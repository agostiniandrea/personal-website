import { useRouter } from "next/router";

import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderWithTheme } from "@test-utils/renderWithTheme";

import Forest from "../index";
import {
  defaultForest,
  fullStatForest,
  minimalForest,
  oneStatForest,
  twoStatForest,
} from "../model";

jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

const mockUseRouter = useRouter as jest.Mock;

describe("Forest", () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({ locale: "en" });
  });

  it("renders correctly with all props", () => {
    const { container } = renderWithTheme(<Forest {...defaultForest} />);
    expect(container).toMatchSnapshot();
  });

  it("renders correctly with minimal props", () => {
    const { container } = renderWithTheme(<Forest {...minimalForest} />);
    expect(container).toMatchSnapshot();
  });

  it("renders the section heading", () => {
    renderWithTheme(<Forest {...defaultForest} />);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      defaultForest.heading!,
    );
  });

  it("renders the CTA heading", () => {
    renderWithTheme(<Forest {...defaultForest} />);
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
      defaultForest.ctaHeading!,
    );
  });

  it("renders the plant button", () => {
    renderWithTheme(<Forest {...defaultForest} />);
    expect(
      screen.getByRole("button", { name: defaultForest.ctaButtonLabel }),
    ).toBeInTheDocument();
  });

  it("renders the season progress label", () => {
    renderWithTheme(<Forest {...defaultForest} />);
    expect(screen.getByText(defaultForest.seasonName!)).toBeInTheDocument();
  });

  it("renders the Tree-Nation link", () => {
    renderWithTheme(<Forest {...defaultForest} />);
    expect(
      screen.getByRole("link", { name: /View the living forest/i }),
    ).toHaveAttribute(
      "href",
      "https://tree-nation.com/profile/andrea-agostini-103769",
    );
  });

  it("renders the season project panel with species and project link", () => {
    renderWithTheme(<Forest {...defaultForest} />);
    const panel = screen.getByTestId("season-project");
    expect(panel).toHaveTextContent(defaultForest.seasonProjectName!);
    expect(panel).toHaveTextContent(
      "4 trees · 2 species · 1.5 t CO2 lifetime estimate",
    );
    defaultForest.seasonProjectSpecies!.forEach((species) => {
      expect(screen.getByText(species)).toBeInTheDocument();
    });
    expect(screen.getByRole("link", { name: /View project/i })).toHaveAttribute(
      "href",
      defaultForest.seasonProjectUrl,
    );
  });

  it("hides the season project panel when no project name is provided", () => {
    renderWithTheme(<Forest {...minimalForest} />);
    expect(screen.queryByTestId("season-project")).not.toBeInTheDocument();
  });

  describe("CO₂ metric with clarification tooltip", () => {
    it("renders the structured metric line with a subscripted 2", () => {
      renderWithTheme(<Forest {...defaultForest} />);
      const stats = screen.getByTestId("project-stats");
      expect(stats).toHaveTextContent(
        "4 trees · 2 species · 1.5 t CO2 lifetime estimate",
      );
      const sub = stats.querySelector("sub");
      expect(sub).not.toBeNull();
      expect(sub).toHaveTextContent("2");
    });

    it("falls back to the legacy stats string without structured values", () => {
      renderWithTheme(
        <Forest
          {...defaultForest}
          seasonProjectTreesCount={undefined}
          seasonProjectCo2Kg={undefined}
        />,
      );
      expect(screen.getByTestId("project-stats")).toHaveTextContent(
        defaultForest.seasonProjectStats!,
      );
      expect(
        screen.queryByRole("button", { name: /CO₂ estimate/i }),
      ).not.toBeInTheDocument();
    });

    it("opens the tooltip with the exact copy and wires aria-describedby", async () => {
      const user = userEvent.setup();
      renderWithTheme(<Forest {...defaultForest} />);
      const trigger = screen.getByRole("button", {
        name: "About the CO₂ estimate",
      });
      await user.click(trigger);
      const tooltip = screen.getByRole("tooltip");
      expect(tooltip).toHaveTextContent(
        "Estimated CO₂ capture over the trees’ expected lifetime, based on Tree-Nation data.",
      );
      expect(trigger).toHaveAttribute("aria-describedby", tooltip.id);
      await user.keyboard("{Escape}");
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    });

    it("renders the exact localized Italian label and copy", async () => {
      const user = userEvent.setup();
      mockUseRouter.mockReturnValue({ locale: "it" });
      renderWithTheme(<Forest {...defaultForest} treesLabel="alberi" />);

      const trigger = screen.getByRole("button", {
        name: "Informazioni sulla stima della CO₂",
      });
      expect(screen.getByTestId("project-stats")).toHaveTextContent(
        "4 alberi · 2 specie · 1,5 t CO2 stima sul ciclo di vita",
      );
      await user.click(trigger);

      expect(screen.getByRole("tooltip")).toHaveTextContent(
        "Stima della CO₂ assorbita durante il ciclo di vita previsto degli alberi, basata sui dati di Tree-Nation.",
      );
    });
  });

  it("opens the modal when Plant button is clicked", async () => {
    const user = userEvent.setup();
    renderWithTheme(<Forest {...defaultForest} />);
    const btn = screen.getByRole("button", {
      name: defaultForest.ctaButtonLabel,
    });
    await user.click(btn);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("closes the modal when ✕ is clicked", async () => {
    const user = userEvent.setup();
    renderWithTheme(<Forest {...defaultForest} />);
    await user.click(
      screen.getByRole("button", { name: defaultForest.ctaButtonLabel }),
    );
    const closeBtn = screen.getByRole("button", { name: "Close" });
    await user.click(closeBtn);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  describe("stats section visibility", () => {
    const getStatItems = (container: HTMLElement) =>
      container.querySelectorAll("[data-testid='stat-item']");

    it("hides stats when no stats are positive", () => {
      const { container } = renderWithTheme(
        <Forest
          {...defaultForest}
          feedbackCount={0}
          treesDedicatedCount={0}
          improvementsCount={0}
        />,
      );
      expect(getStatItems(container).length).toBe(0);
    });

    it("hides stats when only one stat is positive", () => {
      const { container } = renderWithTheme(<Forest {...oneStatForest} />);
      expect(getStatItems(container).length).toBe(0);
    });

    it("shows stats when two stats are positive", () => {
      const { container } = renderWithTheme(<Forest {...twoStatForest} />);
      expect(getStatItems(container).length).toBe(2);
    });

    it("shows all three stats when all are positive", () => {
      const { container } = renderWithTheme(<Forest {...fullStatForest} />);
      expect(getStatItems(container).length).toBe(3);
    });

    it("renders the real stat values on first render, before any intersection", () => {
      const { container } = renderWithTheme(<Forest {...fullStatForest} />);
      const numbers = Array.from(getStatItems(container)).map(
        (item) => item.firstElementChild?.textContent,
      );
      expect(numbers).toEqual([
        String(fullStatForest.feedbackCount),
        String(fullStatForest.rewardedFeedbackCount),
        String(fullStatForest.treesDedicatedCount),
      ]);
    });
  });
});
