/* ---------------------------------------------------------------------------
 * TEMPORARY — the one-year-in-Thailand anniversary (Oct 10, 2025 → Oct 10, 2026).
 *
 * An editorial celebration for the week of October 10–17, 2026. It is shown in
 * the homepage hero and beside the tree counter in the Forest section, and it
 * is deliberately not driven by the date: nothing flips on its own, so nothing
 * can go stale or switch off in the middle of a visit.
 *
 * To take it down, set `THAILAND_ANNIVERSARY.enabled` to false. The hero and the
 * Forest go back to their regular layout; the 200-tree milestone is NOT part of
 * this file and stays (it follows the milestone ladder in forestMilestones.ts).
 * To remove it for good, delete this file, components/molecules/ThailandAnniversary
 * and the places that import them.
 *
 * The Forest itself began in May 2026. The anniversary is about the move, and
 * the copy must never suggest the trees took a year to grow.
 * ------------------------------------------------------------------------- */

export type AnniversaryLocale = "en" | "it";

export interface AnniversaryCopy {
  /** The anniversary title, shown uppercase by the component. */
  label: string;
  /** First and last month of the year abroad. */
  from: string;
  to: string;
  /** The same range, written out for screen readers. */
  datesSpoken: string;
}

export const THAILAND_ANNIVERSARY = {
  enabled: true,
  copy: {
    en: {
      label: "One year in Thailand",
      from: "Oct 2025",
      to: "Oct 2026",
      datesSpoken: "October 2025 to October 2026",
    },
    it: {
      label: "Un anno in Thailandia",
      from: "Ott 2025",
      to: "Ott 2026",
      datesSpoken: "da ottobre 2025 a ottobre 2026",
    },
  } satisfies Record<AnniversaryLocale, AnniversaryCopy>,
};

export function getAnniversaryCopy(locale?: string): AnniversaryCopy {
  return locale === "it"
    ? THAILAND_ANNIVERSARY.copy.it
    : THAILAND_ANNIVERSARY.copy.en;
}
