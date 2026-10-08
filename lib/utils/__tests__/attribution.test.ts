import {
  ATTRIBUTION_MAX_LENGTH,
  ATTRIBUTION_STORAGE_KEY,
  captureAttribution,
  getAttribution,
  parseAttribution,
  sanitizeAttribution,
  sanitizeAttributionValue,
} from "../attribution";

const REDDIT =
  "?utm_source=reddit&utm_medium=paid_social&utm_campaign=forest200&utm_content=hero-a&utm_term=trees";

/* jsdom gives a real sessionStorage but keeps it between tests. */
beforeEach(() => {
  sessionStorage.clear();
  window.history.replaceState({}, "", "/");
});

const visit = (search: string) =>
  window.history.replaceState({}, "", `/${search}`);

describe("sanitizeAttributionValue", () => {
  it("trims and lowercases", () => {
    expect(sanitizeAttributionValue("  Reddit ")).toBe("reddit");
    expect(sanitizeAttributionValue("Forest200")).toBe("forest200");
  });

  it("keeps the punctuation real campaigns use", () => {
    expect(sanitizeAttributionValue("paid_social")).toBe("paid_social");
    expect(sanitizeAttributionValue("hero-a/v2")).toBe("hero-a/v2");
    expect(sanitizeAttributionValue("trees, forest (200)")).toBe(
      "trees, forest (200)",
    );
    expect(sanitizeAttributionValue("andrea@jibe")).toBe("andrea@jibe");
  });

  it("accepts letters of any script", () => {
    expect(sanitizeAttributionValue("Foresta Città")).toBe("foresta città");
  });

  it("accepts exactly the maximum length and rejects one more", () => {
    expect(
      sanitizeAttributionValue("a".repeat(ATTRIBUTION_MAX_LENGTH)),
    ).toHaveLength(ATTRIBUTION_MAX_LENGTH);
    expect(
      sanitizeAttributionValue("a".repeat(ATTRIBUTION_MAX_LENGTH + 1)),
    ).toBeNull();
  });

  it("drops oversized values instead of truncating them", () => {
    expect(sanitizeAttributionValue("a".repeat(5000))).toBeNull();
    expect(sanitizeAttributionValue("a".repeat(500))).toBeNull();
  });

  it("discards anything outside the whitelist", () => {
    for (const bad of [
      "<script>alert(1)</script>",
      "reddit;drop table feedback",
      'a"b',
      "a'b",
      "a\\b",
      "line\nbreak",
      "tab\there",
      "nul\u0000byte",
      "emoji 🌳",
      "a=b&c=d",
      "a#b",
    ]) {
      expect(sanitizeAttributionValue(bad)).toBeNull();
    }
  });

  it("discards empty, blank and non-string values", () => {
    expect(sanitizeAttributionValue("")).toBeNull();
    expect(sanitizeAttributionValue("   ")).toBeNull();
    expect(sanitizeAttributionValue(null)).toBeNull();
    expect(sanitizeAttributionValue(undefined)).toBeNull();
    expect(sanitizeAttributionValue(42)).toBeNull();
    expect(sanitizeAttributionValue({})).toBeNull();
    expect(sanitizeAttributionValue(["reddit"])).toBeNull();
  });
});

describe("sanitizeAttribution", () => {
  it("keeps the valid fields and drops the invalid ones independently", () => {
    expect(
      sanitizeAttribution({
        source: "Reddit",
        medium: "<b>",
        campaign: "forest200",
        content: "x".repeat(101),
        term: "",
      }),
    ).toEqual({ source: "reddit", campaign: "forest200" });
  });

  it("ignores unknown keys, so nothing can ride along", () => {
    expect(
      sanitizeAttribution({ source: "reddit", sourceType: "analytics" }),
    ).toEqual({ source: "reddit" });
  });

  it("returns null when nothing is valid or the input is not an object", () => {
    expect(sanitizeAttribution({ source: "<x>" })).toBeNull();
    expect(sanitizeAttribution({})).toBeNull();
    expect(sanitizeAttribution(null)).toBeNull();
    expect(sanitizeAttribution(undefined)).toBeNull();
    expect(sanitizeAttribution("reddit")).toBeNull();
    expect(sanitizeAttribution(["reddit"])).toBeNull();
  });
});

