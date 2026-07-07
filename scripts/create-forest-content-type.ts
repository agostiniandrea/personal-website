/**
 * Creates the "forest" Contentful content type in your space.
 * Run: yarn ts-node-transpile-only -r tsconfig-paths/register scripts/create-forest-content-type.ts
 */

/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */
const contentfulManagement = require("contentful-management");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const SPACE_ID: string = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID!;
const MANAGEMENT_TOKEN: string = process.env.CONTENTFUL_MANAGEMENT_TOKEN!;
const ENVIRONMENT_ID: string = process.env.CONTENTFUL_ENVIRONMENT_ID ?? "master";

if (!SPACE_ID || !MANAGEMENT_TOKEN) {
  console.error("Missing NEXT_PUBLIC_CONTENTFUL_SPACE_ID or CONTENTFUL_MANAGEMENT_TOKEN in .env.local");
  process.exit(1);
}

async function run() {
  const client = contentfulManagement.createClient({ accessToken: MANAGEMENT_TOKEN });
  const space = await client.getSpace(SPACE_ID);
  const env = await space.getEnvironment(ENVIRONMENT_ID);

  try {
    const existing = await env.getContentType("forest");
    if (existing) {
      console.log("✅ Content type 'forest' already exists — nothing to do.");
      return;
    }
  } catch {
    // 404 — doesn't exist yet, continue
  }

  const contentType = await env.createContentTypeWithId("forest", {
    name: "Forest",
    description: "Forest section — feedback CTA with tree counter and progress bar",
    displayField: "heading",
    fields: [
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
    ],
  });

  await contentType.publish();
  console.log("✅ Content type 'forest' created and published.");
  console.log("\nNext: Contentful → Content → Add entry → Forest");
}

run().catch((err: any) => {
  console.error("Error:", err.message ?? err);
  process.exit(1);
});
