import type { SupabaseClient } from "@supabase/supabase-js";

export interface ForestImpactStats {
  feedbackCount: number;
  improvementsCount: number;
  treesDedicatedCount: number;
}

export async function getForestImpactStats(
  supabase: SupabaseClient,
): Promise<ForestImpactStats> {
  const [feedbackResult, plantedResult, improvementsResult] = await Promise.all([
    supabase.from("feedback").select("id", { count: "exact", head: true }),
    supabase.from("feedback").select("trees_planted"),
    supabase
      .from("feedback")
      .select("id", { count: "exact", head: true })
      .eq("status", "implemented"),
  ]);

  const errors = [
    feedbackResult.error,
    plantedResult.error,
    improvementsResult.error,
  ].filter(Boolean);
  if (errors.length > 0) {
    throw new Error(
      `Forest statistics query failed: ${errors
        .map((error) => error?.message)
        .join("; ")}`,
    );
  }

  return {
    feedbackCount: feedbackResult.count ?? 0,
    improvementsCount: improvementsResult.count ?? 0,
    treesDedicatedCount: (plantedResult.data ?? []).reduce(
      (sum, row) => sum + (Number(row.trees_planted) || 0),
      0,
    ),
  };
}
