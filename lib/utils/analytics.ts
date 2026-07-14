export const ANALYTICS_HOSTS = [
  "agostiniandrea.dev",
  "www.agostiniandrea.dev",
] as const;

export const isAnalyticsHost = (hostname: string): boolean =>
  ANALYTICS_HOSTS.some((allowedHost) => allowedHost === hostname);
