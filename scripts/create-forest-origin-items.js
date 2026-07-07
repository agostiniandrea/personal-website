/**
 * Creates forestOriginItem content type + 3 bilingual entries,
 * then links them to the forest-homepage entry.
 * Run: node scripts/create-forest-origin-items.js
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

const ITEMS = [
  {
    id: "forest-origin-1",
    date: "May 2026",
    en: "🌱  Started planting trees every month — a personal commitment, before any portfolio.",
    it: "🌱  Ho iniziato a piantare alberi ogni mese — un impegno personale, prima ancora del portfolio.",
  },
  {
    id: "forest-origin-2",
    date: "July 2026",
    en: "🌳  Forest was born. The portfolio invites others to become part of that journey.",
    it: "🌳  Forest è nato. Il portfolio invita gli altri a diventare parte di questo percorso.",
  },
  {
    id: "forest-origin-3",
    date: "Today",
    dateIt: "Oggi",
    en: "→  Every meaningful suggestion earns a dedicated tree from my forest.",
    it: "→  Ogni suggerimento significativo guadagna un albero dedicato dalla mia foresta.",
  },
];

async function run() {
  // Get locales
  const localesRes = await client.locale.getMany({});
  const defaultLocale = localesRes.items.find((l) => l.default)?.code ?? "en";
  const itLocale = localesRes.items.find((l) => l.code.startsWith("it"))?.code;
  console.log(`Locales — default: ${defaultLocale}, IT: ${itLocale ?? "not found"}\n`);

  // 1. Create content type
  try {
    await client.contentType.get({ contentTypeId: "forestOriginItem" });
    console.log("  skip — forestOriginItem content type already exists");
  } catch {
    const ct = await client.contentType.createWithId(
      { contentTypeId: "forestOriginItem" },
      {
        name: "Forest Origin Item",
        description: "One step in the Forest origin story timeline",
        displayField: "date",
        fields: [
          { id: "date", name: "Date label", type: "Symbol", required: true,  localized: true  },
          { id: "text", name: "Text",       type: "Symbol", required: true,  localized: true  },
        ],
      }
    );
    await client.contentType.publish({ contentTypeId: "forestOriginItem" }, { sys: { version: ct.sys.version } });
    console.log("✅ forestOriginItem content type created");
  }

  // 2. Create entries
  const entryIds = [];
  for (const item of ITEMS) {
    try {
      const existing = await client.entry.get({ entryId: item.id });
      console.log(`  skip entry '${item.id}' — already exists`);
      entryIds.push(item.id);
      // Still publish in case it's draft
      await client.entry.publish({ entryId: item.id }, { sys: { version: existing.sys.version } }).catch(() => {});
      continue;
    } catch { /* create */ }

    const fields = {
      date: { [defaultLocale]: item.date },
      text: { [defaultLocale]: item.en },
    };
    if (itLocale) {
      fields.date[itLocale] = item.dateIt ?? item.date;
      fields.text[itLocale] = item.it;
    }

    const entry = await client.entry.createWithId(
      { contentTypeId: "forestOriginItem", entryId: item.id },
      { fields }
    );
    await client.entry.publish({ entryId: item.id }, { sys: { version: entry.sys.version } });
    console.log(`✅ entry '${item.id}' created`);
    entryIds.push(item.id);
  }

  // 3. Add originItems field to forest content type if missing
  const forestCt = await client.contentType.get({ contentTypeId: "forest" });
  if (!forestCt.fields.some((f) => f.id === "originItems")) {
    forestCt.fields.push({
      id: "originItems",
      name: "Origin story items",
      type: "Array",
      required: false,
      localized: false,
      items: {
        type: "Link",
        linkType: "Entry",
        validations: [{ linkContentType: ["forestOriginItem"] }],
      },
    });
    const updated = await client.contentType.update({ contentTypeId: "forest" }, forestCt);
    await client.contentType.publish({ contentTypeId: "forest" }, { sys: { version: updated.sys.version } });
    console.log("✅ originItems field added to forest content type");
  } else {
    console.log("  skip — originItems field already exists");
  }

  // 4. Link entries to forest-homepage
  const forestEntry = await client.entry.get({ entryId: "forest-homepage" });
  const locale = Object.keys(forestEntry.fields.name)[0];
  forestEntry.fields.originItems = {
    [locale]: entryIds.map((id) => ({ sys: { type: "Link", linkType: "Entry", id } })),
  };
  const updatedForest = await client.entry.update({ entryId: "forest-homepage" }, forestEntry);
  await client.entry.publish({ entryId: "forest-homepage" }, { sys: { version: updatedForest.sys.version } });
  console.log("✅ forest-homepage linked to origin items");

  console.log("\nDone.");
}

run().catch((err) => {
  console.error("Error:", err.message ?? err);
  process.exit(1);
});
