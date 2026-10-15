import { getRobotsHeader, ROBOTS_INDEX, ROBOTS_NOINDEX } from "../robots";

describe("getRobotsHeader", () => {
  it.each([
    "agostiniandrea.dev",
    "www.agostiniandrea.dev",
    "AgostiniAndrea.dev",
    "agostiniandrea.dev:443",
  ])("allows indexing on the production host %s", (host) => {
    expect(getRobotsHeader(host)).toBe(ROBOTS_INDEX);
  });

  it.each([
    "test.agostiniandrea.dev",
    "andrea-agostini-website.a-agostini92.workers.dev",
    "agostiniandrea-dev.vercel.app",
    "localhost:3000",
    "agostiniandrea.dev.evil.example",
    "",
  ])("blocks indexing on %s", (host) => {
    expect(getRobotsHeader(host)).toBe(ROBOTS_NOINDEX);
  });

  it("blocks indexing when the host is missing", () => {
    expect(getRobotsHeader(null)).toBe(ROBOTS_NOINDEX);
    expect(getRobotsHeader(undefined)).toBe(ROBOTS_NOINDEX);
  });
});
