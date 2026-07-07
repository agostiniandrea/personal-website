import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const ALLOWED_CATEGORIES = [
  "UX",
  "Accessibility",
  "Performance",
  "Design",
  "Content",
  "Bug",
  "General thoughts",
] as const;

type Response = { success: true } | { error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    category,
    message,
    name,
    email,
    linkedin,
    github,
    website,
    publicAcknowledgment,
  } = req.body ?? {};

  if (!category || !ALLOWED_CATEGORIES.includes(category)) {
    return res.status(400).json({ error: "Invalid or missing category" });
  }

  if (!message || typeof message !== "string" || message.trim().length < 10) {
    return res.status(400).json({ error: "Message is too short" });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Supabase env vars not configured");
    return res.status(500).json({ error: "Server misconfiguration" });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { error } = await supabase.from("feedback").insert({
    category,
    message: message.trim(),
    name: name?.trim() || null,
    email: email?.trim() || null,
    linkedin: linkedin?.trim() || null,
    github: github?.trim() || null,
    website: website?.trim() || null,
    public_acknowledgment: publicAcknowledgment === true,
  });

  if (error) {
    console.error("Supabase insert error:", error.message);
    return res.status(500).json({ error: "Failed to save feedback" });
  }

  return res.status(200).json({ success: true });
}
