import { useRouter } from "next/router";

import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { FOREST_CAMPAIGN } from "@lib/utils/forestCampaign";
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
    // The regular behaviour is covered with the temporary campaign switched
    // off; the campaign has its own describe block at the bottom of the file.
    jest.replaceProperty(FOREST_CAMPAIGN, "enabled", false);
  });

  afterEach(() => {
    jest.restoreAllMocks();
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
    // treeCount 34, so the first rung at 50 is still ahead → 68%
    expect(screen.getByText("68% towards next milestone")).toBeInTheDocument();
  });

  describe("milestone ladder", () => {
    it("shows the monthly pulse only when trees landed this month", () => {
      const { rerender } = renderWithTheme(<Forest {...defaultForest} />);
      expect(screen.queryByTestId("month-pulse")).not.toBeInTheDocument();

      rerender(<Forest {...defaultForest} monthTreeCount={8} />);
      expect(screen.getByTestId("month-pulse")).toHaveTextContent(
        "+8 this month",
      );
    });

    it("counts towards the first rung before it is reached", () => {
      renderWithTheme(<Forest {...defaultForest} treeCount={34} />);
      expect(screen.getByText("34 / 50 trees")).toBeInTheDocument();
      expect(screen.queryByTestId("milestone-reached")).not.toBeInTheDocument();
    });

    /* Landing exactly on a rung advances past it rather than pinning the bar at
       100% — the forest does not pause, and a full bar that never empties stops
       reporting anything. */
    it("advances the moment a rung is reached", () => {
      renderWithTheme(<Forest {...defaultForest} treeCount={50} />);
      expect(screen.getByText("50 / 100 trees")).toBeInTheDocument();
      expect(screen.getByTestId("milestone-reached")).toHaveTextContent(
        "50 trees reached",
      );
    });

    it("keeps the badge while climbing to the next rung", () => {
      renderWithTheme(<Forest {...defaultForest} treeCount={83} />);
      expect(screen.getByText("83 / 100 trees")).toBeInTheDocument();
      expect(screen.getByTestId("milestone-reached")).toHaveTextContent(
        "50 trees reached",
      );
    });

    /* The step is 100 from the second rung on, so the ladder needs no list and
       nothing to maintain when one falls. */
    it("steps by a hundred past the first rung", () => {
      const { rerender } = renderWithTheme(
        <Forest {...defaultForest} treeCount={100} />,
      );
      expect(screen.getByText("100 / 200 trees")).toBeInTheDocument();
      expect(screen.getByTestId("milestone-reached")).toHaveTextContent(
        "100 trees reached",
      );

      rerender(<Forest {...defaultForest} treeCount={1_240} />);
      expect(screen.getByText("1240 / 1300 trees")).toBeInTheDocument();
      expect(screen.getByTestId("milestone-reached")).toHaveTextContent(
        "1200 trees reached",
      );
    });

    it("reports the percentage only while no rung has fallen", () => {
      const { rerender } = renderWithTheme(
        <Forest {...defaultForest} treeCount={47} />,
      );
      expect(
        screen.getByText("94% towards next milestone"),
      ).toBeInTheDocument();

      // Past the first rung the badge takes the slot: a milestone outranks a
      // percentage that will reset anyway.
      rerender(<Forest {...defaultForest} treeCount={60} />);
      expect(
        screen.queryByText(/towards next milestone/),
      ).not.toBeInTheDocument();
    });

    it("survives an empty forest", () => {
      renderWithTheme(<Forest {...defaultForest} treeCount={0} />);
      expect(screen.getByText("0 / 50 trees")).toBeInTheDocument();
      expect(screen.queryByTestId("milestone-reached")).not.toBeInTheDocument();
    });
  });

  describe("tree count label", () => {
    it("keeps the English text without a CMS override", () => {
      renderWithTheme(<Forest {...defaultForest} treeCountLabel={undefined} />);
      expect(
        screen.getByText("Trees planted since May 2026"),
      ).toBeInTheDocument();
    });

    it("is localised in Italian without a CMS override", () => {
      mockUseRouter.mockReturnValue({ locale: "it" });
      renderWithTheme(<Forest {...defaultForest} treeCountLabel={undefined} />);
      expect(
        screen.getByText("Alberi piantati da maggio 2026"),
      ).toBeInTheDocument();
      expect(
        screen.queryByText("Trees planted since May 2026"),
      ).not.toBeInTheDocument();
    });

    it("still lets an explicit CMS label win", () => {
      renderWithTheme(<Forest {...defaultForest} treeCountLabel="CMS label" />);
      expect(screen.getByText("CMS label")).toBeInTheDocument();
    });
  });

  it("names the forest total only once, in the panel that tracks it", () => {
    renderWithTheme(<Forest {...defaultForest} />);
    // The CTA card shows the number under its own caption; "My forest" belongs
    // to the progress panel, where it pairs with "Feedback impact". Both on
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

    it("keeps each separator with the clause it closes", () => {
      renderWithTheme(<Forest {...defaultForest} forestSpecies={species} />);
      // A narrow screen was breaking before the "·", opening a line with it.
      // The non-breaking space ties it to the text on its left.
      const text = screen.getByTestId("species-detail").textContent ?? "";
      expect(text).toContain("\u00a0·");
      expect(text).not.toMatch(/\s\u0020·/);
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
      {
        id: 568,
        name: "Plant to Stop Poverty",
        slug: "pstp",
        country: "TZ",
        trees: 22,
      },
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
      expect(screen.getByTestId("forest-spread")).toHaveTextContent(
        "Somewhere",
      );
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
    expect(screen.getByTestId("feedback-impact")).toHaveStyleRule(
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
    const block = screen.getByTestId("feedback-impact");
    expect(block).toHaveTextContent("4 trees grown through portfolio feedback");
    expect(block).toHaveTextContent("2 meaningful contributions");
    expect(block).toHaveTextContent("2 trees planted for each");
  });

  it("keeps the standalone Tree-Nation link below the card, separate from the popover", async () => {
    const user = userEvent.setup();
    renderWithTheme(<Forest {...defaultForest} />);
    const linkName = /View the forest on Tree-Nation/i;
    const standalone = screen.getByRole("link", { name: linkName });
    expect(standalone).toHaveAttribute(
      "href",
      "https://tree-nation.com/profile/andrea-agostini-103769",
    );

    // Opening the popover adds its own link; the standalone one stays.
    await user.click(
      screen.getByRole("button", { name: /Certified by Tree-Nation/i }),
    );
    const links = screen.getAllByRole("link", { name: linkName });
    expect(links).toHaveLength(2);
    expect(links[1]).toHaveAttribute("href", standalone.getAttribute("href")!);
  });

  it("puts the certification badge beside the dynamic tree count, closed by default", () => {
    renderWithTheme(<Forest {...defaultForest} />);
    const badge = screen.getByRole("button", {
      name: /Certified by Tree-Nation/i,
    });
    expect(badge).toHaveAttribute("aria-expanded", "false");
    expect(badge.closest("div")).toHaveTextContent(
      String(defaultForest.treeCount),
    );
    expect(document.querySelector("[data-widget-type]")).toBeNull();
  });

  it("localizes the certification badge", () => {
    mockUseRouter.mockReturnValue({ locale: "it" });
    renderWithTheme(<Forest {...defaultForest} />);
    expect(
      screen.getByRole("button", { name: /Certificato da Tree-Nation/i }),
    ).toBeInTheDocument();
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

  describe("Prolific usability study", () => {
    const COMPLETION_URL =
      "https://app.prolific.com/submissions/complete?cc=ABC123";
    const SESSION = {
      prolificPid: "5f2a1b9c4d3e2f1a0b9c8d7e",
      studyId: "60d5f8a2b1c3d4e5f6a7b8c9",
      sessionId: "70e6a9b3c2d4e5f6a7b8c9d0",
    };
    const originalUrl = process.env.NEXT_PUBLIC_PROLIFIC_COMPLETION_URL;
    let fetchMock: jest.Mock;

    /* Walks the whole four-step form, which is the only way to reach the
       success step where the return link lives. */
    const submitFeedback = async () => {
      const user = userEvent.setup();
      renderWithTheme(<Forest {...defaultForest} />);
      await user.click(
        screen.getByRole("button", { name: defaultForest.ctaButtonLabel }),
      );
      await user.click(screen.getByRole("button", { name: /continue/i }));
      await user.click(screen.getByRole("button", { name: "UX" }));
      await user.click(screen.getByRole("button", { name: /continue/i }));
      await user.type(
        screen.getByLabelText("Your feedback"),
        "The navigation was clear enough to follow.",
      );
      await user.click(screen.getByRole("button", { name: /continue/i }));
      await user.click(screen.getByRole("button", { name: "Send" }));
    };

    const submittedBody = () =>
      JSON.parse(fetchMock.mock.calls[0][1].body as string);

    /* The header ✕ is also named "Close", so the success step's own button is
       the one carrying that as visible text rather than as a label. */
    const successCloseButton = () =>
      screen
        .getAllByRole("button", { name: "Close" })
        .find((button) => button.textContent === "Close");

    beforeEach(() => {
      sessionStorage.clear();
      localStorage.clear();
      fetchMock = jest.fn().mockResolvedValue({ ok: true });
      global.fetch = fetchMock as unknown as typeof fetch;
      process.env.NEXT_PUBLIC_PROLIFIC_COMPLETION_URL = COMPLETION_URL;
    });

    afterEach(() => {
      process.env.NEXT_PUBLIC_PROLIFIC_COMPLETION_URL = originalUrl;
    });

    it("sends the participant identifiers and offers the way back", async () => {
      sessionStorage.setItem("prolific-session", JSON.stringify(SESSION));
      await submitFeedback();

      expect(submittedBody().prolific).toEqual(SESSION);

      const returnLink = screen.getByTestId("prolific-complete");
      expect(returnLink).toHaveAttribute("href", COMPLETION_URL);
      expect(returnLink).toHaveTextContent("Return to Prolific");
      expect(successCloseButton()).toBeUndefined();
    });

    it("never leaks the identifiers into the page", async () => {
      sessionStorage.setItem("prolific-session", JSON.stringify(SESSION));
      await submitFeedback();

      expect(document.body.textContent).not.toContain(SESSION.prolificPid);
    });

    /* The whole point of requirement 3: an ordinary visitor's experience is
       byte-for-byte the one that shipped before the study existed. */
    it("leaves an ordinary submission untouched", async () => {
      await submitFeedback();

      expect(submittedBody().prolific).toBeUndefined();
      expect(successCloseButton()).toBeInTheDocument();
      expect(screen.queryByTestId("prolific-complete")).not.toBeInTheDocument();
    });

    it("shows no return link when no study is configured", async () => {
      delete process.env.NEXT_PUBLIC_PROLIFIC_COMPLETION_URL;
      sessionStorage.setItem("prolific-session", JSON.stringify(SESSION));
      await submitFeedback();

      expect(submittedBody().prolific).toEqual(SESSION);
      expect(successCloseButton()).toBeInTheDocument();
    });
  });

  describe("marketing attribution", () => {
    const ATTRIBUTION = {
      source: "reddit",
      medium: "paid_social",
      campaign: "forest200",
    };
    const PROLIFIC_SESSION = {
      prolificPid: "5f2a1b9c4d3e2f1a0b9c8d7e",
      studyId: "60d5f8a2b1c3d4e5f6a7b8c9",
      sessionId: "70e6a9b3c2d4e5f6a7b8c9d0",
    };
    let fetchMock: jest.Mock;

    const submitFeedback = async () => {
      const user = userEvent.setup();
      renderWithTheme(<Forest {...defaultForest} />);
      await user.click(
        screen.getByRole("button", { name: defaultForest.ctaButtonLabel }),
      );
      await user.click(screen.getByRole("button", { name: /continue/i }));
      await user.click(screen.getByRole("button", { name: "UX" }));
      await user.click(screen.getByRole("button", { name: /continue/i }));
      await user.type(
        screen.getByLabelText("Your feedback"),
        "The navigation was clear enough to follow.",
      );
      await user.click(screen.getByRole("button", { name: /continue/i }));
      await user.click(screen.getByRole("button", { name: "Send" }));
    };

    const submittedBody = () =>
      JSON.parse(fetchMock.mock.calls[0][1].body as string);

    beforeEach(() => {
      sessionStorage.clear();
      localStorage.clear();
      fetchMock = jest.fn().mockResolvedValue({ ok: true });
      global.fetch = fetchMock as unknown as typeof fetch;
    });

    it("sends the stored attribution with the submission", async () => {
      sessionStorage.setItem(
        "marketing-attribution",
        JSON.stringify(ATTRIBUTION),
      );
      await submitFeedback();

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock.mock.calls[0][0]).toBe("/api/feedback");
      expect(submittedBody().attribution).toEqual(ATTRIBUTION);
      expect(submittedBody().prolific).toBeUndefined();
    });

    it("sends nothing extra for a direct visitor", async () => {
      await submitFeedback();

      expect(submittedBody()).not.toHaveProperty("attribution");
      expect(submittedBody()).not.toHaveProperty("prolific");
      expect(submittedBody()).toMatchObject({
        category: "UX",
        message: "The navigation was clear enough to follow.",
      });
    });

    it("re-validates a hand-edited stored value before sending it", async () => {
      sessionStorage.setItem(
        "marketing-attribution",
        JSON.stringify({ source: "<script>", medium: "Social" }),
      );
      await submitFeedback();

      expect(submittedBody().attribution).toEqual({ medium: "social" });
    });

    it("leaves a Prolific submission exactly as it was", async () => {
      sessionStorage.setItem(
        "prolific-session",
        JSON.stringify(PROLIFIC_SESSION),
      );
      sessionStorage.setItem(
        "marketing-attribution",
        JSON.stringify(ATTRIBUTION),
      );
      await submitFeedback();

      expect(submittedBody().prolific).toEqual(PROLIFIC_SESSION);
      expect(submittedBody().attribution).toBeUndefined();
    });

    it("still shows the normal success step after an attributed submission", async () => {
      sessionStorage.setItem(
        "marketing-attribution",
        JSON.stringify(ATTRIBUTION),
      );
      await submitFeedback();

      expect(screen.queryByTestId("prolific-complete")).not.toBeInTheDocument();
      expect(localStorage.getItem("forest-feedback-submitted")).toBe("true");
    });
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

/* TEMPORARY CAMPAIGN (Oct 7–10, 2026) — delete with lib/utils/forestCampaign.ts */
describe("Forest — 200-tree campaign", () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({ locale: "en" });
    jest.replaceProperty(FOREST_CAMPAIGN, "enabled", true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("replaces the hero copy and localises the button", () => {
    renderWithTheme(<Forest {...defaultForest} treeCount={179} />);
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
      "Help this Forest reach 200 trees.",
    );
    expect(
      screen.getByText(
        "I'm celebrating one year in Thailand on October 10th — and I'm growing this Forest to 200 trees.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Since May, meaningful feedback from people exploring this portfolio has helped turn conversations into real trees.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Plant your feedback" }),
    ).toBeInTheDocument();
  });

  it("shows the anniversary as a quiet line without dating the Forest", () => {
    renderWithTheme(<Forest {...defaultForest} treeCount={179} />);
    expect(screen.getByTestId("campaign-anniversary")).toHaveTextContent(
      "One year in Thailand · October 10, 2025 → October 10, 2026",
    );
    // The Forest began in May 2026; the label must keep saying so.
    expect(screen.getByText(defaultForest.treeCountLabel!)).toBeInTheDocument();
  });

  it("wins over the Contentful heading and body while active", () => {
    const cms = {
      ctaHeading: "CMS heading",
      ctaBody: "CMS body copy",
      ctaButtonLabel: "CMS button",
    };
    renderWithTheme(<Forest {...defaultForest} {...cms} treeCount={179} />);
    expect(screen.queryByText("CMS heading")).not.toBeInTheDocument();
    expect(screen.queryByText("CMS body copy")).not.toBeInTheDocument();
    expect(screen.queryByText("CMS button")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Plant your feedback" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
      "Help this Forest reach 200 trees.",
    );
  });

  it("hands the hero back to Contentful once the campaign is off", () => {
    jest.replaceProperty(FOREST_CAMPAIGN, "enabled", false);
    const cms = {
      ctaHeading: "CMS heading",
      ctaBody: "CMS body copy",
      ctaButtonLabel: "CMS button",
    };
    renderWithTheme(<Forest {...defaultForest} {...cms} treeCount={179} />);
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
      "CMS heading",
    );
    expect(screen.getByText("CMS body copy")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "CMS button" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("campaign-anniversary"),
    ).not.toBeInTheDocument();
    expect(screen.getByText("179 / 200 trees")).toBeInTheDocument();
  });

  it.each([
    [179, "21 trees to go"],
    [181, "19 trees to go"],
    [199, "1 tree to go"],
  ])("counts down at %i trees", (count, label) => {
    renderWithTheme(<Forest {...defaultForest} treeCount={count} />);
    expect(screen.getByText(`${count} / 200 trees`)).toBeInTheDocument();
    expect(screen.getByTestId("campaign-to-go")).toHaveTextContent(label);
    expect(screen.queryByTestId("campaign-reached")).not.toBeInTheDocument();
    // The regular ladder badge would read "100 trees reached" here.
    expect(screen.queryByTestId("milestone-reached")).not.toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      String(count),
    );
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuemax",
      "200",
    );
  });

  it.each([200, 205, 1_240])(
    "shows the calm completed state at %i trees",
    (count) => {
      renderWithTheme(<Forest {...defaultForest} treeCount={count} />);
      expect(screen.getByText("200 / 200 trees")).toBeInTheDocument();
      expect(screen.queryByText(/\/ 300/)).not.toBeInTheDocument();
      expect(screen.getByTestId("campaign-reached")).toHaveTextContent(
        "200 trees reached.",
      );
      expect(screen.queryByTestId("campaign-to-go")).not.toBeInTheDocument();
      expect(screen.queryByText(/to go/)).not.toBeInTheDocument();
      expect(screen.queryByText(/-\d/)).not.toBeInTheDocument();
      expect(screen.getByRole("progressbar")).toHaveAttribute(
        "aria-valuenow",
        "200",
      );
      // The real Tree-Nation total stays visible and untouched.
      expect(screen.getByText(String(count))).toBeInTheDocument();
    },
  );

  it("keeps the monthly pulse and the Feedback Impact card as they are", () => {
    renderWithTheme(
      <Forest {...defaultForest} treeCount={179} monthTreeCount={8} />,
    );
    expect(screen.getByTestId("month-pulse")).toHaveTextContent(
      "+8 this month",
    );
    expect(screen.getByTestId("feedback-impact")).toBeInTheDocument();
  });

  it("speaks Italian, with the right singular", () => {
    mockUseRouter.mockReturnValue({ locale: "it" });
    const { rerender } = renderWithTheme(
      <Forest {...defaultForest} treeCount={179} />,
    );
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
      "Aiuta Forest a raggiungere 200 alberi.",
    );
    expect(
      screen.getByText(
        "Da maggio, i feedback utili di chi esplora questo portfolio hanno contribuito a trasformare le conversazioni in alberi veri.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByTestId("campaign-anniversary")).toHaveTextContent(
      "Un anno in Thailandia · 10 ottobre 2025 → 10 ottobre 2026",
    );
    expect(screen.getByTestId("campaign-to-go")).toHaveTextContent(
      "Mancano 21 alberi",
    );
    expect(
      screen.getByRole("button", { name: "Pianta il tuo feedback" }),
    ).toBeInTheDocument();
    // Contentful's (English) label must not leak into the Italian campaign.
    expect(
      screen.queryByRole("button", { name: "Plant your feedback" }),
    ).not.toBeInTheDocument();

    rerender(<Forest {...defaultForest} treeCount={199} />);
    expect(screen.getByTestId("campaign-to-go")).toHaveTextContent(
      "Manca 1 albero",
    );

    rerender(<Forest {...defaultForest} treeCount={200} />);
    expect(screen.getByTestId("campaign-reached")).toHaveTextContent(
      "200 alberi raggiunti.",
    );
  });
});
