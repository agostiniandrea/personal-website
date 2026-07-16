import type { SupabaseClient } from "@supabase/supabase-js";

export const TREE_NATION_FOREST_SLUG = "andrea-agostini-103769";

const SYNC_ROW_ID = "tree-nation";
const STALE_AFTER_MS = 24 * 60 * 60 * 1000;
const FETCH_TIMEOUT_MS = 8000;

interface ForestSyncRow {
  id: string;
  tree_count: number;
  synced_at: string;
}

/* The tree counter endpoint is public; the token (when present) is sent for
   consistency with the authenticated endpoints and future-proofing */
async function fetchLiveTreeCount(): Promise<number> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const headers: Record<string, string> = { Accept: "application/json" };
    if (process.env.TREE_NATION_API_TOKEN) {
      headers.Authorization = `Bearer ${process.env.TREE_NATION_API_TOKEN}`;
    }
    const res = await fetch(
      `https://tree-nation.com/api/forests/${TREE_NATION_FOREST_SLUG}/tree_counter`,
      { headers, signal: controller.signal }
    );
    if (!res.ok) throw new Error(`Tree-Nation responded ${res.status}`);
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

/**
 * Returns the verified Tree-Nation forest total, syncing at most once per
 * 24h window. Falls back to the last synced value when Tree-Nation is
 * unavailable, and to null when no value has ever been synced — callers
 * should then keep their own fallback (the Contentful treeCount).
 */
export async function getForestTreeCount(
  supabase: SupabaseClient
): Promise<number | null> {
  let lastKnown: ForestSyncRow | null = null;

  try {
    const { data } = await supabase
      .from("forest_sync")
      .select("id, tree_count, synced_at")
      .eq("id", SYNC_ROW_ID)
      .maybeSingle();
    lastKnown = data ?? null;
  } catch (err) {
    console.error("forest_sync read failed:", err);
  }

  const isFresh =
    lastKnown !== null &&
    Date.now() - new Date(lastKnown.synced_at).getTime() < STALE_AFTER_MS;

  if (lastKnown && isFresh) {
    return lastKnown.tree_count;
  }

  try {
    const count = await fetchLiveTreeCount();
    const { error } = await supabase.from("forest_sync").upsert({
      id: SYNC_ROW_ID,
      tree_count: count,
      synced_at: new Date().toISOString(),
    });
    if (error) console.error("forest_sync upsert failed:", error.message);
    return count;
  } catch (err) {
    console.error("Tree-Nation sync failed, using last known value:", err);
    return lastKnown?.tree_count ?? null;
  }
}
