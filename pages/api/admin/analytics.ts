import type { NextApiRequest, NextApiResponse } from "next";

import { authenticateAdmin } from "@lib/admin/access";
import { AdminAnalytics } from "@lib/admin/analyticsAdmin";
import { getMonthlyAnalytics } from "@lib/admin/googleAnalytics";

/* Monthly GA4 numbers for the admin overview. Same rule as every admin route:
   authenticated against Cloudflare Access first, 401 for everyone else, so the
   service account is never used on behalf of an anonymous caller. */

type ApiResponse = AdminAnalytics | { error: string };

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

  const analytics = await getMonthlyAnalytics();
  return res.status(analytics.status === "error" ? 502 : 200).json(analytics);
}
