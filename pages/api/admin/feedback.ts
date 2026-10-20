import type { NextApiRequest, NextApiResponse } from "next";

import { createClient, SupabaseClient } from "@supabase/supabase-js";

import { authenticateAdmin } from "@lib/admin/access";
import {
  ADMIN_FEEDBACK_COLUMNS,
  ADMIN_PAGE_SIZE,
  AdminFeedbackList,
  AdminFeedbackRow,
  canEarnTrees,
  FEEDBACK_STATUSES,
  FeedbackStatus,
  isFeedbackCategory,
  isFeedbackSource,
  isFeedbackStatus,
  TREE_ELIGIBLE_STATUSES,
  TREES_PER_AWARD,
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

/* The update matched no row: either the feedback does not exist (404) or the
   rule refused it (409). Asked separately so the answer stays accurate, and
   worded generically so it says nothing about the table. */
async function refuse(
  supabase: SupabaseClient,
  id: string,
  res: NextApiResponse<ApiResponse>,
) {
  const { data, error } = await supabase
    .from("feedback")
    .select("id")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return res.status(404).json({ error: "Not found" });
  return res.status(409).json({ error: "Not allowed for this feedback" });
}

/* The Forest figures on the homepage come from trees_planted and are cached
   (ISR). Refreshing both locales makes a new award show up now rather than at
   the next hourly revalidation. A failure here must not undo the award, and a
   slow one (a cold page build) must not leave the admin staring at a button:
   after REFRESH_WAIT_MS the answer goes out and the refresh carries on. */
const REFRESH_WAIT_MS = 8000;

async function refreshForestFigures(res: NextApiResponse<ApiResponse>) {
  const refresh = Promise.allSettled(
    ["/", "/it"].map((path) =>
      Promise.resolve().then(() => res.revalidate(path)),
    ),
  ).then((results) => {
    results.forEach((result) => {
      if (result.status === "rejected") {
        console.error("Forest statistics revalidation failed:", result.reason);
      }
    });
  });

  let timer: ReturnType<typeof setTimeout> | undefined;
  const patience = new Promise<void>((resolve) => {
    timer = setTimeout(resolve, REFRESH_WAIT_MS);
  });
  await Promise.race([refresh, patience]);
  clearTimeout(timer);
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

    const { id, status, assignTrees } = (req.body ?? {}) as {
      id?: unknown;
      status?: unknown;
      assignTrees?: unknown;
    };
    if (typeof id !== "string" || !UUID_PATTERN.test(id)) {
      return res.status(400).json({ error: "Invalid id" });
    }

    /* Awarding the pair of trees. One statement does the whole check: the row
       must be accepted or implemented AND have no trees yet, so two clicks (or
       two tabs) can never award twice and a pending or rejected row can never
       get one, whatever the page showed. */
    if (assignTrees !== undefined) {
      if (assignTrees !== true || status !== undefined) {
        return res.status(400).json({ error: "Invalid request" });
      }
      const { data, error } = await supabase
        .from("feedback")
        .update({ trees_planted: TREES_PER_AWARD })
        .eq("id", id)
        .eq("trees_planted", 0)
        .in("status", [...TREE_ELIGIBLE_STATUSES])
        .select(ADMIN_FEEDBACK_COLUMNS)
        .maybeSingle();
      if (error) throw new Error(error.message);
      if (!data) return refuse(supabase, id, res);

      await refreshForestFigures(res);
      console.info(
        `Admin ${admin.email} assigned ${TREES_PER_AWARD} trees to feedback ${id}`,
      );
      return res.status(200).json({ row: data as unknown as AdminFeedbackRow });
    }

    if (!isFeedbackStatus(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    /* Status only: no other column can be written through this route. A row
       that already earned trees cannot leave accepted/implemented, or the
       public figures would count trees for feedback that was turned down. */
    let update = supabase.from("feedback").update({ status }).eq("id", id);
    if (!canEarnTrees(status)) update = update.eq("trees_planted", 0);
    const { data, error } = await update
      .select(ADMIN_FEEDBACK_COLUMNS)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return refuse(supabase, id, res);

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
