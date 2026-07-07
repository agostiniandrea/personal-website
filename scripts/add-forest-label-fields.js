/**
 * Adds seasonCurrentLabel, treeCountLabel, viewForestLabel fields to the forest content type.
 * Run: node scripts/add-forest-label-fields.js
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

const NEW_FIELDS = [
  { id: "seasonCurrentLabel", name: "Season current label", type: "Symbol" },
  { id: "treeCountLabel",     name: "Tree count label",     type: "Symbol" },
  { id: "viewForestLabel",    name: "View forest label",    type: "Symbol" },
];

async function run() {
  const ct = await client.contentType.get({ contentTypeId: "forest" });

  const existingIds = ct.fields.map((f) => f.id);
  const toAdd = NEW_FIELDS.filter((f) => !existingIds.includes(f.id));

  if (toAdd.length === 0) {
    console.log("All fields already exist, skipping.");
    return;
  }

  const updatedCt = await client.contentType.update(
    { contentTypeId: "forest" },
    { sys: ct.sys, name: ct.name, displayField: ct.displayField, fields: [...ct.fields, ...toAdd] }
  );

  await client.contentType.publish(
    { contentTypeId: "forest" },
    { sys: { version: updatedCt.sys.version } }
  );

  console.log(`✅ Added fields: ${toAdd.map((f) => f.id).join(", ")}`);
}

run().catch((err) => {
  console.error("Error:", err.message ?? err);
  process.exit(1);
});
