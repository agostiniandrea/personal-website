import { trackContactInteraction, trackEvent } from "@lib/utils/analytics";

describe("analytics events", () => {
  afterEach(() => {
    delete window.gtag;
  });

  it("is a no-op when GA4 has not been initialized", () => {
    expect(() =>
      trackEvent("feedback_modal_opened", { locale: "en" }),
    ).not.toThrow();
  });

  it("sends a typed event through gtag", () => {
    window.gtag = jest.fn();

    trackEvent("feedback_submitted", {
      feedback_category: "Accessibility",
      locale: "en",
    });

    expect(window.gtag).toHaveBeenCalledWith("event", "feedback_submitted", {
      feedback_category: "Accessibility",
      locale: "en",
    });
  });

  it.each([
    [
      "mailto:hello@example.com",
      "contact_clicked",
      { location: "contact", method: "email" },
    ],
    [
      "https://linkedin.com/in/example",
      "social_profile_clicked",
      { location: "contact", platform: "linkedin" },
    ],
    [
      "https://github.com/example",
      "social_profile_clicked",
      { location: "contact", platform: "github" },
    ],
  ] as const)(
    "classifies %s without exposing the URL",
    (url, eventName, params) => {
      window.gtag = jest.fn();

      trackContactInteraction(url, "contact");

      expect(window.gtag).toHaveBeenCalledWith("event", eventName, params);
    },
  );

  it("ignores contact URLs outside the supported allowlist", () => {
    window.gtag = jest.fn();

    trackContactInteraction("https://example.com/private-profile", "contact");

    expect(window.gtag).not.toHaveBeenCalled();
  });
});
