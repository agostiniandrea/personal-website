/**
 * Creates the "forest" Contentful entry (bilingual EN + IT) and publishes it.
 * Run: node scripts/create-forest-entry.js
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

async function getLocales() {
  const res = await client.locale.getMany({});
  return res.items.map((l) => ({ code: l.code, default: l.default }));
}

function field(enVal, itVal, locales) {
  const obj = {};
  for (const l of locales) {
    if (l.code.startsWith("it")) obj[l.code] = itVal ?? enVal;
    else obj[l.code] = enVal;
  }
  return obj;
}

function nonLocalized(val, locales) {
  const obj = {};
  const def = locales.find((l) => l.default) ?? locales[0];
  obj[def.code] = val;
  return obj;
}

async function run() {
  const locales = await getLocales();
  console.log("Locales found:", locales.map((l) => l.code).join(", "));

  const fields = {
    name:              nonLocalized("Forest – Homepage", locales),
    sectionLabel:      nonLocalized("🌳 Forest", locales),
    heading:           field(
                         "This portfolio grows with your feedback.",
                         "Questo portfolio cresce con il tuo feedback.",
                         locales
                       ),
    subheading:        field(
                         "Every meaningful suggestion helps shape the next version. As a thank you, I dedicate a real tree.",
                         "Ogni suggerimento utile contribuisce a plasmare la prossima versione. Come ringraziamento, dedico un albero vero.",
                         locales
                       ),
    reviewCount:       nonLocalized(0, locales),
    treeCount:         nonLocalized(0, locales),
    improvementsCount: nonLocalized(0, locales),
    ctaHeading:        field(
                         "Help this portfolio grow.",
                         "Aiuta questo portfolio a crescere.",
                         locales
                       ),
    ctaBody:           field(
                         "If you spot something, leave a leaf.",
                         "Se noti qualcosa, lascia una foglia.",
                         locales
                       ),
    ctaButtonLabel:    nonLocalized("🌱 Plant a leaf", locales),
    seasonName:        nonLocalized("Season One", locales),
    seasonCurrent:     nonLocalized(0, locales),
    seasonTarget:      nonLocalized(25, locales),
  };

  const entry = await client.entry.createWithId(
    { contentTypeId: "forest", entryId: "forest-homepage" },
    { fields }
  );

  await client.entry.publish(
    { entryId: "forest-homepage" },
    { sys: { version: entry.sys.version } }
  );

  console.log("✅ Entry 'forest-homepage' created and published.");
  console.log("\nNext: add it to your homepage (pageLanding) modules list in Contentful.");
}

run().catch((err) => {
  console.error("Error:", err.message ?? err);
  process.exit(1);
});
