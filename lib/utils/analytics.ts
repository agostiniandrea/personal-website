export const ANALYTICS_HOSTS = [
  "agostiniandrea.dev",
  "www.agostiniandrea.dev",
] as const;

export const isAnalyticsHost = (hostname: string): boolean =>
  ANALYTICS_HOSTS.some((allowedHost) => allowedHost === hostname);

type AnalyticsLocation = "contact" | "footer" | "hero";

interface AnalyticsEventParams {
  contact_clicked: {
    location: AnalyticsLocation;
    method: "email";
  };
  cv_downloaded: {
    locale: string;
  };
  feedback_modal_opened: {
    locale: string;
  };
  feedback_submitted: {
    feedback_category: string;
    locale: string;
  };
  project_opened: {
    project_name: string;
  };
  social_profile_clicked: {
    location: AnalyticsLocation;
    platform: "github" | "linkedin";
  };
}

export const trackEvent = <EventName extends keyof AnalyticsEventParams>(
  eventName: EventName,
  params: AnalyticsEventParams[EventName],
): void => {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", eventName, params);
};

export const trackContactInteraction = (
  url: string,
  location: AnalyticsLocation,
): void => {
  if (url.startsWith("mailto:")) {
    trackEvent("contact_clicked", { location, method: "email" });
  } else if (/^https?:\/\/(www\.)?linkedin\.com\//.test(url)) {
    trackEvent("social_profile_clicked", { location, platform: "linkedin" });
  } else if (/^https?:\/\/(www\.)?github\.com\//.test(url)) {
    trackEvent("social_profile_clicked", { location, platform: "github" });
  }
};
