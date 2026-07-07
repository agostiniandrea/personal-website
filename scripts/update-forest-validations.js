/**
 * Adds min:0 validation to reviewCount, treeCount, improvementsCount fields.
 * Run: node scripts/update-forest-validations.js
 */

const { createClient } = require("contentful-management");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const SPACE_ID = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID;
const MANAGEMENT_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
const ENVIRONMENT_ID = process.env.CONTENTFUL_ENVIRONMENT_ID ?? "master";

const client = createClient(
  { accessToken: MANAGEMENT_TOKEN },
  { type: "plain", defaults: { spaceId: SPACE_ID, environmentId: ENVIRONMENT_ID } }
);

async function run() {
  const ct = await client.contentType.get({ contentTypeId: "forest" });

  const MIN_ZERO_FIELDS = ["reviewCount", "treeCount", "improvementsCount", "seasonCurrent", "seasonTarget"];

  ct.fields = ct.fields.map((f) => {
    if (MIN_ZERO_FIELDS.includes(f.id)) {
      return { ...f, validations: [{ range: { min: 0 } }] };
    }
    return f;
  });

  const updated = await client.contentType.update({ contentTypeId: "forest" }, ct);
  await client.contentType.publish(
    { contentTypeId: "forest" },
    { sys: { version: updated.sys.version } }
  );

  console.log("✅ Validations added: min 0 on reviewCount, treeCount, improvementsCount, seasonCurrent, seasonTarget");
}

run().catch((err) => {
  console.error("Error:", err.message ?? err);
  process.exit(1);
});
