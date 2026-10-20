/* Shared by the admin analytics API and the admin overview: the shape of the
   Google Analytics numbers, so the two can never disagree about it. */

export interface AdminAnalyticsMonth {
  /* "2026-10" (UTC calendar month). */
  month: string;
  users: number;
  sessions: number;
  pageViews: number;
}

export type AdminAnalytics =
  | { status: "ok"; months: AdminAnalyticsMonth[]; fetchedAt: string }
  /* The two secrets are not set: the card explains how to connect GA4. */
  | { status: "not_configured" }
  /* Configured but Google did not answer (bad key, no access, outage). */
  | { status: "error" };

/* How many calendar months the overview shows, the current one included. */
export const ANALYTICS_MONTHS = 6;
