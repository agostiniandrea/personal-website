/**
 * Read-only verification for the Forest feedback source model.
 *
 * Prints the live counters that drive the Forest section so the migration/seed
 * can be checked before and after applying supabase/migrations/*_feedback_source_model.sql.
 *
 * Never prints secrets — only the project ref (host) is shown.
 * Run: node scripts/verify-forest-source-model.mjs
 */
import { readFileSync } from "node:fs";

import { createClient } from "@supabase/supabase-js";

// Minimal .env.local loader (no extra deps)
try {
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} catch {
  /* env may already be exported */
}

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const ref = new URL(url).host.split(".")[0];
console.log(`Project ref: ${ref}  (env target — confirm this is the intended DB)`);

const supabase = createClient(url, key);

const { count: total, error: totalErr } = await supabase
  .from("feedback")
  .select("id", { count: "exact", head: true });
if (totalErr) {
  console.error("Query failed:", totalErr.message);
  process.exit(1);
}
console.log(`\nTotal records: ${total}`);

// Detect whether the migration has run yet.
const probe = await supabase.from("feedback").select("source").limit(1);
if (probe.error) {
  console.log(
    "\n`source` column not present yet — migration has NOT been applied.",
  );
  process.exit(0);
}

const { data: rows, error } = await supabase
  .from("feedback")
  .select("source, status, trees_planted, source_reference");
if (error) {
  console.error("Query failed:", error.message);
  process.exit(1);
}

const bySource = {};
for (const r of rows) bySource[r.source] = (bySource[r.source] ?? 0) + 1;

const community = rows.filter((r) => r.source === "community");
const treesDedicated = community.reduce(
  (s, r) => s + (Number(r.trees_planted) || 0),
  0,
);
const communityContributions = community.filter(
  (r) => Number(r.trees_planted) > 0,
).length;
const improvementsShipped = rows.filter(
  (r) => r.status === "implemented",
).length;
const seededSlugs = rows
  .filter((r) => r.source_reference)
  .map((r) => r.source_reference)
  .sort();

console.log("\nRecords by source:", bySource);
console.log("\nDerived counters (what the Forest UI shows):");
console.log(`  insightsCollected      = ${rows.length}   (target 10)`);
console.log(`  treesDedicated         = ${treesDedicated}    (target 4)`);
console.log(`  improvementsShipped    = ${improvementsShipped}    (target 8)`);
console.log(`  communityContributions = ${communityContributions}    (target 2)`);
console.log(`\nSeeded internal slugs (${seededSlugs.length}):`);
seededSlugs.forEach((s) => console.log(`  - ${s}`));
