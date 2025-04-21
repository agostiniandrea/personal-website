/**
 * Creates a mock implementation for window.matchMedia
 * @param matches Optional boolean or function to determine if media query matches
 * @returns Mock implementation for window.matchMedia
 */
export const createMatchMediaMock = (
  matches: boolean | ((query: string) => boolean) = false
) => {
  return jest.fn().mockImplementation((query: string) => ({
    matches: typeof matches === 'function' ? matches(query) : matches,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));
};

/**
 * Mock implementation for mobile viewport
 * Matches when query is "(min-width: 0px) and (max-width: 600px)"
 */
export const mockMobileViewport = () => {
  window.matchMedia = createMatchMediaMock(
    (query) => query === "(min-width: 0px) and (max-width: 600px)"
  );
};

/**
 * Mock implementation for desktop viewport
 * Does not match mobile media queries
 */
export const mockDesktopViewport = () => {
  window.matchMedia = createMatchMediaMock(
    (query) => query !== "(min-width: 0px) and (max-width: 600px)"
  );
}; 