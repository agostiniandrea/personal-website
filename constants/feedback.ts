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