describe("parseAttribution", () => {
  it("reads all five UTM parameters", () => {
    expect(parseAttribution(REDDIT)).toEqual({
      source: "reddit",
      medium: "paid_social",
      campaign: "forest200",
      content: "hero-a",
      term: "trees",
    });
  });

  it("reads a partial set", () => {
    expect(parseAttribution("?utm_source=reddit")).toEqual({
      source: "reddit",
    });
  });

  it("returns null when no UTM parameter exists", () => {
    expect(parseAttribution("")).toBeNull();
    expect(parseAttribution("?ref=home&lang=it")).toBeNull();
  });

  it("does not invent a source for direct visits", () => {
    expect(parseAttribution("?")).toBeNull();
    expect(parseAttribution("?utm_source=")).toBeNull();
  });

  it("ignores malformed and oversized values per field", () => {
    const long = "a".repeat(101);
    expect(
      parseAttribution(
        `?utm_source=reddit&utm_medium=%3Cscript%3E&utm_campaign=${long}&utm_term=ok`,
      ),
    ).toEqual({ source: "reddit", term: "ok" });
  });

  it("does not choke on broken percent-encoding", () => {
    expect(() => parseAttribution("?utm_source=%E0%A4%A")).not.toThrow();
  });
});

describe("captureAttribution", () => {
  it("stores the attribution for the tab", () => {
    visit(REDDIT);
    const captured = captureAttribution();

    expect(captured).toEqual({
      source: "reddit",
      medium: "paid_social",
      campaign: "forest200",
      content: "hero-a",
      term: "trees",
    });
    expect(getAttribution()).toEqual(captured);
  });

  it("writes nothing and returns null when there is no UTM", () => {
    expect(captureAttribution()).toBeNull();
    expect(sessionStorage.getItem(ATTRIBUTION_STORAGE_KEY)).toBeNull();
    expect(getAttribution()).toBeNull();
  });

  it("writes nothing when every UTM value is invalid", () => {
    visit("?utm_source=%3Cb%3E&utm_campaign=bad;value");
    expect(captureAttribution()).toBeNull();
    expect(sessionStorage.getItem(ATTRIBUTION_STORAGE_KEY)).toBeNull();
  });

  /* Reddit -> homepage -> Forest -> feedback: the landing URL is the only one
     that carries the tags. */
  it("keeps the first touch when later pages have no UTM", () => {
    visit(REDDIT);
    captureAttribution();

    visit("");
    expect(captureAttribution()).toEqual(parseAttribution(REDDIT));

    visit("?section=forest");
    expect(captureAttribution()).toEqual(parseAttribution(REDDIT));
    expect(getAttribution()).toEqual(parseAttribution(REDDIT));
  });

  it("does not clear the stored attribution when the URL has none", () => {
    visit(REDDIT);
    captureAttribution();
    visit("");
    captureAttribution();

    expect(sessionStorage.getItem(ATTRIBUTION_STORAGE_KEY)).not.toBeNull();
    expect(getAttribution()?.source).toBe("reddit");
  });

  it("does not let a later UTM URL overwrite the first touch", () => {
    visit(REDDIT);
    captureAttribution();

    visit("?utm_source=linkedin&utm_medium=social&utm_campaign=other");
    const second = captureAttribution();

    expect(second).toEqual(parseAttribution(REDDIT));
    expect(getAttribution()).toEqual(parseAttribution(REDDIT));
    expect(getAttribution()?.source).toBe("reddit");
    expect(getAttribution()?.campaign).toBe("forest200");
  });

  it("does not merge a later partial UTM into the first touch", () => {
    visit("?utm_source=reddit");
    captureAttribution();

    visit("?utm_source=reddit&utm_campaign=forest200&utm_content=late");
    captureAttribution();

    expect(getAttribution()).toEqual({ source: "reddit" });
  });

  it("captures later if the first URL carried nothing valid", () => {
    visit("?utm_source=%3Cb%3E");
    expect(captureAttribution()).toBeNull();

    visit("?utm_source=reddit&utm_campaign=forest200");
    expect(captureAttribution()).toEqual({
      source: "reddit",
      campaign: "forest200",
    });
  });

  it("is independent of the cookie-consent choice", () => {
    localStorage.setItem("cookie-consent", "declined");
    visit(REDDIT);
    captureAttribution();

    expect(getAttribution()?.source).toBe("reddit");
    localStorage.clear();
  });

  it("never touches the Prolific session", () => {
    sessionStorage.setItem("prolific-session", '{"prolificPid":"abc"}');
    visit(REDDIT);
    captureAttribution();

    expect(sessionStorage.getItem("prolific-session")).toBe(
      '{"prolificPid":"abc"}',
    );
  });
});

describe("getAttribution", () => {
  it("discards a hand-edited entry that is not JSON", () => {
    sessionStorage.setItem(ATTRIBUTION_STORAGE_KEY, "{not json");
    expect(getAttribution()).toBeNull();
  });

  it("re-validates what it reads back", () => {
    sessionStorage.setItem(
      ATTRIBUTION_STORAGE_KEY,
      JSON.stringify({
        source: "Reddit",
        medium: "<script>",
        campaign: "c".repeat(200),
        extra: "x",
      }),
    );
    expect(getAttribution()).toEqual({ source: "reddit" });
  });

  it("returns null for a stored value that is not an object", () => {
    sessionStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify("reddit"));
    expect(getAttribution()).toBeNull();
  });
});
