import { useEffect, useState } from "react";

import { useRouter } from "next/router";

import styled from "styled-components";

/* ---------------------------------------------------------------------------
 * Tree-Nation smart labels (v3), as generated in the Tree-Nation dashboard.
 *
 *   - "offset-website"  → Climate Action Website label. It has to be present in
 *                         the footer of every page: that is how Tree-Nation
 *                         registers the visits that fund trees. Rendered in the
 *                         footer, next to the Website Carbon badge.
 *   - "tree-counter"    → Tree Counter label, linking to the public Forest.
 *                         Rendered in the Forest section, as proof of the tree
 *                         total shown there.
 *
 * The script URL, the widget types and the two `data-tree-nation-code` values
 * below are the official ones, untouched. The only things a label varies are
 * `data-lang` and `data-theme`, using values the dashboard offers
 * (en | it; light, dark, white-monochrome, dark-monochrome).
 *
 * One variant of each label is mounted at a time, never every variant hidden
 * with CSS: a hidden copy is still a label on the page, and the Climate Action
 * Website one counts visits.
 * ------------------------------------------------------------------------- */

export const TREE_NATION_WIDGETS_SRC =
  "https://widgets.tree-nation.com/js/widgets/v3/widgets.min.js";

export const TREE_NATION_CODES = {
  "offset-website": "a4d3639b36ee64ed",
  "tree-counter": "c128ea8ddf37a37a",
} as const;

export type TreeNationWidgetType = keyof typeof TREE_NATION_CODES;

export type TreeNationLang = "en" | "it";
export type TreeNationTheme =
  "light" | "dark" | "white-monochrome" | "dark-monochrome";
type ColorScheme = "light" | "dark";

/* Each label picks its own look. The Climate Action Website label sits in the
   footer as a quiet credential, so it is monochrome (the carbon badge next to
   it is dimmed too, and a colourful label would be the loudest thing there).
   The Tree Counter is the Forest's headline figure, so it uses the default
   colour themes. */
const THEME_FOR_SCHEME: Record<
  TreeNationWidgetType,
  Record<ColorScheme, TreeNationTheme>
> = {
  "offset-website": { dark: "dark-monochrome", light: "white-monochrome" },
  "tree-counter": { dark: "dark", light: "light" },
};

const DARK_QUERY = "(prefers-color-scheme: dark)";

function readColorScheme(): ColorScheme {
  const attr = document.documentElement.getAttribute("data-theme");
  if (attr === "light" || attr === "dark") return attr;
  return window.matchMedia?.(DARK_QUERY).matches ? "dark" : "light";
}

/* The site theme is the `data-theme` attribute on <html> (absent = follow the
   OS). Watching both keeps the label in step with the theme menu and with the
   OS switching at sunset, without touching either of them. `null` until the
   first client effect, so server HTML and first client render match. */
function useColorScheme(): ColorScheme | null {
  const [scheme, setScheme] = useState<ColorScheme | null>(null);

  useEffect(() => {
    const update = () => setScheme(readColorScheme());
    update();

    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributeFilter: ["data-theme"],
      attributes: true,
    });
    const media = window.matchMedia?.(DARK_QUERY);
    media?.addEventListener?.("change", update);

    return () => {
      observer.disconnect();
      media?.removeEventListener?.("change", update);
    };
  }, []);

  return scheme;
}

/* The widget script scans the page for label <div>s when it *runs*, and it
   does not look again afterwards. The official snippet is therefore "script,
   then div" on every page load. In this SPA the labels are re-created on
   every language or theme change (and when a page swaps), so the script must
   run again after each one: a fresh <script> element for the same official
   URL (the browser serves it from cache), exactly like the snippet would on
   a full page load. A one-off next/script would run once, and every label
   mounted after that would stay empty.

   It still waits for the window `load` event and then for an idle moment, so
   it never competes with LCP/TBT. No consent gate: the labels are cookieless. */
function whenIdle(callback: () => void): () => void {
  let cancelled = false;
  let cancelIdle = () => {};

  const run = () => {
    if (cancelled) return;
    if (typeof window.requestIdleCallback === "function") {
      const handle = window.requestIdleCallback(callback, { timeout: 4000 });
      cancelIdle = () => window.cancelIdleCallback(handle);
    } else {
      const handle = window.setTimeout(callback, 200);
      cancelIdle = () => window.clearTimeout(handle);
    }
  };

  if (document.readyState === "complete") {
    run();
  } else {
    window.addEventListener("load", run, { once: true });
  }

  return () => {
    cancelled = true;
    cancelIdle();
    window.removeEventListener("load", run);
  };
}

/* Shared by every label on the page. The footer label and the Forest label
   mount in the same commit, so their requests coalesce into ONE script run
   (two runs would make the widget process the same label twice). Releasing a
   request before the run (variant swapped again, unmount) withdraws it, and
   the run is cancelled if nobody is waiting any more. */
let cancelScheduledScan: (() => void) | null = null;
let waitingForScan = 0;
let scanScript: HTMLScriptElement | null = null;

function injectWidgetScript(): void {
  scanScript?.remove();
  scanScript = document.createElement("script");
  scanScript.async = true;
  scanScript.src = TREE_NATION_WIDGETS_SRC;
  document.body.appendChild(scanScript);
}

function requestWidgetScan(): () => void {
  waitingForScan += 1;
  if (!cancelScheduledScan) {
    cancelScheduledScan = whenIdle(() => {
      cancelScheduledScan = null;
      waitingForScan = 0;
      injectWidgetScript();
    });
  }
  const batch = cancelScheduledScan;
  let released = false;

  return () => {
    if (released || cancelScheduledScan !== batch) return;
    released = true;
    waitingForScan -= 1;
    if (waitingForScan <= 0) {
      batch();
      cancelScheduledScan = null;
      waitingForScan = 0;
    }
  };
}

function useWidgetScan(variantKey: string | null): void {
  useEffect(() => {
    if (!variantKey) return;
    return requestWidgetScan();
  }, [variantKey]);
}

/* A label is roughly 190 × 57 px. The row is always rendered (also in the
   server HTML) so this room is reserved up front and the page does not shift
   once the third-party script fills the label in. It matches the label's real
   height: any more would show up as empty space under it. */
const LABEL_MIN_HEIGHT = "3.5rem";

const Row = styled.div`
  min-height: ${LABEL_MIN_HEIGHT};
`;

const Variant = styled.div`
  align-items: center;
  display: flex;
`;

export interface TreeNationLabelProps {
  type: TreeNationWidgetType;
  /** Lets the host (footer, Forest) place the row: margins, alignment. */
  className?: string;
}

const TreeNationLabel: React.FC<TreeNationLabelProps> = ({
  type,
  className,
}) => {
  const { locale } = useRouter();
  const scheme = useColorScheme();

  const lang: TreeNationLang = locale === "it" ? "it" : "en";
  const theme = scheme ? THEME_FOR_SCHEME[type][scheme] : null;
  const variantKey = theme ? `${lang}-${theme}` : null;

  useWidgetScan(variantKey);

  return (
    <Row className={className} data-testid={`tree-nation-${type}`}>
      {theme && (
        /* Keyed so a language or theme change replaces the label outright
           instead of mutating markup the widget has already rendered. */
        <Variant key={variantKey}>
          <div
            data-lang={lang}
            data-theme={theme}
            data-tree-nation-code={TREE_NATION_CODES[type]}
            data-widget-type={type}
          />
        </Variant>
      )}
    </Row>
  );
};

export default TreeNationLabel;
