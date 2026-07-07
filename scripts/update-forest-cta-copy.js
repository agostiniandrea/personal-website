/**
 * Updates ctaBody copy in forest-homepage entry.
 * Run: node scripts/update-forest-cta-copy.js
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
  const localesRes = await client.locale.getMany({});
  const enLocale = localesRes.items.find((l) => l.default)?.code ?? "en";
  const itLocale = localesRes.items.find((l) => l.code.startsWith("it"))?.code;

  const existing = await client.entry.get({ entryId: "forest-homepage" });

  existing.fields.ctaBody[enLocale] = "Every meaningful suggestion earns a new tree. My goal: 25 trees planted through feedback this season.";
  if (itLocale) {
    existing.fields.ctaBody[itLocale] = "Ogni suggerimento utile fa crescere la foresta. Il mio obiettivo: 25 nuovi alberi piantati grazie ai feedback di questa stagione.";
  }

  const updated = await client.entry.update({ entryId: "forest-homepage" }, existing);
  await client.entry.publish({ entryId: "forest-homepage" }, { sys: { version: updated.sys.version } });
  console.log("✅ ctaBody updated EN + IT");
}

run().catch((err) => { console.error(err.message ?? err); process.exit(1); });
