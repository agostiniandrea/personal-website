import type { NextApiRequest, NextApiResponse } from "next";

import { createClient } from "@supabase/supabase-js";

import { FEEDBACK_MESSAGE_MIN_LENGTH } from "@constants";
import { isValidProlificId, ProlificSession } from "@lib/utils/prolific";

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

/* Study submissions are de-duplicated by Prolific submission rather than by
   IP, which on its own would let forged parameters insert without limit. This
   cap restores a ceiling while staying far above any real cohort sharing one
   NAT, so it can never be what blocks a participant. */
const STUDY_SUBMISSIONS_PER_IP = 10;

type Response = { success: true } | { error: string };

function getIp(req: NextApiRequest): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") return forwarded.split(",")[0].trim();
  return req.socket.remoteAddress ?? "unknown";
}

/* A recruited study participant sends the ids the study link carried. Read
   defensively: this is a public endpoint, so anything shaped wrong is dropped
   rather than trusted, and a submission without a valid pid stays an ordinary
   community one. */
function readProlificSession(body: unknown): ProlificSession | null {
  const raw = (body as { prolific?: Partial<ProlificSession> } | null)?.prolific;
  if (!raw || !isValidProlificId(raw.prolificPid)) return null;
  return {
    prolificPid: raw.prolificPid,
    ...(isValidProlificId(raw.studyId) && { studyId: raw.studyId }),
    ...(isValidProlificId(raw.sessionId) && { sessionId: raw.sessionId }),
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>,
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

  if (
    !message ||
    typeof message !== "string" ||
    message.trim().length < FEEDBACK_MESSAGE_MIN_LENGTH
  ) {
    return res.status(400).json({ error: "Message is too short" });
  }

  if (
    name !== undefined &&
    name !== null &&
    name !== "" &&
    (typeof name !== "string" || name.length > 100)
  ) {
    return res.status(400).json({ error: "Invalid name" });
  }

  if (email !== undefined && email !== null && email !== "") {
    if (
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return res.status(400).json({ error: "Invalid email" });
    }
  }

  if (linkedin !== undefined && linkedin !== null && linkedin !== "") {
    if (
      typeof linkedin !== "string" ||
      !/^https?:\/\/(www\.)?linkedin\.com\//.test(linkedin)
    ) {
      return res.status(400).json({ error: "Invalid LinkedIn URL" });
    }
  }

  if (github !== undefined && github !== null && github !== "") {
    if (
      typeof github !== "string" ||
      !/^https?:\/\/(www\.)?github\.com\//.test(github)
    ) {
      return res.status(400).json({ error: "Invalid GitHub URL" });
    }
  }

  if (website !== undefined && website !== null && website !== "") {
    try {
      const url = new URL(website);
      if (url.protocol !== "http:" && url.protocol !== "https:")
        throw new Error();
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
  const prolific = readProlificSession(req.body);
  const since = new Date(
    Date.now() - COOLDOWN_HOURS * 60 * 60 * 1000,
  ).toISOString();

  if (prolific) {
    /* Study participants are de-duplicated by their Prolific submission, not
       by IP: they are strangers to one another and can easily share an exit
       address (carrier NAT, VPN, campus gateway), and the cooldown below would
       reject the second one with no way through — a dead end mid-study. */
    let dedupe = supabase
      .from("feedback")
      .select("id", { count: "exact", head: true });

    if (prolific.sessionId) {
      dedupe = dedupe.eq("prolific_session_id", prolific.sessionId);
    } else {
      /* No submission id in the link: one per participant per study, so a
         later study can still recruit the same people. */
      dedupe = dedupe.eq("prolific_pid", prolific.prolificPid);
      if (prolific.studyId) {
        dedupe = dedupe.eq("prolific_study_id", prolific.studyId);
      }
    }

    const [{ count }, { count: fromThisIp }] = await Promise.all([
      dedupe,
      supabase
        .from("feedback")
        .select("id", { count: "exact", head: true })
        .eq("ip", ip)
        .gte("created_at", since),
    ]);

    if (count && count > 0) {
      return res.status(429).json({
        error: "This submission has already been recorded. Thank you!",
      });
    }

    if (fromThisIp && fromThisIp >= STUDY_SUBMISSIONS_PER_IP) {
      return res.status(429).json({
        error: "Too many submissions from this connection. Please email me.",
      });
    }
  } else {
    // IP cooldown — 1 submission per IP per 24h
    const { count } = await supabase
      .from("feedback")
      .select("id", { count: "exact", head: true })
      .eq("ip", ip)
      .gte("created_at", since);

    if (count && count > 0) {
      return res.status(429).json({
        error: "You've already submitted feedback recently. Thank you!",
      });
    }
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
    /* An unsolicited submission through the public form is, by definition,
       real community feedback. A recruited participant's is not — it was paid
       for and asked for — so it gets its own source, stays out of the public
       Forest counters (see lib/utils/forestStats.ts) and grows no trees.
       Internal insights are seeded separately and never pass through here. */
    source: prolific ? "usability_study" : "community",
    prolific_pid: prolific?.prolificPid ?? null,
    prolific_study_id: prolific?.studyId ?? null,
    prolific_session_id: prolific?.sessionId ?? null,
    ip,
  });

  if (error) {
    console.error("Supabase insert error:", error.message);
    return res.status(500).json({ error: "Failed to save feedback" });
  }

  /* Study submissions move none of the published figures, so there is nothing
     to rebuild for them — and a whole cohort submitting would otherwise
     re-run every page's data fetching for no visible change. */
  if (!prolific) {
    const revalidationResults = await Promise.allSettled([
      res.revalidate("/"),
      res.revalidate("/it"),
    ]);
    revalidationResults.forEach((result) => {
      if (result.status === "rejected") {
        console.error("Forest statistics revalidation failed:", result.reason);
      }
    });
  }

  return res.status(200).json({ success: true });
}
