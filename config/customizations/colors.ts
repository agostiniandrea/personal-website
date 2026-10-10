export const colors = {
  // elements
  background: "var(--color-background)",
  headline: "var(--color-headline)",
  paragraph: "var(--color-paragraph)",
  button: "var(--color-button)",
  button_text: "var(--color-button-text)",

  // illustration
  stroke: "var(--color-stroke)",
  main: "var(--color-main)",
  /* Section dividers only. Kept apart from `main`, which the body inherits as
     its text colour — a value quiet enough for a 1px rule is unreadable as
     text, and a value readable as text draws a heavy line. */
  border: "var(--color-border)",
  highlight: "var(--color-highlight)",
  secondary: "var(--color-secondary)",
  tertiary: "var(--color-tertiary)",

  // surface & accent tokens
  surface: "var(--color-surface)",
  surfaceRaised: "var(--color-surface-raised)",
  badgeBg: "var(--color-badge-bg)",
  ringStart: "var(--color-ring-start)",
  ringEnd: "var(--color-ring-end)",

  /* The one celebratory gold, always an accent next to the teal and never a
     surface: the hero badge, the milestone leaf, the headline words, the reached
     badge, the anniversary title. Like the teal it has a value per theme, because
     the bright gold that suits the dark ground is unreadable as text on the
     light one (1.6:1 there against 4.7:1 for the darker value). */
  milestone: "var(--color-milestone)",

  /* The deep navy of the Thai flag, for the anniversary title only. On the dark
     ground it falls back to the headline colour, since navy would vanish. */
  thaiNavy: "var(--color-thai-navy)",
};
