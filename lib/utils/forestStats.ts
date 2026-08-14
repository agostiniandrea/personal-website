import type { SupabaseClient } from "@supabase/supabase-js";

/* Feedback recruited and paid for through a usability study is not an insight
   the site earned, so none of the published figures count it. If a study
   finding does ship, it gets logged as an internal insight the same way every
   other improvement does — that keeps one record per visible outcome instead
   of counting the study row in one figure and not the other. */
const EXCLUDED_SOURCE = "usability_study";

export interface ForestImpactStats {
  /** Every record in the feedback table, whatever its source. */
  insightsCollectedCount: number;
  /** Trees dedicated to real community feedback only (sum of trees_planted
      where source = 'community'). Internal insights never grow trees. */
  treesDedicatedCount: number;
  /** Records shipped as improvements (status = 'implemented'), any source. */
  improvementsShippedCount: number;
  /** Community records that earned trees (source = 'community', trees > 0). */
  communityContributionsCount: number;
}

export async function getForestImpactStats(
  supabase: SupabaseClient,
): Promise<ForestImpactStats> {
  const [insightsResult, communityResult, implementedResult] =
    await Promise.all([
      supabase
        .from("feedback")
        .select("id", { count: "exact", head: true })
        .neq("source", EXCLUDED_SOURCE),
      supabase
        .from("feedback")
        .select("trees_planted")
        .eq("source", "community"),
      supabase
        .from("feedback")
        .select("id", { count: "exact", head: true })
        .eq("status", "implemented")
        .neq("source", EXCLUDED_SOURCE),
    ]);

  const errors = [
    insightsResult.error,
    communityResult.error,
    implementedResult.error,
  ].filter(Boolean);
  if (errors.length > 0) {
    throw new Error(
      `Forest statistics query failed: ${errors
        .map((error) => error?.message)
        .join("; ")}`,
    );
  }

  const communityRows = communityResult.data ?? [];

  return {
    insightsCollectedCount: insightsResult.count ?? 0,
    treesDedicatedCount: communityRows.reduce(
      (sum, row) => sum + (Number(row.trees_planted) || 0),
      0,
    ),
    improvementsShippedCount: implementedResult.count ?? 0,
    communityContributionsCount: communityRows.filter(
      (row) => Number(row.trees_planted) > 0,
    ).length,
  };
}
