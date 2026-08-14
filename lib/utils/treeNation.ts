import type { SupabaseClient } from "@supabase/supabase-js";

export const TREE_NATION_FOREST_SLUG = "andrea-agostini-103769";
/* The impact endpoint keys off the numeric profile id, not the slug. */
const TREE_NATION_PROFILE_ID = 941526;

const SYNC_ROW_ID = "tree-nation";
/* Two clocks, because the two halves of this data move at different speeds.
   The counters are the section's headline figures and change the moment a tree
   lands, so they follow the page's own ISR cadence — a day-old total meant the
   site missed the exact moment the forest hit its season target. The projects a
   forest sits in and their species change rarely, and resolving species costs
   one request per species, so those stay on a daily window. */
/* The counters and the per-project breakdown come from two independent
   endpoints and are meant to agree: the projects must sum to the total, which
   is what makes the section verifiable. Refreshing them on different clocks
   broke that — the total moved hourly while the breakdown sat a day behind, so
   the page showed 56 trees above a list adding up to 51. They now share one
   clock, which costs a single extra request per hour.

   Species stay on the slow clock: they cost one request each, and a species
   list genuinely does not change. */
const COUNTERS_STALE_AFTER_MS = 60 * 60 * 1000;
const SPECIES_STALE_AFTER_MS = 24 * 60 * 60 * 1000;
const FETCH_TIMEOUT_MS = 8000;

interface ForestSyncRow {
  id: string;
  tree_count: number;
  month_count: number | null;
  projects: ForestProject[] | null;
  species: ForestSpecies[] | null;
  /** When the counters were last read. Null on rows written before the split. */
  counters_synced_at: string | null;
  /** When the projects and species were last resolved. */
  synced_at: string;
}

export interface ForestProject {
  id: number;
  name: string;
  slug: string;
  /** ISO 3166-1 alpha-2, resolved to a display name at render time. */
  country: string;
  trees: number;
}

export interface ForestSpecies {
  /** The common name as Tree-Nation lists it, e.g. "Sengon". */
  label: string;
  /** Botanical name, e.g. "Paraserianthes falcataria". */
  scientific: string;
  /** Tree-Nation's own classification, e.g. "Fast-growing". */
  category: string;
  /** "Native" or "Introduced". */
  origin: string;
  /** Kilograms captured over the tree's lifetime. */
  co2Kg: number;
}

export interface ForestData {
  /** Every tree in the forest since it opened. */
  total: number | null;
  /** Trees planted in the current calendar month. */
  month: number | null;
  /** The projects the forest is spread across, largest first. */
  projects: ForestProject[];
  /** Detail for the species named on the featured project's card. */
  species: ForestSpecies[];
}

/* Both counter endpoints are public; the token (when present) is sent for
   consistency with the authenticated endpoints and future-proofing */
async function fetchCounter(path: string): Promise<number> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const headers: Record<string, string> = { Accept: "application/json" };
    if (process.env.TREE_NATION_API_TOKEN) {
      headers.Authorization = `Bearer ${process.env.TREE_NATION_API_TOKEN}`;
    }
    const res = await fetch(
      `https://tree-nation.com/api/forests/${TREE_NATION_FOREST_SLUG}/${path}`,
      { headers, signal: controller.signal },
    );
    if (!res.ok) throw new Error(`Tree-Nation responded ${res.status}`);
    /* The month endpoint returns the count as a string ("8"), the total as a
       number — Number() normalises both. */
    const data = (await res.json()) as { count?: number | string };
    const count = Number(data.count);
    if (!Number.isFinite(count) || count < 0) {
      throw new Error(`Tree-Nation returned an invalid count: ${data.count}`);
    }
    return count;
  } finally {
    clearTimeout(timeout);
  }
}

interface ImpactProject {
  project_id?: number;
  project_name?: string;
  project_slug?: string;
  project_location?: string;
  trees?: number;
}

/* Undocumented endpoint — it is what tree-nation.com's own profile page calls,
   so it can change without notice. Everything downstream is written to survive
   that: the result is cached, and a failure keeps serving the last good list.

   `to` is required. Without it the endpoint answers 200 with an empty
   aggregate instead of an error, so an empty list is treated as a failure
   rather than as a forest that grows in no projects. */
