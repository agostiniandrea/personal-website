/**
 * Creates the "forest" Contentful content type in your space.
 * Run: node scripts/create-forest-content-type.js
 */

const { createClient } = require("contentful-management");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const SPACE_ID = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID;
const MANAGEMENT_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
const ENVIRONMENT_ID = process.env.CONTENTFUL_ENVIRONMENT_ID ?? "master";

if (!SPACE_ID || !MANAGEMENT_TOKEN) {
  console.error("Missing NEXT_PUBLIC_CONTENTFUL_SPACE_ID or CONTENTFUL_MANAGEMENT_TOKEN in .env.local");
  process.exit(1);
}

const client = createClient(
  { accessToken: MANAGEMENT_TOKEN },
  { type: "plain", defaults: { spaceId: SPACE_ID, environmentId: ENVIRONMENT_ID } }
);

const FIELDS = [
  { id: "name",              name: "Internal name",          type: "Symbol",  required: true,  localized: false },
  { id: "sectionLabel",      name: "Section label",          type: "Symbol",  required: false, localized: false },
  { id: "heading",           name: "Heading",                type: "Symbol",  required: false, localized: true  },
  { id: "subheading",        name: "Subheading",             type: "Text",    required: false, localized: true  },
  { id: "reviewCount",       name: "Review count",           type: "Integer", required: false, localized: false },
  { id: "treeCount",         name: "Tree count",             type: "Integer", required: false, localized: false },
  { id: "improvementsCount", name: "Improvements count",     type: "Integer", required: false, localized: false },
  { id: "ctaHeading",        name: "CTA heading",            type: "Symbol",  required: false, localized: true  },
  { id: "ctaBody",           name: "CTA body",               type: "Text",    required: false, localized: true  },
  { id: "ctaButtonLabel",    name: "CTA button label",       type: "Symbol",  required: false, localized: false },
  { id: "seasonName",        name: "Season name",            type: "Symbol",  required: false, localized: false },
  { id: "seasonCurrent",     name: "Season current (trees)", type: "Integer", required: false, localized: false },
  { id: "seasonTarget",      name: "Season target (trees)",  type: "Integer", required: false, localized: false },
];

async function run() {
  // Check if already exists
  try {
    await client.contentType.get({ contentTypeId: "forest" });
    console.log("✅ Content type 'forest' already exists — nothing to do.");
    return;
  } catch {
    // 404 = doesn't exist yet, proceed to create
  }

  await client.contentType.createWithId(
    { contentTypeId: "forest" },
    {
      name: "Forest",
      description: "Forest section — feedback CTA with tree counter and progress bar",
      displayField: "heading",
      fields: FIELDS,
    }
  );

  await client.contentType.publish(
    { contentTypeId: "forest" },
    { sys: { version: 1 } }
  );

  console.log("✅ Content type 'forest' created and published.");
  console.log("\nNext: Contentful → Content → Add entry → Forest");
}

run().catch((err) => {
  console.error("Error:", err.message ?? err);
  process.exit(1);
});
