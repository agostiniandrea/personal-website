import {
  blockBrowserStorage,
  captureUncaughtErrors,
} from "@test-utils/blockBrowserStorage";

import { safeLocalStorage, safeSessionStorage } from "../safeStorage";

describe("safe storage", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  afterEach(() => jest.restoreAllMocks());

  it.each([
    ["localStorage", safeLocalStorage, () => localStorage],
    ["sessionStorage", safeSessionStorage, () => sessionStorage],
  ])("%s: reads back what it wrote", (_name, safe, raw) => {
    expect(safe.getItem("k")).toBeNull();
    expect(safe.setItem("k", "v")).toBe(true);
    expect(raw().getItem("k")).toBe("v");
    expect(safe.getItem("k")).toBe("v");
  });

  it("keeps the two stores apart", () => {
    safeLocalStorage.setItem("k", "local");
    expect(safeSessionStorage.getItem("k")).toBeNull();
  });

  it.each([
    ["localStorage", safeLocalStorage],
    ["sessionStorage", safeSessionStorage],
  ])(
    "%s: a blocked store reads as empty and refuses writes quietly",
    (_n, safe) => {
      blockBrowserStorage();
      expect(() => safe.getItem("k")).not.toThrow();
      expect(safe.getItem("k")).toBeNull();
      expect(() => safe.setItem("k", "v")).not.toThrow();
      expect(safe.setItem("k", "v")).toBe(false);
    },
  );

  it("blocking one store leaves the other working", () => {
    blockBrowserStorage("local");
    expect(safeLocalStorage.setItem("k", "v")).toBe(false);
    expect(safeSessionStorage.setItem("k", "v")).toBe(true);
    expect(safeSessionStorage.getItem("k")).toBe("v");
  });

  it("survives the storage object itself being inaccessible", () => {
    jest.spyOn(window, "localStorage", "get").mockImplementation(() => {
      throw new DOMException("The operation is insecure.", "SecurityError");
    });
    expect(safeLocalStorage.getItem("k")).toBeNull();
    expect(safeLocalStorage.setItem("k", "v")).toBe(false);
  });

  it("the blocking helper really does throw on the raw API", () => {
    // Guards the other suites: if this stopped throwing, their "storage is
    // blocked" scenarios would silently test nothing.
    const { errors, stop } = captureUncaughtErrors();
    blockBrowserStorage();
    expect(() => localStorage.setItem("k", "v")).toThrow();
    expect(() => sessionStorage.getItem("k")).toThrow();
    stop();
    expect(errors).toHaveLength(0);
  });
});
