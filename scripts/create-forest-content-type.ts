/**
 * Creates the "forest" Contentful content type in your space.
 *
 * Setup:
 *   1. Add CONTENTFUL_MANAGEMENT_TOKEN to your .env.local
 *      (Settings → API keys → Content management tokens in Contentful)
 *   2. Run:  npx ts-node -r tsconfig-paths/register scripts/create-forest-content-type.ts
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const contentfulManagement = require("contentful-management");
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const SPACE_ID = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID;
const MANAGEMENT_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
const ENVIRONMENT_ID = process.env.CONTENTFUL_ENVIRONMENT_ID ?? "master";

if (!SPACE_ID || !MANAGEMENT_TOKEN) {
  console.error(
    "Missing NEXT_PUBLIC_CONTENTFUL_SPACE_ID or CONTENTFUL_MANAGEMENT_TOKEN in .env.local"
  );
  process.exit(1);
}

async function run() {
  // Use the legacy createClient (not the plain client) for full space/env API
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = (contentfulManagement as any).createClient({
    accessToken: MANAGEMENT_TOKEN!,
  });

  const space = await client.getSpace(SPACE_ID!);
  const env = await space.getEnvironment(ENVIRONMENT_ID);

  // Check if content type already exists
  try {
    const existing = await env.getContentType("forest");
    if (existing) {
      console.log("✅ Content type 'forest' already exists — nothing to do.");
      return;
    }
  } catch {
    // 404 means it does not exist — continue
  }

  const contentType = await env.createContentTypeWithId("forest", {
    name: "Forest",
    description: "Forest section — feedback CTA with tree counter and progress bar",
    displayField: "heading",
    fields: [
      {
        id: "name",
        name: "Internal name",
        type: "Symbol",
        required: true,
        localized: false,
      },
      {
        id: "sectionLabel",
        name: "Section label",
        type: "Symbol",
        required: false,
        localized: false,
      },
      {
        id: "heading",
        name: "Heading",
        type: "Symbol",
        required: false,
        localized: true,
      },
      {
        id: "subheading",
        name: "Subheading",
        type: "Text",
        required: false,
        localized: true,
      },
      {
        id: "reviewCount",
        name: "Review count",
        type: "Integer",
        required: false,
        localized: false,
      },
      {
        id: "treeCount",
        name: "Tree count",
        type: "Integer",
        required: false,
        localized: false,
      },
      {
        id: "improvementsCount",
        name: "Improvements count",
        type: "Integer",
        required: false,
        localized: false,
      },
      {
        id: "ctaHeading",
        name: "CTA heading",
        type: "Symbol",
        required: false,
        localized: true,
      },
      {
        id: "ctaBody",
        name: "CTA body",
        type: "Text",
        required: false,
        localized: true,
      },
      {
        id: "ctaButtonLabel",
        name: "CTA button label",
        type: "Symbol",
        required: false,
        localized: false,
      },
      {
        id: "seasonName",
        name: "Season name",
        type: "Symbol",
        required: false,
        localized: false,
      },
      {
        id: "seasonCurrent",
        name: "Season current (trees)",
        type: "Integer",
        required: false,
        localized: false,
      },
      {
        id: "seasonTarget",
        name: "Season target (trees)",
        type: "Integer",
        required: false,
        localized: false,
      },
    ],
  });

  await contentType.publish();

  console.log("✅ Content type 'forest' created and published.");
  console.log(
    "\nNext step: go to Contentful → Content → Add entry → Forest\n" +
    "and add it to your homepage page module list."
  );
}

run().catch((err) => {
  console.error("Error:", err.message ?? err);
  process.exit(1);
});
