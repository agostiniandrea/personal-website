import type { SupabaseClient } from "@supabase/supabase-js";

/* Junk, spam and empty submissions are the only thing the published figures
   leave out. Everything else counts, whatever its provenance: a recruited
   participant paid to look at the site still gave an insight that changes it,
   and "insights collected" never claimed the insights were unsolicited. The
   figure that does make that claim is the contribution count below. */
const REJECTED_STATUS = "rejected";

export interface ForestImpactStats {
  /** Every genuine record in the feedback table — anything not rejected. */
  insightsCollectedCount: number;
  /** Trees dedicated to feedback, whoever gave it. Internal insights never
      grow trees, so the trees themselves are what identifies the rows. */
  treesDedicatedCount: number;
  /** Records shipped as improvements (status = 'implemented'). */
  improvementsShippedCount: number;
  /** Records that earned trees. Paired with treesDedicatedCount to state the
      ratio, so the two must always filter on the same condition. */
  contributionsCount: number;
}

export async function getForestImpactStats(
  supabase: SupabaseClient,
): Promise<ForestImpactStats> {
  const [insightsResult, rewardedResult, implementedResult] = await Promise.all([
    supabase
      .from("feedback")
      .select("id", { count: "exact", head: true })
      .neq("status", REJECTED_STATUS),
    /* Trees, not source, is the condition: it is the only thing that marks a
       piece of feedback as one Andrea chose to reward. Changing this without
       changing the count below would make the ratio in "Feedback impact" lie. */
    supabase.from("feedback").select("trees_planted").gt("trees_planted", 0),
    supabase
      .from("feedback")
      .select("id", { count: "exact", head: true })
      .eq("status", "implemented"),
  ]);

  const errors = [
    insightsResult.error,
    rewardedResult.error,
    implementedResult.error,
  ].filter(Boolean);
  if (errors.length > 0) {
    throw new Error(
      `Forest statistics query failed: ${errors
        .map((error) => error?.message)
        .join("; ")}`,
    );
  }

  const rewardedRows = rewardedResult.data ?? [];

  return {
    insightsCollectedCount: insightsResult.count ?? 0,
    treesDedicatedCount: rewardedRows.reduce(
      (sum, row) => sum + (Number(row.trees_planted) || 0),
      0,
    ),
    improvementsShippedCount: implementedResult.count ?? 0,
    contributionsCount: rewardedRows.length,
  };
}
