/**
 * Hostnames that may be indexed by search engines. Every other host that can
 * serve the site (Cloudflare trial domain, `*.workers.dev`, Vercel previews,
 * localhost) must be `noindex` so it never competes with the real site.
 */
const INDEXABLE_HOSTS = new Set([
  "agostiniandrea.dev",
  "www.agostiniandrea.dev",
]);

export const ROBOTS_INDEX = "index, follow";
export const ROBOTS_NOINDEX = "noindex, nofollow";

/** Returns the `x-robots-tag` value for the given Host header. */
export function getRobotsHeader(host: string | null | undefined): string {
  const hostname = (host ?? "").split(":")[0].trim().toLowerCase();
  return INDEXABLE_HOSTS.has(hostname) ? ROBOTS_INDEX : ROBOTS_NOINDEX;
}
