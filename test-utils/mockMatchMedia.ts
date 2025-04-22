import { jest } from '@jest/globals';

/**
 * Creates a mock implementation for window.matchMedia
 * @param matches Optional boolean or function to determine if media query matches
 * @returns Mock implementation for window.matchMedia
 */
export const createMatchMediaMock = (
  matches: boolean | ((query: string) => boolean) = false
) => {
  return jest.fn((query: string) => ({
    matches: typeof matches === 'function' ? matches(query) : matches,
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
 * Mock implementation for mobile viewport
 * Matches when query is "(max-width: 768px)"
 */
export const mockMobileViewport = () => {
  window.matchMedia = createMatchMediaMock((query) => query === '(max-width: 768px)');
};

/**
 * Mock implementation for desktop viewport
 * Matches when query is not "(max-width: 768px)"
 */
export const mockDesktopViewport = () => {
  window.matchMedia = createMatchMediaMock((query) => query !== '(max-width: 768px)');
}; 