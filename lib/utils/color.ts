/**
 * CSS colour helpers built on `color-mix`, so theme tokens (which are CSS
 * custom properties) can be made translucent or tinted without hardcoding
 * hex+alpha — `${token}80` produces `var(--x)80`, which is invalid CSS and
 * silently drops the declaration.
 */

/** A translucent variant of `color` — `percent`% colour over transparent. */
export const alpha = (color: string, percent: number): string =>
  `color-mix(in srgb, ${color} ${percent}%, transparent)`;

/** An opaque tint — `percent`% of `color` mixed into `base`. */
export const tint = (color: string, percent: number, base: string): string =>
  `color-mix(in srgb, ${color} ${percent}%, ${base})`;
