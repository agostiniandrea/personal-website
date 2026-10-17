import type { NextApiRequest, NextApiResponse } from "next";

import { createClient, SupabaseClient } from "@supabase/supabase-js";

import { authenticateAdmin } from "@lib/admin/access";
import {
  AdminForestSummary,
  AdminSummary,
  FEEDBACK_STATUSES,
  FeedbackStatus,
} from "@lib/admin/feedbackAdmin";

/* The admin home: who is signed in and one line per section. New sections add
   their numbers here. Same rule as every admin route: authenticated against
   Cloudflare Access first, 401 for everyone else. */

type ApiResponse = AdminSummary | { error: string };

/* The cached Tree-Nation total plus the trees dedicated to feedback. Best
   effort: any failure here yields null so the feedback numbers still show. */
async function readForest(
  supabase: SupabaseClient,
): Promise<AdminForestSummary | null> {
  try {
    const [syncResult, rewardedResult] = await Promise.all([
      supabase
        .from("forest_sync")
        .select("tree_count,month_count,synced_at")
        .eq("id", "tree-nation")
        .maybeSingle(),
      supabase.from("feedback").select("trees_planted").gt("trees_planted", 0),
    ]);
    if (syncResult.error || rewardedResult.error || !syncResult.data) {
      return null;
    }
    const rewarded = rewardedResult.data ?? [];
    return {
      treeCount: Number(syncResult.data.tree_count) || 0,
      monthCount:
        syncResult.data.month_count == null
          ? null
          : Number(syncResult.data.month_count),
      syncedAt: syncResult.data.synced_at ?? null,
      dedicatedTrees: rewarded.reduce(
        (sum, row) => sum + (Number(row.trees_planted) || 0),
        0,
      ),
      contributions: rewarded.length,
    };
  } catch {
    return null;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>,
) {
  res.setHeader("Cache-Control", "no-store");

  const admin = await authenticateAdmin(req);
  if (!admin) return res.status(401).json({ error: "Unauthorized" });

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    console.error("Supabase env vars not configured");
    return res.status(500).json({ error: "Server misconfiguration" });
  }
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const [results, forest] = await Promise.all([
      Promise.all(
        FEEDBACK_STATUSES.map((status) =>
          supabase
            .from("feedback")
            .select("id", { count: "exact", head: true })
            .eq("status", status),
        ),
      ),
      readForest(supabase),
    ]);
    const failure = results.find((result) => result.error);
    if (failure?.error) throw new Error(failure.error.message);

    const counts = Object.fromEntries(
      FEEDBACK_STATUSES.map((status, index) => [
        status,
        results[index].count ?? 0,
      ]),
    ) as Record<FeedbackStatus, number>;

    return res
      .status(200)
      .json({ email: admin.email, feedback: { counts }, forest });
  } catch (error) {
    console.error(
      "Admin summary request failed:",
      error instanceof Error ? error.message : "unknown error",
    );
    return res.status(500).json({ error: "Request failed" });
  }
}
