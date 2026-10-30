/**
 * Hostnames that may be indexed by search engines. Every other host that can
 * serve the site (Cloudflare trial domain, `*.workers.dev`, staging,
 * localhost) must be `noindex` so it never competes with the real site.
 */
const INDEXABLE_HOSTS = new Set([
  "agostiniandrea.dev",
  "www.agostiniandrea.dev",
]);

export const ROBOTS_INDEX = "index, follow";
export const ROBOTS_NOINDEX = "noindex, nofollow";

/* The private admin area, in every locale. Never indexable, even on the
   production host. */
const isAdminPath = (pathname: string | null | undefined): boolean =>
  /^(\/(en|it))?\/admin(\/|$)/.test(pathname ?? "");

/** Returns the `x-robots-tag` value for the given Host header (and path). */
export function getRobotsHeader(
  host: string | null | undefined,
  pathname?: string | null,
): string {
  if (isAdminPath(pathname)) return ROBOTS_NOINDEX;
  const hostname = (host ?? "").split(":")[0].trim().toLowerCase();
  return INDEXABLE_HOSTS.has(hostname) ? ROBOTS_INDEX : ROBOTS_NOINDEX;
}
