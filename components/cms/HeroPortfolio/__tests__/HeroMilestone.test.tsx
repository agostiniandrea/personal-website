import { useRouter } from "next/router";

import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { THAILAND_ANNIVERSARY } from "@lib/utils/thailandAnniversary";
import { renderWithTheme } from "@test-utils/renderWithTheme";

import HeroPortfolio from "../index";
import { defaultHeroPortfolio } from "../model";

jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

const mockUseRouter = useRouter as jest.Mock;

describe("HeroPortfolio milestone badge", () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({ locale: "en" });
  });

  afterEach(() => {
    document.getElementById("forest")?.remove();
    delete window.gtag;
  });

  it.each([undefined, 0, 49, Number.NaN, -3])(
    "is absent while the forest has no milestone behind it (%s)",
    (treesPlanted) => {
      renderWithTheme(
        <HeroPortfolio
          {...defaultHeroPortfolio}
          treesPlanted={treesPlanted as number | undefined}
        />,
      );
      expect(screen.queryByTestId("hero-milestone")).not.toBeInTheDocument();
    },
  );

  it("names the milestone and links to the Forest section", () => {
    renderWithTheme(
      <HeroPortfolio {...defaultHeroPortfolio} treesPlanted={200} />,
    );
    const badge = screen.getByTestId("hero-milestone");
    expect(badge).toHaveAttribute("href", "#forest");
    expect(badge).toHaveTextContent("200 trees planted");
    // The accessible name starts with the visible text.
    expect(
      screen.getByRole("link", { name: "200 trees planted — see the Forest" }),
    ).toBe(badge);
    // Decorative icons stay out of the accessibility tree.
    badge.querySelectorAll("svg").forEach((svg) => {
      expect(svg).toHaveAttribute("aria-hidden", "true");
    });
  });

  /* The label follows the live total through the same rule as the Forest
     section, so it never needs editing when the next milestone falls. */
  it.each([
    [50, "50 trees planted"],
    [199, "100 trees planted"],
    [200, "200 trees planted"],
    [250, "200 trees planted"],
    [299, "200 trees planted"],
    [300, "300 trees planted"],
    [301, "300 trees planted"],
  ])("shows the latest milestone for %i trees: %s", (count, label) => {
    renderWithTheme(
      <HeroPortfolio {...defaultHeroPortfolio} treesPlanted={count} />,
    );
    expect(screen.getByTestId("hero-milestone")).toHaveTextContent(label);
  });

  it("speaks Italian", () => {
    mockUseRouter.mockReturnValue({ locale: "it" });
    renderWithTheme(
      <HeroPortfolio {...defaultHeroPortfolio} treesPlanted={200} />,
    );
    expect(screen.getByTestId("hero-milestone")).toHaveTextContent(
      "200 alberi piantati",
    );
    expect(
      screen.getByRole("link", {
        name: "200 alberi piantati — vai alla Forest",
      }),
    ).toBeInTheDocument();
  });

  it("scrolls to the Forest section and tracks the click", async () => {
    const user = userEvent.setup();
    window.gtag = jest.fn();
    const forest = document.createElement("section");
    forest.id = "forest";
    forest.scrollIntoView = jest.fn();
    document.body.appendChild(forest);

    renderWithTheme(
      <HeroPortfolio {...defaultHeroPortfolio} treesPlanted={200} />,
    );
    await user.click(screen.getByTestId("hero-milestone"));

    expect(forest.scrollIntoView).toHaveBeenCalledTimes(1);
    expect(window.gtag).toHaveBeenCalledWith("event", "hero_milestone_click", {
      locale: "en",
    });
  });

  it("leaves the native anchor alone when the Forest section is not on the page", async () => {
    const user = userEvent.setup();
    window.gtag = jest.fn();
    renderWithTheme(
      <HeroPortfolio {...defaultHeroPortfolio} treesPlanted={200} />,
    );
    await user.click(screen.getByTestId("hero-milestone"));
    expect(window.gtag).not.toHaveBeenCalledWith(
      "event",
      "hero_milestone_click",
      expect.anything(),
    );
  });
});

describe("HeroPortfolio milestone row", () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({ locale: "en" });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("shows both milestones, the trees first and the anniversary beside it", () => {
    renderWithTheme(
      <HeroPortfolio {...defaultHeroPortfolio} treesPlanted={200} />,
    );
    const trees = screen.getByTestId("hero-milestone");
    const anniversary = screen.getByTestId("thailand-anniversary");
    expect(trees).toHaveTextContent("200 trees planted");
    expect(anniversary).toHaveTextContent("One year in Thailand");
    expect(anniversary).toHaveTextContent("Oct 2025 — Oct 2026");
    expect(screen.queryByText(/new beginnings/)).not.toBeInTheDocument();
    expect(
      trees.compareDocumentPosition(anniversary) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("sits after the calls to action, so the name, role and buttons lead", () => {
    renderWithTheme(
      <HeroPortfolio {...defaultHeroPortfolio} treesPlanted={200} />,
    );
    const cta = screen.getByRole("link", {
      name: defaultHeroPortfolio.ctaPrimaryLabel,
    });
    expect(
      cta.compareDocumentPosition(screen.getByTestId("hero-milestone")) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("keeps the anniversary when the forest has no milestone yet", () => {
    renderWithTheme(
      <HeroPortfolio {...defaultHeroPortfolio} treesPlanted={10} />,
    );
    expect(screen.queryByTestId("hero-milestone")).not.toBeInTheDocument();
    expect(screen.getByTestId("thailand-anniversary")).toBeInTheDocument();
  });

  /* The anniversary is an editorial week with its own switch; the tree
     milestone is generic and must outlive it. */
  it("drops only the anniversary when it is switched off", () => {
    jest.replaceProperty(THAILAND_ANNIVERSARY, "enabled", false);
    renderWithTheme(
      <HeroPortfolio {...defaultHeroPortfolio} treesPlanted={200} />,
    );
    expect(
      screen.queryByTestId("thailand-anniversary"),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("hero-milestone")).toHaveTextContent(
      "200 trees planted",
    );
  });

  it("renders nothing extra when neither milestone applies", () => {
    jest.replaceProperty(THAILAND_ANNIVERSARY, "enabled", false);
    renderWithTheme(<HeroPortfolio {...defaultHeroPortfolio} />);
    expect(screen.queryByTestId("hero-milestone")).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("thailand-anniversary"),
    ).not.toBeInTheDocument();
  });

  /* No background image, illustration or photo overlay: the only images in the
     hero are the portrait. */
  it("adds no image to the hero besides the portrait", () => {
    const { container } = renderWithTheme(
      <HeroPortfolio {...defaultHeroPortfolio} treesPlanted={200} />,
    );
    expect(container.querySelectorAll("img")).toHaveLength(1);
    expect(container.querySelector("picture, video, canvas")).toBeNull();
  });
});
