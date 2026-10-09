import { act } from "@testing-library/react";

import { renderWithTheme } from "@test-utils/renderWithTheme";

import TreeNationLabel, {
  TREE_NATION_CODES,
  TREE_NATION_WIDGETS_SRC,
} from "../index";

let mockLocale = "en";

jest.mock("next/router", () => ({
  useRouter: () => ({ locale: mockLocale }),
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

const widgetScripts = () =>
  document.querySelectorAll(`script[src="${TREE_NATION_WIDGETS_SRC}"]`);

/* jsdom has no requestIdleCallback, so the component falls back to a timeout. */
const runIdle = () => act(() => void jest.advanceTimersByTime(500));

const widgetOf = (container: HTMLElement) =>
  container.querySelector<HTMLElement>("[data-widget-type]");

describe("TreeNationLabel", () => {
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    jest.useFakeTimers();
    mockLocale = "en";
    document.documentElement.removeAttribute("data-theme");
    document.querySelectorAll("script").forEach((el) => el.remove());
    setSystemDark(false);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  afterAll(() => {
    window.matchMedia = originalMatchMedia;
  });

  it("renders the Climate Action Website label with its official code", () => {
    const { container } = renderWithTheme(
      <TreeNationLabel type="offset-website" />,
    );
    const widget = widgetOf(container);

    expect(widget).toHaveAttribute("data-widget-type", "offset-website");
    expect(widget).toHaveAttribute("data-tree-nation-code", "a4d3639b36ee64ed");
    expect(TREE_NATION_CODES["offset-website"]).toBe("a4d3639b36ee64ed");
  });

  it("renders the Tree Counter label with its official code", () => {
    const { container } = renderWithTheme(
      <TreeNationLabel type="tree-counter" />,
    );
    const widget = widgetOf(container);

    expect(widget).toHaveAttribute("data-widget-type", "tree-counter");
    expect(widget).toHaveAttribute("data-tree-nation-code", "c128ea8ddf37a37a");
  });

  it("renders exactly one widget per label", () => {
    const { container } = renderWithTheme(
      <TreeNationLabel type="tree-counter" />,
    );
    expect(container.querySelectorAll("[data-widget-type]")).toHaveLength(1);
  });

  it("loads the official v3 script once, after the page is idle", () => {
    renderWithTheme(<TreeNationLabel type="offset-website" />);
    expect(widgetScripts()).toHaveLength(0);

    runIdle();

    const scripts = widgetScripts();
    expect(scripts).toHaveLength(1);
    expect(scripts[0]).toHaveAttribute("src", TREE_NATION_WIDGETS_SRC);
    expect(scripts[0]).toHaveProperty("async", true);
    expect(TREE_NATION_WIDGETS_SRC).toBe(
      "https://widgets.tree-nation.com/js/widgets/v3/widgets.min.js",
    );
  });

  it("runs the script once for several labels mounted together", () => {
    renderWithTheme(
      <>
        <TreeNationLabel type="tree-counter" />
        <TreeNationLabel type="offset-website" />
      </>,
    );
    runIdle();
    expect(widgetScripts()).toHaveLength(1);
  });

  it("runs the script again when the language changes, so the new label fills in", () => {
    const { container, rerender } = renderWithTheme(
      <TreeNationLabel type="offset-website" />,
    );
    runIdle();
    const first = widgetScripts()[0];

    mockLocale = "it";
    rerender(<TreeNationLabel type="offset-website" />);
    runIdle();

    const scripts = widgetScripts();
    expect(scripts).toHaveLength(1);
    expect(scripts[0]).not.toBe(first);
    expect(widgetOf(container)).toHaveAttribute("data-lang", "it");
  });

  it("does not inject anything if it unmounts before the idle moment", () => {
    const { unmount } = renderWithTheme(
      <TreeNationLabel type="offset-website" />,
    );
    unmount();
    runIdle();
    expect(widgetScripts()).toHaveLength(0);
  });

  it("uses the light theme in English by default", () => {
    const { container } = renderWithTheme(
      <TreeNationLabel type="offset-website" />,
    );

    expect(widgetOf(container)).toHaveAttribute("data-lang", "en");
    expect(widgetOf(container)).toHaveAttribute("data-theme", "light");
  });

  it("uses the dark theme when the site theme is dark", () => {
    document.documentElement.setAttribute("data-theme", "dark");
    const { container } = renderWithTheme(
      <TreeNationLabel type="offset-website" />,
    );

    expect(widgetOf(container)).toHaveAttribute("data-theme", "dark");
  });

  it("follows the OS when the visitor has not picked a theme", () => {
    setSystemDark(true);
    const { container } = renderWithTheme(
      <TreeNationLabel type="offset-website" />,
    );

    expect(widgetOf(container)).toHaveAttribute("data-theme", "dark");
  });

  it("lets an explicit light choice win over a dark OS", () => {
    setSystemDark(true);
    document.documentElement.setAttribute("data-theme", "light");
    const { container } = renderWithTheme(
      <TreeNationLabel type="offset-website" />,
    );

    expect(widgetOf(container)).toHaveAttribute("data-theme", "light");
  });

  it("uses the Italian label on the Italian locale", () => {
    mockLocale = "it";
    const { container } = renderWithTheme(
      <TreeNationLabel type="tree-counter" />,
    );

    expect(widgetOf(container)).toHaveAttribute("data-lang", "it");
  });

  it("falls back to English for any other locale", () => {
    mockLocale = "fr";
    const { container } = renderWithTheme(
      <TreeNationLabel type="tree-counter" />,
    );

    expect(widgetOf(container)).toHaveAttribute("data-lang", "en");
  });

  it("swaps to the new theme, still one widget, when the theme changes", () => {
    const observerMock = global.MutationObserver as unknown as jest.Mock;
    observerMock.mockClear();
    const { container } = renderWithTheme(
      <TreeNationLabel type="offset-website" />,
    );
    const onThemeAttributeChange = observerMock.mock.calls[0][0] as () => void;

    document.documentElement.setAttribute("data-theme", "dark");
    act(() => onThemeAttributeChange());

    expect(container.querySelectorAll("[data-widget-type]")).toHaveLength(1);
    expect(widgetOf(container)).toHaveAttribute("data-theme", "dark");
    runIdle();
    expect(widgetScripts()).toHaveLength(1);
  });

  it("always renders the reserved row, so the page does not shift", () => {
    const { getByTestId } = renderWithTheme(
      <TreeNationLabel type="tree-counter" />,
    );
    expect(getByTestId("tree-nation-tree-counter")).toBeInTheDocument();
  });
});
