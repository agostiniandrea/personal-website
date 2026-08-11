import type { SupabaseClient } from "@supabase/supabase-js";

export const TREE_NATION_FOREST_SLUG = "andrea-agostini-103769";

const SYNC_ROW_ID = "tree-nation";
const STALE_AFTER_MS = 24 * 60 * 60 * 1000;
const FETCH_TIMEOUT_MS = 8000;

interface ForestSyncRow {
  id: string;
  tree_count: number;
  month_count: number | null;
  synced_at: string;
}

export interface ForestCounts {
  /** Every tree in the forest since it opened. */
  total: number | null;
  /** Trees planted in the current calendar month. */
  month: number | null;
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

function sameCalendarMonth(a: Date, b: Date): boolean {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth()
  );
}

/**
 * Returns the verified Tree-Nation counters, syncing at most once per 24h
 * window. Falls back to the last synced values when Tree-Nation is
 * unavailable, and to null when nothing has ever been synced — callers should
 * then keep their own fallback (the Contentful treeCount).
 */
export async function getForestCounts(
  supabase: SupabaseClient,
): Promise<ForestCounts> {
  let lastKnown: ForestSyncRow | null = null;

  try {
    const { data } = await supabase
      .from("forest_sync")
      .select("id, tree_count, month_count, synced_at")
      .eq("id", SYNC_ROW_ID)
      .maybeSingle();
    lastKnown = data ?? null;
  } catch (err) {
    console.error("forest_sync read failed:", err);
  }

  const now = new Date();
  const syncedAt = lastKnown ? new Date(lastKnown.synced_at) : null;
  /* The monthly figure resets on the 1st, so a cached value from a previous
     month is wrong however recently it was written — a sync inside the 24h
     window on 31 Aug would otherwise still be served on 1 Sep. */
  const isFresh =
    syncedAt !== null &&
    now.getTime() - syncedAt.getTime() < STALE_AFTER_MS &&
    sameCalendarMonth(syncedAt, now);

  if (lastKnown && isFresh) {
    return { total: lastKnown.tree_count, month: lastKnown.month_count };
  }

  try {
    /* One failed counter must not discard the other: the total is what the
       section is built on, the month is a nice-to-have. */
    const [totalResult, monthResult] = await Promise.allSettled([
      fetchCounter("tree_counter"),
      fetchCounter("tree_counter/month"),
    ]);
    if (totalResult.status === "rejected") throw totalResult.reason;

    const total = totalResult.value;
    const month =
      monthResult.status === "fulfilled" ? monthResult.value : null;
    if (monthResult.status === "rejected") {
      console.error("Tree-Nation month counter failed:", monthResult.reason);
    }

    const { error } = await supabase.from("forest_sync").upsert({
      id: SYNC_ROW_ID,
      tree_count: total,
      month_count: month,
      synced_at: now.toISOString(),
    });
    if (error) console.error("forest_sync upsert failed:", error.message);
    return { total, month };
  } catch (err) {
    console.error("Tree-Nation sync failed, using last known value:", err);
    if (!lastKnown) return { total: null, month: null };
    /* A stale row still carries a usable total, but its month figure is only
       meaningful while we are still in that month. */
    return {
      total: lastKnown.tree_count,
      month:
        syncedAt && sameCalendarMonth(syncedAt, now)
          ? lastKnown.month_count
          : null,
    };
  }
}
