/* ---------------------------------------------------------------------------
 * Colour theme: three choices, but only two of them are values.
 *
 * "System" is the *absence* of the attribute, not a third one. With no
 * data-theme on <html> the `@media (prefers-color-scheme)` block in
 * globalStyles decides, which buys three things for free: a visitor who never
 * touches the control runs no theme JavaScript after load, their OS switching
 * at sunset is followed live without a listener, and there is no third palette
 * to keep in sync. Storing "system" as a value would have meant re-writing in
 * JS what the cascade already does correctly.
 *
 * The attribute is therefore the source of truth for *which choice is active*:
 * it is present if and only if the visitor made an explicit one. localStorage
 * only carries that choice to the next page load.
 * ------------------------------------------------------------------------- */

export type ThemeChoice = "light" | "system" | "dark";

export const THEME_STORAGE_KEY = "theme-choice";

/* System sits in the middle: it is the neutral point between the two extremes,
   and the order doubles as the arrow-key order inside the control. */
export const THEME_CHOICES: ThemeChoice[] = ["light", "system", "dark"];

export function readThemeChoice(): ThemeChoice {
  if (typeof document === "undefined") return "system";
  const attr = document.documentElement.getAttribute("data-theme");
  return attr === "light" || attr === "dark" ? attr : "system";
}

export function applyThemeChoice(choice: ThemeChoice): void {
  const root = document.documentElement;
  if (choice === "system") {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", choice);
  }

  try {
    if (choice === "system") {
      window.localStorage.removeItem(THEME_STORAGE_KEY);
    } else {
      window.localStorage.setItem(THEME_STORAGE_KEY, choice);
    }
  } catch {
    /* Blocked storage (private mode, hardened browsers): the choice still
       applies to this page, it just will not survive a reload. Throwing here
       would break the toggle for people whose only sin is a strict browser. */
  }
}

/* Runs before first paint, next to the mobile-view script in _document. An
   explicit choice that contradicts the OS (light UI on a dark system) would
   otherwise paint the wrong palette for one frame — and on this site that
   frame is a full-bleed near-black background. */
export const PRE_HYDRATION_THEME_SCRIPT = `(function(){try{var c=localStorage.getItem('${THEME_STORAGE_KEY}');if(c==='light'||c==='dark')document.documentElement.setAttribute('data-theme',c);}catch(e){}})()`;
