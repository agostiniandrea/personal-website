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

  /* Clay as small text: the brand Clay (#C96F53) is only 3.4:1 on Paper, so
     text takes this darker value on light and a lighter one on dark. */
  clayText: "var(--color-clay-text)",

  /* Sticky header once the page has scrolled: Ivory with a little
     translucency, deep forest on dark. */
  headerBg: "var(--color-header-bg)",

  /* Text over photography and over the forest panel: always Ivory, in both
     themes, because the image underneath does not change with the theme. */
  onImage: "var(--color-on-image)",
  onImageMuted: "var(--color-on-image-muted)",
};
