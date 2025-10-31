import { NextApiRequest, NextApiResponse } from "next";
import { getInstagramData } from "@lib/utils/instagram";

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const data = await getInstagramData();
    
    // Add cache headers for better performance
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=3600, stale-while-revalidate=86400"
    );

    if (data) {
      res.status(200).json({ data });
    } else {
      res.status(500).json({ error: "Failed to fetch Instagram data" });
    }
  } catch (err) {
    res.status(500).json({ err });
  }
}
