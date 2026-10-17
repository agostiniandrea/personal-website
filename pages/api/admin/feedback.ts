import type { NextApiRequest, NextApiResponse } from "next";

import { createClient, SupabaseClient } from "@supabase/supabase-js";

import { authenticateAdmin } from "@lib/admin/access";
import {
  ADMIN_FEEDBACK_COLUMNS,
  ADMIN_PAGE_SIZE,
  AdminFeedbackList,
  AdminFeedbackRow,
  FEEDBACK_STATUSES,
  FeedbackStatus,
  isFeedbackCategory,
  isFeedbackSource,
  isFeedbackStatus,
  UUID_PATTERN,
} from "@lib/admin/feedbackAdmin";

/* Admin API for the feedback table. Every request is authenticated against
   Cloudflare Access first (lib/admin/access.ts): this route runs with the
   Supabase service key, so nothing below the auth check may be reachable
   without it. It answers 401 to anyone else and never says why. */

type ApiResponse =
  AdminFeedbackList | { row: AdminFeedbackRow } | { error: string };

const first = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value;

/* A cookie-authenticated PATCH could be forged by another site in the admin's
   browser. Requiring JSON already forces a CORS preflight; this also insists
   the request comes from the page's own origin. */
function isSameOrigin(req: NextApiRequest): boolean {
  const origin = first(req.headers.origin);
  const host = first(req.headers.host);
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

async function listFeedback(
  supabase: SupabaseClient,
  req: NextApiRequest,
): Promise<AdminFeedbackList> {
  const status = first(req.query.status);
  const source = first(req.query.source);
  const category = first(req.query.category);
  const page = Math.max(
    1,
    Number.parseInt(first(req.query.page) ?? "1", 10) || 1,
  );
  const from = (page - 1) * ADMIN_PAGE_SIZE;

  let query = supabase
    .from("feedback")
    .select(ADMIN_FEEDBACK_COLUMNS, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + ADMIN_PAGE_SIZE - 1);
  if (isFeedbackStatus(status)) query = query.eq("status", status);
  if (isFeedbackSource(source)) query = query.eq("source", source);
  if (isFeedbackCategory(category)) query = query.eq("category", category);

  const [listResult, ...countResults] = await Promise.all([
    query,
    ...FEEDBACK_STATUSES.map((value) =>
      supabase
        .from("feedback")
        .select("id", { count: "exact", head: true })
        .eq("status", value),
    ),
  ]);

  const failure = [listResult, ...countResults].find((result) => result.error);
  if (failure?.error) throw new Error(failure.error.message);

  const counts = Object.fromEntries(
    FEEDBACK_STATUSES.map((value, index) => [
      value,
      countResults[index].count ?? 0,
    ]),
  ) as Record<FeedbackStatus, number>;

  return {
    items: (listResult.data ?? []) as unknown as AdminFeedbackRow[],
    total: listResult.count ?? 0,
    page,
    pageSize: ADMIN_PAGE_SIZE,
    counts,
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>,
) {
  res.setHeader("Cache-Control", "no-store");

  const admin = await authenticateAdmin(req);
  if (!admin) return res.status(401).json({ error: "Unauthorized" });

  if (req.method !== "GET" && req.method !== "PATCH") {
    res.setHeader("Allow", "GET, PATCH");
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
    if (req.method === "GET") {
      return res.status(200).json(await listFeedback(supabase, req));
    }

    if (!isSameOrigin(req)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    const contentType = first(req.headers["content-type"]) ?? "";
    if (!contentType.toLowerCase().startsWith("application/json")) {
      return res.status(415).json({ error: "Expected JSON" });
    }

    const { id, status } = (req.body ?? {}) as {
      id?: unknown;
      status?: unknown;
    };
    if (typeof id !== "string" || !UUID_PATTERN.test(id)) {
      return res.status(400).json({ error: "Invalid id" });
    }
    if (!isFeedbackStatus(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    /* Status only: no other column can be written through this route. */
    const { data, error } = await supabase
      .from("feedback")
      .update({ status })
      .eq("id", id)
      .select(ADMIN_FEEDBACK_COLUMNS)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return res.status(404).json({ error: "Not found" });

    console.info(`Admin ${admin.email} set feedback ${id} to ${status}`);
    return res.status(200).json({ row: data as unknown as AdminFeedbackRow });
  } catch (error) {
    console.error(
      "Admin feedback request failed:",
      error instanceof Error ? error.message : "unknown error",
    );
    return res.status(500).json({ error: "Request failed" });
  }
}
