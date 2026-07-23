/**
 * Compares the homepage page weight measured by Lighthouse against the
 * baseline recorded in constants/websiteCarbon.json (the weight at the time
 * of the last official Website Carbon test).
 *
 * Exits 0 when within the threshold. When drift exceeds the threshold it
 * writes `exceeded=true` (plus details) to GITHUB_OUTPUT so the workflow can
 * open an issue reminding us to re-run the official test.
 *
 * Usage: node scripts/check-carbon-drift.mjs [lighthouseci-dir]
 */
import { appendFileSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const THRESHOLD_PERCENT = 15;

const lhciDir = process.argv[2] ?? ".lighthouseci";
const baseline = JSON.parse(
  readFileSync("constants/websiteCarbon.json", "utf8"),
);

const lhrFile = readdirSync(lhciDir).find(
  (f) => f.startsWith("lhr-") && f.endsWith(".json"),
);
if (!lhrFile) {
  console.error(`No lhr-*.json found in ${lhciDir} — did lhci collect run?`);
  process.exit(1);
}

const lhr = JSON.parse(readFileSync(join(lhciDir, lhrFile), "utf8"));
const currentKb = lhr.audits["total-byte-weight"].numericValue / 1024;
const baselineKb = baseline.pageWeightKb;
const driftPercent = ((currentKb - baselineKb) / baselineKb) * 100;
const exceeded = Math.abs(driftPercent) > THRESHOLD_PERCENT;

const summary =
  `Homepage weight: ${currentKb.toFixed(0)} KiB ` +
  `(baseline ${baselineKb} KiB from ${baseline.testedAt}, ` +
  `drift ${driftPercent >= 0 ? "+" : ""}${driftPercent.toFixed(1)}%, ` +
  `threshold ±${THRESHOLD_PERCENT}%)`;

console.log(summary);
console.log(
  exceeded
    ? "Drift threshold exceeded — the official Website Carbon test should be re-run."
    : "Within threshold — stored Website Carbon result is still representative.",
);

if (process.env.GITHUB_OUTPUT) {
  appendFileSync(
    process.env.GITHUB_OUTPUT,
    `exceeded=${exceeded}\nsummary=${summary}\ncurrent_kb=${currentKb.toFixed(0)}\n`,
  );
}

process.exit(exceeded ? 2 : 0);
