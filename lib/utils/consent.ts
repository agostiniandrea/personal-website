/* ---------------------------------------------------------------------------
 * Cookie-consent choice
 *
 * One place that reads and writes the visitor's choice, shared by the banner
 * (which asks) and the app shell (which decides whether analytics may load).
 *
 * `localStorage` is not guaranteed to exist: it throws when a browser blocks
 * site data, in some private modes and in some embedded browsers, and merely
 * touching `window.localStorage` can throw too. An unreadable choice is treated
 * as "no choice yet" and a failed write is ignored, so a visitor with blocked
 * storage still gets the banner and a page that works; the choice simply does
 * not survive the tab.
 * ------------------------------------------------------------------------- */

export const CONSENT_KEY = "cookie-consent";

export type ConsentValue = "accepted" | "rejected" | "custom";

export function readConsent(): string | null {
  try {
    return window.localStorage.getItem(CONSENT_KEY);
  } catch {
    return null;
  }
}

/** Returns whether the choice was actually stored. */
export function writeConsent(value: ConsentValue): boolean {
  try {
    window.localStorage.setItem(CONSENT_KEY, value);
    return true;
  } catch {
    return false;
  }
}
