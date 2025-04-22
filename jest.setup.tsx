import { jest } from '@jest/globals';

// Only import testing libraries if we're in a test environment
if (process.env.NODE_ENV === 'test') {
  try {
    require('@testing-library/jest-dom');
    require('jest-styled-components');
  } catch (error) {
    console.warn('Testing libraries not found. Skipping test setup.');
  }
}

// Suppress React 18 Strict Mode warnings and ReactDOMTestUtils.act warning
const originalError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' && (
      args[0].includes('Warning: ReactDOM.render is no longer supported') ||
      args[0].includes('Warning: `ReactDOMTestUtils.act` is deprecated')
    )
  ) {
    return;
  }
  originalError.call(console, ...args);
};

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((...args: unknown[]) => ({
    matches: false,
    media: args[0] as string,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
}); 