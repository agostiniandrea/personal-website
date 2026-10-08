import { useEffect, useState } from "react";

import { useRouter } from "next/router";
import Script from "next/script";

import styled from "styled-components";

import { toSpacing } from "@config/tokens";

/* ---------------------------------------------------------------------------
 * Tree-Nation smart labels (v3), as generated in the Tree-Nation dashboard.
 *
 *   - "offset-website"  → Climate Action Website label. It has to be present in
 *                         the footer of every page: that is how Tree-Nation
 *                         registers the visits that fund trees.
 *   - "tree-counter"    → Tree Counter label, linking to the public Forest.
 *
 * The script URL, the widget types and the two `data-tree-nation-code` values
 * below are the official ones, untouched. The only things this component
 * varies are `data-lang` and `data-theme`, using values the dashboard offers
 * (en | it, white-monochrome | dark-monochrome).
 *
 * One variant is mounted at a time, never every variant hidden with CSS: a
 * hidden copy is still a label on the page, and the Climate Action Website one
 * counts visits.
 * ------------------------------------------------------------------------- */

export const TREE_NATION_WIDGETS_SRC =
  "https://widgets.tree-nation.com/js/widgets/v3/widgets.min.js";

export const TREE_NATION_LABELS = [
  { code: "a4d3639b36ee64ed", type: "offset-website" },
  { code: "c128ea8ddf37a37a", type: "tree-counter" },
] as const;

export type TreeNationLang = "en" | "it";
export type TreeNationTheme = "white-monochrome" | "dark-monochrome";
type ColorScheme = "light" | "dark";

/* Monochrome on purpose: the footer is deliberately quiet (the carbon badge
   next to it is dimmed), and a colourful label would be the loudest thing in
   it. The default light/dark themes are available in the dashboard if that
   ever needs to change. */
const THEME_FOR_SCHEME: Record<ColorScheme, TreeNationTheme> = {
  dark: "dark-monochrome",
  light: "white-monochrome",
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

/* The labels are roughly 190 × 65 px. The row is always rendered (also in the
   server HTML) so this room is reserved up front and the footer does not shift
   once the third-party script fills the labels in. */
const LABEL_MIN_HEIGHT = "4.5rem";

const Row = styled.div`
  margin-top: ${toSpacing("xl")};
  min-height: ${LABEL_MIN_HEIGHT};
`;

const Variant = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${toSpacing("lg")};
  justify-content: center;
`;

const TreeNationLabels: React.FC = () => {
  const { locale } = useRouter();
  const scheme = useColorScheme();

  const lang: TreeNationLang = locale === "it" ? "it" : "en";
  const theme = scheme ? THEME_FOR_SCHEME[scheme] : null;

  return (
    <Row data-testid="tree-nation-labels">
      {theme && (
        <>
          {/* lazyOnload: injected after the window load event, so it never
              competes with the page's own LCP/TBT. Same async flavour as the
              analytics scripts, but with no consent gate: the labels are
              cookieless. */}
          <Script
            id="tree-nation-widgets"
            src={TREE_NATION_WIDGETS_SRC}
            strategy="lazyOnload"
          />
          {/* Keyed so a language or theme change replaces the labels outright
              instead of mutating markup the widget has already rendered. */}
          <Variant key={`${lang}-${theme}`}>
            {TREE_NATION_LABELS.map(({ code, type }) => (
              <div
                key={type}
                data-lang={lang}
                data-theme={theme}
                data-tree-nation-code={code}
                data-widget-type={type}
              />
            ))}
          </Variant>
        </>
      )}
    </Row>
  );
};

export default TreeNationLabels;
