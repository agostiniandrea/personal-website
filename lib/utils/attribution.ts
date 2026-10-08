import { useEffect } from "react";

/* ---------------------------------------------------------------------------
 * Marketing attribution
 *
 * Tells the feedback system which campaign a submission came from, so a paid
 * campaign can be judged by the feedback it produces rather than by traffic.
 * It is metadata only: it never decides `source`, never touches counting, and
 * never reaches the Forest counters.
 *
 * Deliberately independent of analytics. It does not use GA4 or Clarity and
 * does not look at the cookie-consent choice, so a visitor who rejects
 * analytics still carries their campaign to the feedback form. The tags are
 * first-party, non-identifying and live only in sessionStorage for the tab.
 *
 * First touch: the first valid UTM set seen in a session is the one kept. A
 * later UTM link never overwrites it, and a URL without UTM never clears it,
 * so Reddit -> home -> Forest -> feedback keeps its Reddit attribution.
 *
 * The homepage is prerendered (getStaticProps + ISR), so the query string is
 * invisible on the server. Capture has to happen client-side, after hydration
 * — the same constraint lib/utils/prolific.ts works under.
 *
 * Every value is untrusted public input (anyone can craft a link). The same
 * sanitiser runs when capturing, when reading storage back and again on the
 * server in pages/api/feedback.ts.
 * ------------------------------------------------------------------------- */

export const ATTRIBUTION_STORAGE_KEY = "marketing-attribution";

/** Per value, after trimming. Mirrored by a check constraint in the database. */
export const ATTRIBUTION_MAX_LENGTH = 100;

const FIELDS = ["source", "medium", "campaign", "content", "term"] as const;

export type AttributionField = (typeof FIELDS)[number];

export type Attribution = Partial<Record<AttributionField, string>>;

const PARAM_NAMES: Record<AttributionField, string> = {
  source: "utm_source",
  medium: "utm_medium",
  campaign: "utm_campaign",
  content: "utm_content",
  term: "utm_term",
};

/* Printable and unremarkable: letters and digits of any script, a plain space,
   and the punctuation real UTM values use. No angle brackets, quotes,
   semicolons, backslashes, control characters or line breaks. */
const ALLOWED_VALUE = /^[\p{L}\p{N} ._\-~:+/|,()%@]+$/u;

/* A cheap ceiling before any regex runs, so a megabyte-long value costs
   nothing to reject. Far above the real limit on purpose. */
const RAW_CEILING = 1000;

/**
 * Trim, lowercase, then accept or discard. A value that is empty, too long or
 * carries a character outside the whitelist becomes null — it is dropped, not
 * truncated or repaired, because a partial junk value is worse than none.
 */
export function sanitizeAttributionValue(value: unknown): string | null {
  if (typeof value !== "string" || value.length > RAW_CEILING) return null;
  const cleaned = value.trim().toLowerCase();
  if (cleaned.length === 0 || cleaned.length > ATTRIBUTION_MAX_LENGTH) {
    return null;
  }
  return ALLOWED_VALUE.test(cleaned) ? cleaned : null;
}

/**
 * Keeps whichever of the five fields are valid; null when none is. Takes
 * `unknown` because it also reads sessionStorage and the request body, both of
 * which are writable by the visitor. Unknown keys are ignored, never copied.
 */
export function sanitizeAttribution(raw: unknown): Attribution | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const input = raw as Record<string, unknown>;
  const result: Attribution = {};
  for (const field of FIELDS) {
    const value = sanitizeAttributionValue(input[field]);
    if (value !== null) result[field] = value;
  }
  return Object.keys(result).length > 0 ? result : null;
}

/** Pure, so the parsing rules can be tested without a browser. */
export function parseAttribution(search: string): Attribution | null {
  const params = new URLSearchParams(search);
  const found: Record<string, string | null> = {};
  for (const field of FIELDS) {
    found[field] = params.get(PARAM_NAMES[field]);
  }
  return sanitizeAttribution(found);
}

/** Re-validates on read: sessionStorage is user-writable. */
export function getAttribution(): Attribution | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(ATTRIBUTION_STORAGE_KEY);
    return raw ? sanitizeAttribution(JSON.parse(raw)) : null;
  } catch {
    /* Private modes can refuse storage, and a hand-edited entry can be
       invalid JSON. Either way the visit is simply unattributed. */
    return null;
  }
}

/**
 * First touch wins. Anything already stored is returned untouched, whatever
 * the current URL carries; only an unattributed session can capture.
 */
export function captureAttribution(): Attribution | null {
  if (typeof window === "undefined") return null;

  const stored = getAttribution();
  if (stored) return stored;

  const fromUrl = parseAttribution(window.location.search);
  if (!fromUrl) return null;

  try {
    sessionStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(fromUrl));
  } catch {
    /* Nothing to do — the submission simply won't carry the attribution. */
  }
  return fromUrl;
}

/** Captures once per tab, on landing. Renders nothing, changes nothing. */
export function useAttributionCapture(): void {
  useEffect(() => {
    captureAttribution();
  }, []);
}
