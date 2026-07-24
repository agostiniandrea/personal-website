export const ANALYTICS_HOSTS = [
  "agostiniandrea.dev",
  "www.agostiniandrea.dev",
] as const;

export const isAnalyticsHost = (hostname: string): boolean =>
  ANALYTICS_HOSTS.some((allowedHost) => allowedHost === hostname);

type AnalyticsLocation = "contact" | "footer" | "hero" | "more";

interface AnalyticsEventParams {
  contact_clicked: {
    location: AnalyticsLocation;
    method: "email";
  };
  cv_downloaded: {
    locale: string;
  };
  feedback_flow_start: {
    locale: string;
    source: "nudge" | "forest";
  };
  feedback_modal_opened: {
    locale: string;
  };
  feedback_nudge_click: {
    locale: string;
  };
  feedback_nudge_dismiss: {
    locale: string;
  };
  feedback_nudge_view: {
    locale: string;
  };
  feedback_submit: {
    feedback_category: string;
    locale: string;
  };
  feedback_submitted: {
    feedback_category: string;
    locale: string;
  };
  forest_co2_tooltip_open: {
    device_type: "mobile" | "desktop";
    locale: string;
    project_id: string;
  };
  forest_feedback_nudge_click: {
    locale: string;
  };
  forest_feedback_nudge_dismiss: {
    locale: string;
  };
  forest_feedback_nudge_view: {
    locale: string;
  };
  forest_teaser_click: {
    locale: string;
  };
  forest_view: {
    locale: string;
    source: "tab" | "scroll";
  };
  mobile_more_destination: {
    destination: string;
  };
  mobile_more_open: Record<string, never>;
  mobile_tab_forest: Record<string, never>;
  mobile_tab_home: Record<string, never>;
  mobile_tab_story: Record<string, never>;
  mobile_tab_work: Record<string, never>;
  project_opened: {
    project_name: string;
  };
  section_view: {
    section_name: string;
  };
  social_profile_clicked: {
    location: AnalyticsLocation;
    platform: "github" | "linkedin";
  };
  story_experience_view: Record<string, never>;
  story_journey_view: Record<string, never>;
}

/* Single sink for both GA and Clarity custom events; callers guard against
   rerender duplicates themselves (see trackOnce) */
export const trackEvent = <EventName extends keyof AnalyticsEventParams>(
  eventName: EventName,
  params: AnalyticsEventParams[EventName],
): void => {
  if (typeof window === "undefined") return;
  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, params);
  }
  if (typeof window.clarity === "function") {
    window.clarity("event", eventName);
  }
};

const firedOnce = new Set<string>();

/* Emits at most once per page load for a given key — protects
   view-style events from React rerenders and effect re-runs */
export const trackOnce = <EventName extends keyof AnalyticsEventParams>(
  eventName: EventName,
  params: AnalyticsEventParams[EventName],
  key: string = eventName,
): void => {
  if (firedOnce.has(key)) return;
  firedOnce.add(key);
  trackEvent(eventName, params);
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
