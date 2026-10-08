import { act, render } from "@testing-library/react";

import { renderWithTheme } from "@test-utils/renderWithTheme";

import TreeNationLabels, {
  TREE_NATION_LABELS,
  TREE_NATION_WIDGETS_SRC,
} from "../index";

let mockLocale = "en";

jest.mock("next/router", () => ({
  useRouter: () => ({ locale: mockLocale }),
}));

/* Stand-in for next/script that exposes what it was asked to load. A real
   <script> element inside a React tree makes React warn in every test. */
jest.mock("next/script", () => ({
  __esModule: true,
  default: ({
    id,
    src,
    strategy,
  }: {
    id?: string;
    src?: string;
    strategy?: string;
  }) => (
    <span data-script-id={id} data-script-src={src} data-strategy={strategy} />
  ),
}));

const setSystemDark = (dark: boolean) => {
  window.matchMedia = ((query: string) => ({
    addEventListener: () => {},
    addListener: () => {},
    dispatchEvent: () => true,
    matches: dark && query.includes("prefers-color-scheme: dark"),
    media: query,
    onchange: null,
    removeEventListener: () => {},
    removeListener: () => {},
  })) as unknown as typeof window.matchMedia;
};

const widget = (container: HTMLElement, type: string) =>
  container.querySelector<HTMLElement>(`[data-widget-type="${type}"]`);

describe("TreeNationLabels", () => {
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    mockLocale = "en";
    document.documentElement.removeAttribute("data-theme");
    setSystemDark(false);
  });

  afterAll(() => {
    window.matchMedia = originalMatchMedia;
  });

  it("renders both official labels with their Tree-Nation codes", () => {
    const { container } = renderWithTheme(<TreeNationLabels />);

    expect(widget(container, "offset-website")).toHaveAttribute(
      "data-tree-nation-code",
      "a4d3639b36ee64ed",
    );
    expect(widget(container, "tree-counter")).toHaveAttribute(
      "data-tree-nation-code",
      "c128ea8ddf37a37a",
    );
    expect(TREE_NATION_LABELS).toHaveLength(2);
  });

  it("loads the official v3 script once, after the page has loaded", () => {
    const { container } = renderWithTheme(<TreeNationLabels />);

    const scripts = container.querySelectorAll("[data-script-src]");
    expect(scripts).toHaveLength(1);
    expect(scripts[0]).toHaveAttribute(
      "data-script-src",
      TREE_NATION_WIDGETS_SRC,
    );
    expect(TREE_NATION_WIDGETS_SRC).toBe(
      "https://widgets.tree-nation.com/js/widgets/v3/widgets.min.js",
    );
    expect(scripts[0]).toHaveAttribute("data-strategy", "lazyOnload");
  });

  it("uses the light monochrome theme in English by default", () => {
    const { container } = renderWithTheme(<TreeNationLabels />);

    TREE_NATION_LABELS.forEach(({ type }) => {
      expect(widget(container, type)).toHaveAttribute("data-lang", "en");
      expect(widget(container, type)).toHaveAttribute(
        "data-theme",
        "white-monochrome",
      );
    });
  });

  it("uses the dark monochrome theme when the site theme is dark", () => {
    document.documentElement.setAttribute("data-theme", "dark");
    const { container } = renderWithTheme(<TreeNationLabels />);

    TREE_NATION_LABELS.forEach(({ type }) => {
      expect(widget(container, type)).toHaveAttribute(
        "data-theme",
        "dark-monochrome",
      );
    });
  });

  it("follows the OS when the visitor has not picked a theme", () => {
    setSystemDark(true);
    const { container } = renderWithTheme(<TreeNationLabels />);

    expect(widget(container, "offset-website")).toHaveAttribute(
      "data-theme",
      "dark-monochrome",
    );
  });

  it("lets an explicit light choice win over a dark OS", () => {
    setSystemDark(true);
    document.documentElement.setAttribute("data-theme", "light");
    const { container } = renderWithTheme(<TreeNationLabels />);

    expect(widget(container, "offset-website")).toHaveAttribute(
      "data-theme",
      "white-monochrome",
    );
  });

  it("uses the Italian labels on the Italian locale", () => {
    mockLocale = "it";
    const { container } = renderWithTheme(<TreeNationLabels />);

    TREE_NATION_LABELS.forEach(({ type }) => {
      expect(widget(container, type)).toHaveAttribute("data-lang", "it");
    });
  });

  it("falls back to English for any other locale", () => {
    mockLocale = "fr";
    const { container } = renderWithTheme(<TreeNationLabels />);

    expect(widget(container, "tree-counter")).toHaveAttribute(
      "data-lang",
      "en",
    );
  });

  it("swaps to the new theme, one label of each kind, when the theme changes", () => {
    const observerMock = global.MutationObserver as unknown as jest.Mock;
    observerMock.mockClear();
    const { container } = renderWithTheme(<TreeNationLabels />);
    const onThemeAttributeChange = observerMock.mock.calls[0][0] as () => void;

    document.documentElement.setAttribute("data-theme", "dark");
    act(() => onThemeAttributeChange());

    expect(container.querySelectorAll("[data-widget-type]")).toHaveLength(2);
    expect(widget(container, "offset-website")).toHaveAttribute(
      "data-theme",
      "dark-monochrome",
    );
    expect(container.querySelectorAll("[data-script-src]")).toHaveLength(1);
  });

  it("always renders the reserved row, so the footer does not shift", () => {
    const { getByTestId } = render(<TreeNationLabels />);
    expect(getByTestId("tree-nation-labels")).toBeInTheDocument();
  });
});
