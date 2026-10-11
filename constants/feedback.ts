/**
 * Shortest message the feedback form accepts.
 *
 * It is a junk gate, not a quality gate. Everything genuinely low-effort sits
 * under 15 characters — "ok", "asdasd", "great site", "good website" — while a
 * real one-line report often lands in the twenties: "font too small on mobile"
 * is 24, "contrast too low on CTA" is 23. Twenty stops the first group without
 * turning away the second; thirty starts refusing useful feedback.
 *
 * Lives here because both the form and the API must agree on it. If they drift,
 * the form lets someone past its own Continue button and the request then
 * fails — the one failure mode a visitor cannot do anything about.
 */
export const FEEDBACK_MESSAGE_MIN_LENGTH = 20;

/**
 * Longest message the feedback form accepts, measured after trimming.
 *
 * The other half of the junk gate: the minimum keeps out one-word noise, this
 * keeps out a pasted wall of text. A thorough bug report with steps and
 * expectations fits comfortably in 2,000 characters (about 300 words); beyond
 * that the field is being used as a dumping ground, not a feedback form.
 *
 * Lives next to the minimum for the same reason: the form's textarea and the
 * API must agree, otherwise the form lets someone write what the API then
 * refuses. The textarea enforces it with `maxLength`, so a legitimate visitor
 * cannot exceed it by accident.
 */
export const FEEDBACK_MESSAGE_MAX_LENGTH = 2000;

/** Optional credit name. Unchanged: this was already the limit in both places. */
export const FEEDBACK_NAME_MAX_LENGTH = 100;

/** RFC 5321 caps an address at 254 characters; nothing longer can be real. */
export const FEEDBACK_EMAIL_MAX_LENGTH = 254;

/** Each of the optional LinkedIn / GitHub / website links. 2,048 is the
    practical ceiling browsers and most servers accept for a URL. */
export const FEEDBACK_URL_MAX_LENGTH = 2048;

/**
 * `code` the API sends with the HTTP 400 for a submission its content rules
 * refuse. The form reads it to show a message about the content rather than the
 * generic "something went wrong". It deliberately says nothing about *which*
 * rule matched.
 */
export const FEEDBACK_CONTENT_REJECTED_CODE = "content_rejected";