async function fetchProjects(now: Date): Promise<ForestProject[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const to = `${now.toISOString().slice(0, 10)} 23:59:59`;
    const res = await fetch(
      `https://tree-nation.com/impactPeriods?profile_id=${TREE_NATION_PROFILE_ID}` +
        `&to=${encodeURIComponent(to)}`,
      {
        headers: { Accept: "application/json", "X-API-VERSION": "1" },
        signal: controller.signal,
      },
    );
    if (!res.ok) throw new Error(`Tree-Nation responded ${res.status}`);
    const data = (await res.json()) as {
      aggregated?: { planted?: ImpactProject[] };
    };
    const planted = data.aggregated?.planted ?? [];
    const projects = planted
      .filter((p) => p.project_name && Number(p.trees) > 0)
      .map((p) => ({
        id: Number(p.project_id),
        name: String(p.project_name),
        slug: String(p.project_slug ?? ""),
        country: String(p.project_location ?? ""),
        trees: Number(p.trees),
      }))
      .sort((a, b) => b.trees - a.trees);
    if (projects.length === 0) {
      throw new Error("Tree-Nation returned no planted projects");
    }
    return projects;
  } finally {
    clearTimeout(timeout);
  }
}

interface SpeciesDetail {
  name?: string;
  common_names?: string;
  category?: { name?: string };
  origin_type?: { name?: string };
  life_time_CO2?: number;
}

/* Tree-Nation lists a project's species by botanical name only, while the CMS
   names them the way a reader would ("Sengon"). The bridge is `common_names`
   on the species detail, so matching happens on real data rather than on a
   hand-kept mapping that would rot the moment a species changed.

   Both endpoints are documented. Details are fetched one per species, which is
   why this only ever runs behind the 24h cache. */
async function fetchSpecies(
  projectId: number,
  wanted: string[],
): Promise<ForestSpecies[]> {
  if (!projectId || wanted.length === 0) return [];
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS * 3);
  const headers = { Accept: "application/json", "X-API-VERSION": "1" };
  try {
    const listRes = await fetch(
      `https://tree-nation.com/api/projects/${projectId}/species`,
      { headers, signal: controller.signal },
    );
    if (!listRes.ok) throw new Error(`Tree-Nation responded ${listRes.status}`);
    const list = (await listRes.json()) as { id?: number }[];

    const targets = wanted.map((w) => w.trim().toLowerCase());
    const found = new Map<string, ForestSpecies>();

    for (const entry of list) {
      if (found.size === targets.length) break;
      if (!entry.id) continue;
      const res = await fetch(
        `https://tree-nation.com/api/species/${entry.id}`,
        { headers, signal: controller.signal },
      );
      if (!res.ok) continue;
      const detail = (await res.json()) as SpeciesDetail;
      /* "Sengon (Indonesia); Moluccan albizia; Batai" — match the bare name so
         a regional qualifier does not defeat it. */
      const commons = (detail.common_names ?? "")
        .split(";")
        .map((c) => c.split("(")[0].trim())
        .filter(Boolean);
      const hit = commons.find((c) => targets.includes(c.toLowerCase()));
      if (!hit || found.has(hit.toLowerCase())) continue;
      found.set(hit.toLowerCase(), {
        label: hit,
        scientific: String(detail.name ?? ""),
        category: String(detail.category?.name ?? ""),
        origin: String(detail.origin_type?.name ?? ""),
        co2Kg: Number(detail.life_time_CO2) || 0,
      });
    }
    /* Keep the CMS order so the card reads as it is authored. */
    return targets
      .map((t) => found.get(t))
      .filter((s): s is ForestSpecies => Boolean(s));
  } finally {
    clearTimeout(timeout);
  }
}

function sameCalendarMonth(a: Date, b: Date): boolean {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth()
  );
}

/**
 * Returns the verified Tree-Nation figures.
 *
 * Two clocks, split by cost rather than by kind: the counters and the project
 * breakdown refresh together every hour because they have to agree with each
 * other, while the species detail refreshes daily because it costs a request
 * per species and never moves. Each half degrades on its own — a failure on one
 * keeps serving the last good values for it without touching the other.
 *
 * Returns nulls when nothing has ever been synced; callers keep their own
 * fallback (the Contentful treeCount).
 */
