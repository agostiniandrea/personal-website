import { jest } from "@jest/globals";

/**
 * Creates a mock implementation for window.matchMedia
 * @param matches Optional boolean or function to determine if media query matches
 * @returns Mock implementation for window.matchMedia
 */
export const createMatchMediaMock = (
  matches: boolean | ((query: string) => boolean) = false,
) => {
  return jest.fn((query: string) => ({
    matches: typeof matches === "function" ? matches(query) : matches,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn().mockReturnValue(true),
  })) as unknown as typeof window.matchMedia;
};

/**
 * Evaluates a min/max-width media query against a simulated viewport width.
 * Handles single and `and`-combined width conditions, so it stays correct
 * whatever breakpoint values the code queries — no hardcoded pixel string.
 */
const matchesAtWidth = (query: string, width: number): boolean => {
  const conditions = query.match(/\((?:min|max)-width:\s*[\d.]+px\)/g);
  if (!conditions) return false;
  return conditions.every((condition) => {
    const [, direction, value] = condition.match(
      /\((min|max)-width:\s*([\d.]+)px\)/,
    ) as RegExpMatchArray;
    const px = parseFloat(value);
    return direction === "min" ? width >= px : width <= px;
  });
};

type SimulatedDevice = { width: number; hover: boolean };

/**
 * Resolves any media query the app uses against a simulated device, covering
 * both viewport width and the hover/pointer capabilities that gate
 * hover-vs-tap behaviour (e.g. InfoTooltip).
 */
const evaluateQuery = (query: string, device: SimulatedDevice): boolean => {
  if (/\(\s*hover:\s*hover\s*\)/.test(query)) return device.hover;
  if (/\(\s*hover:\s*none\s*\)/.test(query)) return !device.hover;
  if (/\(\s*pointer:\s*fine\s*\)/.test(query)) return device.hover;
  if (/\(\s*pointer:\s*coarse\s*\)/.test(query)) return !device.hover;
  // Matches so animated unmounts resolve synchronously in jsdom, which never
  // fires animation events.
  if (/prefers-reduced-motion/.test(query)) return true;
  return matchesAtWidth(query, device.width);
};

/** Mock implementation for a mobile viewport (390px, touch — no hover). */
export const mockMobileViewport = () => {
  window.matchMedia = createMatchMediaMock((query) =>
    evaluateQuery(query, { width: 390, hover: false }),
  );
};

/** Mock implementation for a desktop viewport (1440px, mouse — hover). */
export const mockDesktopViewport = () => {
  window.matchMedia = createMatchMediaMock((query) =>
    evaluateQuery(query, { width: 1440, hover: true }),
  );
};
