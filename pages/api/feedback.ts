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

const COOLDOWN_HOURS = 24;

type Response = { success: true } | { error: string };

function getIp(req: NextApiRequest): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") return forwarded.split(",")[0].trim();
  return req.socket.remoteAddress ?? "unknown";
}

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
    _hp,
  } = req.body ?? {};

  // Honeypot — bots fill hidden fields, humans don't
  if (_hp) {
    return res.status(200).json({ success: true });
  }

  if (!category || !ALLOWED_CATEGORIES.includes(category)) {
    return res.status(400).json({ error: "Invalid or missing category" });
  }

  if (!message || typeof message !== "string" || message.trim().length < 10) {
    return res.status(400).json({ error: "Message is too short" });
  }

  if (name !== undefined && name !== null && name !== "" && (typeof name !== "string" || name.length > 100)) {
    return res.status(400).json({ error: "Invalid name" });
  }

  if (email !== undefined && email !== null && email !== "") {
    if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Invalid email" });
    }
  }

  if (linkedin !== undefined && linkedin !== null && linkedin !== "") {
    if (typeof linkedin !== "string" || !/^https?:\/\/(www\.)?linkedin\.com\//.test(linkedin)) {
      return res.status(400).json({ error: "Invalid LinkedIn URL" });
    }
  }

  if (github !== undefined && github !== null && github !== "") {
    if (typeof github !== "string" || !/^https?:\/\/(www\.)?github\.com\//.test(github)) {
      return res.status(400).json({ error: "Invalid GitHub URL" });
    }
  }

  if (website !== undefined && website !== null && website !== "") {
    try {
      const url = new URL(website);
      if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error();
    } catch {
      return res.status(400).json({ error: "Invalid website URL" });
    }
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Supabase env vars not configured");
    return res.status(500).json({ error: "Server misconfiguration" });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const ip = getIp(req);

  // IP cooldown — 1 submission per IP per 24h
  const since = new Date(Date.now() - COOLDOWN_HOURS * 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("feedback")
    .select("id", { count: "exact", head: true })
    .eq("ip", ip)
    .gte("created_at", since);

  if (count && count > 0) {
    return res.status(429).json({ error: "You've already submitted feedback recently. Thank you!" });
  }

  const { error } = await supabase.from("feedback").insert({
    category,
    message: message.trim(),
    name: name?.trim() || null,
    email: email?.trim() || null,
    linkedin: linkedin?.trim() || null,
    github: github?.trim() || null,
    website: website?.trim() || null,
    public_acknowledgment: publicAcknowledgment === true,
    ip,
  });

  if (error) {
    console.error("Supabase insert error:", error.message);
    return res.status(500).json({ error: "Failed to save feedback" });
  }

  return res.status(200).json({ success: true });
}
