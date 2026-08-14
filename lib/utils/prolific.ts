import { useEffect } from "react";

/* ---------------------------------------------------------------------------
 * Prolific usability study
 *
 * A recruited participant arrives on the ordinary homepage through a link that
 * carries three URL parameters. Nothing about the page changes: the ids are
 * read once after hydration, kept in sessionStorage for the tab, and attached
 * to the feedback submission at the end. They are never rendered.
 *
 * sessionStorage rather than localStorage on purpose — a participant id must
 * not outlive the tab and reappear on a genuine visit weeks later.
 *
 * The homepage is prerendered (getStaticProps + ISR), so the query string is
 * invisible on the server. Capture has to happen client-side.
 * ------------------------------------------------------------------------- */

export const PROLIFIC_STORAGE_KEY = "prolific-session";

/** Prolific's own placeholders, as configured in the study's external URL. */
const PARAM_NAMES = {
  prolificPid: "PROLIFIC_PID",
  studyId: "STUDY_ID",
  sessionId: "SESSION_ID",
} as const;

export interface ProlificSession {
  /** Pseudonymous participant id. Identifies the session as a study one. */
  prolificPid: string;
  /** Present in practice, but never assumed: the link is editable. */
  studyId?: string;
  /** One Prolific submission. Used as the de-duplication key server-side. */
  sessionId?: string;
}

/* Prolific ids are 24-character hex strings today. Matching that exactly would
   break the day they change format, so this only rejects what could not be an
   id — anything long, empty, or carrying characters a query string should not
   round-trip. */
const ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

export const isValidProlificId = (value: unknown): value is string =>
  typeof value === "string" && ID_PATTERN.test(value);

/** Pure, so the parsing rules can be tested without a browser. */
export function parseProlificSession(search: string): ProlificSession | null {
  const params = new URLSearchParams(search);
  const prolificPid = params.get(PARAM_NAMES.prolificPid);

  /* The pid alone marks a participant. Without it there is no one to attribute
     a submission to, so the visit is an ordinary one whatever else the URL
     carries — including Prolific's unsubstituted "{{%PROLIFIC_PID%}}" when a
     link is opened outside a real study. */
  if (!isValidProlificId(prolificPid)) return null;

  const studyId = params.get(PARAM_NAMES.studyId);
  const sessionId = params.get(PARAM_NAMES.sessionId);

  return {
    prolificPid,
    ...(isValidProlificId(studyId) && { studyId }),
    ...(isValidProlificId(sessionId) && { sessionId }),
  };
}

/** Re-validates on read: sessionStorage is user-writable. */
function parseStoredSession(raw: string | null): ProlificSession | null {
  if (!raw) return null;
  try {
    const stored = JSON.parse(raw) as Partial<ProlificSession>;
    if (!isValidProlificId(stored.prolificPid)) return null;
    return {
      prolificPid: stored.prolificPid,
      ...(isValidProlificId(stored.studyId) && { studyId: stored.studyId }),
      ...(isValidProlificId(stored.sessionId) && {
        sessionId: stored.sessionId,
      }),
    };
  } catch {
    return null;
  }
}

export function getProlificSession(): ProlificSession | null {
  if (typeof window === "undefined") return null;
  try {
    return parseStoredSession(sessionStorage.getItem(PROLIFIC_STORAGE_KEY));
  } catch {
    /* Private modes can refuse storage entirely; a participant who cannot
       store is simply treated as an ordinary visitor. */
    return null;
  }
}

/* The parameters stay in the address bar. Every internal navigation on this
   site already carries window.location.search forward (see MobileNav's
   routeWithHash and SiteHeader's logo handler), and stripping them would lose
   the ids on a reload in a new tab. */
export function captureProlificSession(): ProlificSession | null {
  if (typeof window === "undefined") return null;

  const fromUrl = parseProlificSession(window.location.search);
  const stored = getProlificSession();

  /* A stored session wins: the ids were captured on the landing URL, and a
     later navigation could arrive without them. */
  if (!fromUrl) return stored;
  if (stored?.prolificPid === fromUrl.prolificPid) return stored;

  try {
    sessionStorage.setItem(PROLIFIC_STORAGE_KEY, JSON.stringify(fromUrl));
  } catch {
    /* Nothing to do — the submission simply won't carry the ids. */
  }
  return fromUrl;
}

/**
 * Where a participant is sent once the feedback is in. Read from the
 * environment so no study-specific value lives in the code and the return
 * link cannot exist at all on a normal deploy.
 */
export function getProlificCompletionUrl(): string | null {
  const configured = process.env.NEXT_PUBLIC_PROLIFIC_COMPLETION_URL;
  if (!configured) return null;
  try {
    /* An https URL only. The value is set by me at build time, so this guards
       a typo rather than an attacker. */
    return new URL(configured).protocol === "https:" ? configured : null;
  } catch {
    return null;
  }
}

/** Captures once per tab, on landing. Renders nothing, changes nothing. */
export function useProlificCapture(): void {
  useEffect(() => {
    captureProlificSession();
  }, []);
}
