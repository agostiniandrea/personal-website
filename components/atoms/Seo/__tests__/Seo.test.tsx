import { localePath } from "../Seo";

const SITE = "https://agostiniandrea.dev";

describe("localePath — canonical URL generation", () => {
  describe("English (default) locale", () => {
    it("generates the root canonical without trailing slash duplication", () => {
      expect(localePath("en", "/")).toBe(`${SITE}/`);
    });

    it("generates a detail path without locale prefix", () => {
      expect(localePath("en", "/experience")).toBe(`${SITE}/experience`);
    });

    it("generates another detail path without locale prefix", () => {
      expect(localePath("en", "/projects")).toBe(`${SITE}/projects`);
    });
  });

  describe("Italian locale", () => {
    it("generates the root canonical without trailing slash", () => {
      expect(localePath("it", "/")).toBe(`${SITE}/it`);
    });

    it("does not produce a double slash after the domain", () => {
      const url = localePath("it", "/");
      // Strip the protocol (https://) before checking for double slashes
      expect(url.replace(/^https?:\/\//, "")).not.toContain("//");
    });

    it("generates a detail path with /it/ prefix and no trailing slash", () => {
      expect(localePath("it", "/experience")).toBe(`${SITE}/it/experience`);
    });
  });

  describe("hreflang pair consistency", () => {
    it("English root and Italian root are both canonical and correctly differ", () => {
      const en = localePath("en", "/");
      const it = localePath("it", "/");
      expect(en).toBe(`${SITE}/`);
      expect(it).toBe(`${SITE}/it`);
      expect(en).not.toBe(it);
    });

    it("x-default href matches English", () => {
      // x-default is always set to localePath("en", path)
      const xDefault = localePath("en", "/");
      expect(xDefault).toBe(`${SITE}/`);
    });
  });
});