export async function getForestData(
  supabase: SupabaseClient,
  /* The card names its species in the CMS; pass the project they belong to and
     the names to resolve, and the detail comes back from Tree-Nation. */
  featured?: { projectSlug?: string; speciesNames?: string[] },
): Promise<ForestData> {
  let lastKnown: ForestSyncRow | null = null;

  try {
    const { data } = await supabase
      .from("forest_sync")
      .select(
        "id, tree_count, month_count, projects, species, counters_synced_at, synced_at",
      )
      .eq("id", SYNC_ROW_ID)
      .maybeSingle();
    lastKnown = data ?? null;
  } catch (err) {
    console.error("forest_sync read failed:", err);
  }

  const now = new Date();
  const countersAt = lastKnown?.counters_synced_at
    ? new Date(lastKnown.counters_synced_at)
    : null;
  const speciesAt = lastKnown?.synced_at ? new Date(lastKnown.synced_at) : null;

  /* The monthly figure resets on the 1st, so a value from a previous month is
     wrong however recently it was written. */
  const countersFresh =
    countersAt !== null &&
    now.getTime() - countersAt.getTime() < COUNTERS_STALE_AFTER_MS &&
    sameCalendarMonth(countersAt, now);
  const speciesFresh =
    speciesAt !== null &&
    now.getTime() - speciesAt.getTime() < SPECIES_STALE_AFTER_MS;

  let total = lastKnown?.tree_count ?? null;
  let month =
    countersAt && sameCalendarMonth(countersAt, now)
      ? (lastKnown?.month_count ?? null)
      : null;
  let projects = lastKnown?.projects ?? [];
  let species = lastKnown?.species ?? [];

  /* Only what actually refreshed is written back, so one half going stale
     never overwrites the other with older values. */
  const patch: Record<string, unknown> = {};

  if (!countersFresh) {
    const [totalResult, monthResult] = await Promise.allSettled([
      fetchCounter("tree_counter"),
      fetchCounter("tree_counter/month"),
    ]);
    if (totalResult.status === "fulfilled") {
      total = totalResult.value;
      month = monthResult.status === "fulfilled" ? monthResult.value : null;
      patch.tree_count = total;
      patch.month_count = month;
      patch.counters_synced_at = now.toISOString();
    } else {
      console.error("Tree-Nation counter failed:", totalResult.reason);
    }
    if (monthResult.status === "rejected") {
      console.error("Tree-Nation month counter failed:", monthResult.reason);
    }

    /* Refreshed beside the counters so the breakdown always sums to the total
       the page just showed. A failure here leaves counters_synced_at written,
       so the retry waits for the next cycle — an hour of extra staleness on a
       list that barely moves, against re-fetching it on every single request. */
    try {
      projects = await fetchProjects(now);
      patch.projects = projects;
    } catch (err) {
      /* Keeps the last good list rather than blanking the block: the projects
         a forest sits in do not change often, so stale beats absent. */
      console.error("Tree-Nation impact fetch failed:", err);
    }
  }

  if (!speciesFresh) {
    /* Resolved against whichever project list we hold — freshly fetched above,
       or the cached one when the counters were still fresh. */
    const featuredProject = featured?.projectSlug
      ? projects.find((p) => p.slug === featured.projectSlug)
      : undefined;
    if (featuredProject && featured?.speciesNames?.length) {
      try {
        species = await fetchSpecies(featuredProject.id, featured.speciesNames);
        patch.species = species;
        patch.synced_at = now.toISOString();
      } catch (err) {
        console.error("Tree-Nation species fetch failed:", err);
      }
    }
  }

  /* tree_count is NOT NULL, so a first-ever insert cannot be written without
     one — with no total there is nothing worth persisting anyway. */
  if (Object.keys(patch).length > 0 && total !== null) {
    const { error } = await supabase
      .from("forest_sync")
      .upsert({ id: SYNC_ROW_ID, tree_count: total, ...patch });
    if (error) console.error("forest_sync upsert failed:", error.message);
  }

  return { total, month, projects, species };
}
