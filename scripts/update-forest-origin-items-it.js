/**
 * Updates forestOriginItem entries with correct IT date labels.
 * Run: node scripts/update-forest-origin-items-it.js
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
  { id: "forest-origin-1", dateIt: "Maggio 2026", textIt: "🌱  Ho iniziato a piantare alberi ogni mese — un impegno personale, prima ancora del portfolio." },
  { id: "forest-origin-2", dateIt: "Luglio 2026", textIt: "🌳  Forest è nato. Il portfolio invita gli altri a diventare parte di questo percorso." },
  { id: "forest-origin-3", dateIt: "Oggi",        textIt: "→  Ogni suggerimento significativo guadagna un albero dedicato dalla mia foresta." },
];

async function run() {
  const localesRes = await client.locale.getMany({});
  const itLocale = localesRes.items.find((l) => l.code.startsWith("it"))?.code;
  if (!itLocale) { console.error("No IT locale found"); process.exit(1); }

  for (const item of ITEMS) {
    const existing = await client.entry.get({ entryId: item.id });
    existing.fields.date[itLocale] = item.dateIt;
    existing.fields.text[itLocale] = item.textIt;

    const updated = await client.entry.update({ entryId: item.id }, existing);
    await client.entry.publish({ entryId: item.id }, { sys: { version: updated.sys.version } });
    console.log(`✅ ${item.id} updated`);
  }
}

run().catch((err) => { console.error(err.message ?? err); process.exit(1); });
