import '@testing-library/jest-dom';
import 'jest-styled-components';
import { act } from 'react';

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
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
}); 