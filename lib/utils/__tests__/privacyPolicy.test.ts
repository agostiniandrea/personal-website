import { BUSINESS_DETAILS, getPrivacyPolicy } from "@constants";

const allText = (locale: string) => {
  const policy = getPrivacyPolicy(locale);
  return [
    policy.intro,
    ...policy.sections.flatMap((section) => [
      section.heading,
      ...(section.paragraphs ?? []),
      ...(section.items ?? []).map(
        (item) => `${item.label ?? ""} ${item.text}`,
      ),
      ...(section.closing ?? []),
    ]),
  ].join("\n");
};

describe("privacy policy", () => {
  it("has the same sections, in the same order, in both languages", () => {
    const ids = (locale: string) =>
      getPrivacyPolicy(locale).sections.map((section) => section.id);

    expect(ids("it")).toEqual(ids("en"));
  });

  it("falls back to English for an unknown locale", () => {
    expect(getPrivacyPolicy(undefined)).toBe(getPrivacyPolicy("en"));
    expect(getPrivacyPolicy("fr")).toBe(getPrivacyPolicy("en"));
  });

  it.each(["en", "it"])(
    "identifies the controller and how to reach them (%s)",
    (locale) => {
      const text = allText(locale);

      expect(text).toContain(BUSINESS_DETAILS.name);
      expect(text).toContain(BUSINESS_DETAILS.kvk);
      expect(text).toContain(BUSINESS_DETAILS.street);
      expect(text).toContain(BUSINESS_DETAILS.email);
    },
  );

  it.each(["en", "it"])(
    "discloses every service the site relies on (%s)",
    (locale) => {
      const text = allText(locale);

      for (const service of [
        "Cloudflare",
        "Supabase",
        "Sydney",
        "Google Analytics",
        "Microsoft Clarity",
        "Tree-Nation",
        "Contentful",
        "Prolific",
        "autoriteitpersoonsgegevens.nl",
      ]) {
        expect(text).toContain(service);
      }
    },
  );

  it.each(["en", "it"])(
    "offers a way to change the cookie choice (%s)",
    (locale) => {
      const { cookieChoice, updated } = getPrivacyPolicy(locale);

      expect(cookieChoice.button.length).toBeGreaterThan(0);
      expect(updated).toMatch(/2026/);
    },
  );

  it("gives every section a unique id", () => {
    const ids = getPrivacyPolicy("en").sections.map((section) => section.id);

    expect(new Set(ids).size).toBe(ids.length);
  });
});
