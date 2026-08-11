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

  it("renders the forest progress toward the next milestone", () => {
    renderWithTheme(<Forest {...defaultForest} />);
    // treeCount 34 / seasonTarget 50 → 68%
    expect(
      screen.getByText("68% towards next milestone"),
    ).toBeInTheDocument();
  });

  describe("season progress", () => {
    it("counts from the season baseline, not from an empty forest", () => {
      renderWithTheme(
        <Forest
          {...defaultForest}
          treeCount={60}
          seasonBaseline={50}
          seasonTarget={100}
        />,
      );
      // 60 planted overall, 50 of them before this season opened → 10 of 100
      expect(screen.getByText("10 / 100 trees")).toBeInTheDocument();
      expect(screen.getByText("10% towards next milestone")).toBeInTheDocument();
    });

    it("shows the monthly pulse only when trees landed this month", () => {
      const { rerender } = renderWithTheme(<Forest {...defaultForest} />);
      expect(screen.queryByTestId("month-pulse")).not.toBeInTheDocument();

      rerender(<Forest {...defaultForest} monthTreeCount={8} />);
      expect(screen.getByTestId("month-pulse")).toHaveTextContent(
        "+8 this month",
      );
    });

    it("never reports negative progress when the baseline exceeds the count", () => {
      renderWithTheme(
        <Forest
          {...defaultForest}
          treeCount={40}
          seasonBaseline={50}
          seasonTarget={100}
        />,
      );
      expect(screen.getByText("0 / 100 trees")).toBeInTheDocument();
    });
  });

  it("names the forest total only once, in the panel that tracks it", () => {
    renderWithTheme(<Forest {...defaultForest} />);
    // The CTA card shows the number under its own caption; "My forest" belongs
    // to the progress panel, where it pairs with "Community impact". Both on
    // one narrow screen read as a duplicate.
    expect(screen.getAllByText(/my forest/i)).toHaveLength(1);
  });

  describe("species detail", () => {
    const species = [
      {
        label: "Sengon",
        scientific: "Paraserianthes falcataria",
        category: "Fast-growing",
        origin: "Native",
        co2Kg: 400,
      },
    ];

    it("says what a species is instead of only naming it", () => {
      renderWithTheme(<Forest {...defaultForest} forestSpecies={species} />);
      const block = screen.getByTestId("species-detail");
      expect(block).toHaveTextContent("Sengon");
      expect(block).toHaveTextContent("Paraserianthes falcataria");
      expect(block).toHaveTextContent("fast-growing, native");
      expect(block).toHaveTextContent("400 kg CO₂ over its life");
    });

    it("keeps the plain name badges when Tree-Nation told us nothing", () => {
      renderWithTheme(<Forest {...defaultForest} forestSpecies={[]} />);
      expect(screen.queryByTestId("species-detail")).not.toBeInTheDocument();
      // The CMS names still render, so the card never loses its species.
      expect(
        screen.getByText(defaultForest.seasonProjectSpecies![0]),
      ).toBeInTheDocument();
    });

    it("omits the CO₂ figure when Tree-Nation has none", () => {
      renderWithTheme(
        <Forest
          {...defaultForest}
          forestSpecies={[{ ...species[0], co2Kg: 0 }]}
        />,
      );
      expect(screen.getByTestId("species-detail")).not.toHaveTextContent("kg");
    });
  });

  describe("where the forest grows", () => {
    const projects = [
      { id: 568, name: "Plant to Stop Poverty", slug: "pstp", country: "TZ", trees: 22 },
      { id: 450, name: "Bore", slug: "bore", country: "KE", trees: 5 },
    ];

    it("lists each project with its tree count and country name", () => {
      renderWithTheme(<Forest {...defaultForest} forestProjects={projects} />);
      const block = screen.getByTestId("forest-spread");
      expect(block).toHaveTextContent("22");
      expect(block).toHaveTextContent("Plant to Stop Poverty");
      // The API gives ISO codes; the UI resolves them for the active locale.
      expect(block).toHaveTextContent("Tanzania");
      expect(block).toHaveTextContent("Kenya");
    });

    it("does not repeat a country the project name already carries", () => {
      renderWithTheme(
        <Forest
          {...defaultForest}
          forestProjects={[
            {
              id: 692,
              name: "Community Reforestation in Indonesia",
              slug: "cri",
              country: "ID",
              trees: 5,
            },
          ]}
        />,
      );
      const block = screen.getByTestId("forest-spread");
      expect(block).toHaveTextContent("Community Reforestation in Indonesia");
      expect(block.textContent?.match(/Indonesia/g)).toHaveLength(1);
    });

    it("is omitted when Tree-Nation gave us nothing", () => {
      renderWithTheme(<Forest {...defaultForest} forestProjects={[]} />);
      expect(screen.queryByTestId("forest-spread")).not.toBeInTheDocument();
    });

    it("falls back to the raw code for an unknown country", () => {
      renderWithTheme(
        <Forest
          {...defaultForest}
          forestProjects={[
            { id: 101, name: "Somewhere", slug: "s", country: "", trees: 1 },
          ]}
        />,
      );
      expect(screen.getByTestId("forest-spread")).toHaveTextContent("Somewhere");
    });
  });

  it("places the four blocks so each column tells one story", () => {
    renderWithTheme(
      <Forest
        {...defaultForest}
        forestProjects={[
          { id: 450, name: "Bore", slug: "bore", country: "KE", trees: 5 },
        ]}
      />,
    );
    // One 2x2 grid: mine on the left, the community's on the right, and the
    // two lower blocks share a row so their top rules line up.
    expect(screen.getByTestId("forest-spread")).toHaveStyleRule(
      "grid-area",
      "spread",
    );
    // The community wrapper dissolves (display: contents) so its three lines
    // can take grid rows of their own, facing the progress rows opposite.
    expect(screen.getByTestId("community-impact")).toHaveStyleRule(
      "display",
      "contents",
    );
    expect(screen.getByTestId("season-project")).toHaveStyleRule(
      "grid-area",
      "project",
    );
  });

  it("renders the community impact block from real community data", () => {
    renderWithTheme(<Forest {...defaultForest} />);
    const block = screen.getByTestId("community-impact");
    expect(block).toHaveTextContent("4 trees grown through portfolio feedback");
    expect(block).toHaveTextContent("2 meaningful contributions");
    expect(block).toHaveTextContent("2 trees planted for each");
  });

  it("renders the Tree-Nation link", () => {
    renderWithTheme(<Forest {...defaultForest} />);
    expect(
      screen.getByRole("link", { name: /View the forest on Tree-Nation/i }),
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
          insightsCollectedCount={0}
          treesDedicatedCount={0}
          improvementsShippedCount={0}
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
        String(fullStatForest.insightsCollectedCount),
        String(fullStatForest.treesDedicatedCount),
        String(fullStatForest.improvementsShippedCount),
      ]);
    });
  });
});
