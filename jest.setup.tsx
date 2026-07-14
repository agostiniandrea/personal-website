import { jest } from "@jest/globals";
import "@testing-library/jest-dom";
import "jest-styled-components";

// Extend expect with the matchers from jest-dom
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveStyle(style: Record<string, string | number>): R;
      toHaveAttribute(attr: string, value?: string): R;
    }
  }
}

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
  }),
});

// Mock next/image
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt, width, height, fill: _fill, style, className, priority: _priority, ...rest }: {
    src: string; alt: string; width?: number; height?: number; fill?: boolean;
    style?: React.CSSProperties; className?: string; priority?: boolean; sizes?: string;
    [key: string]: unknown;
  }) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} width={width} height={height} style={style} className={className} {...rest} />;
  },
}));

// Mock next/router
jest.mock("next/router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    locale: "en",
    pathname: "/",
    query: {},
    asPath: "/",
  }),
}));

// Mock IntersectionObserver (not available in jsdom)
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
})) as unknown as typeof IntersectionObserver;
