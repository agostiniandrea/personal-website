/**
 * Updates forest-homepage entry with correct EN/IT translations for all fields.
 * Run: node scripts/update-forest-entry-it.js
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

async function getLocales() {
  const res = await client.locale.getMany({});
  return res.items.map((l) => ({ code: l.code, default: l.default }));
}

function field(enVal, itVal, locales) {
  const obj = {};
  for (const l of locales) {
    obj[l.code] = l.code.startsWith("it") ? (itVal ?? enVal) : enVal;
  }
  return obj;
}

function nonLocalized(val, locales) {
  const def = locales.find((l) => l.default) ?? locales[0];
  return { [def.code]: val };
}

async function run() {
  const locales = await getLocales();
  console.log("Locales:", locales.map((l) => l.code).join(", "));

  const existing = await client.entry.get({ entryId: "forest-homepage" });

  const updatedFields = {
    ...existing.fields,
    heading: field(
      "This portfolio grows with your feedback.",
      "Questo portfolio cresce con il tuo feedback.",
      locales
    ),
    subheading: field(
      "Forest didn't start with this website. It started months earlier — a personal commitment to give something back. This page simply invites others to become part of that journey.",
      "Forest non è nata con questo sito. È iniziata mesi prima — un impegno personale per restituire qualcosa. Questa pagina invita semplicemente gli altri a fare parte di quel percorso.",
      locales
    ),
    ctaHeading: field(
      "Help this portfolio grow.",
      "Aiuta questo portfolio a crescere.",
      locales
    ),
    ctaBody: field(
      "Every meaningful suggestion becomes part of Forest. As a thank you, I dedicate one of the trees I plant.",
      "Ogni suggerimento utile entra a far parte di Forest. Come ringraziamento, dedico uno degli alberi che pianto.",
      locales
    ),
    ctaButtonLabel: field("🌱 Plant a leaf", "🌱 Pianta una foglia", locales),
    seasonName: field("Season One", "Stagione Uno", locales),
    seasonCurrentLabel: field("Current season", "Stagione corrente", locales),
    treeCountLabel: field("planted since May 2026", "piantati da maggio 2026", locales),
    viewForestLabel: field("View the living forest", "Visita la foresta", locales),
    treeCount: nonLocalized(30, locales),
    seasonCurrent: nonLocalized(0, locales),
    seasonTarget: nonLocalized(25, locales),
  };

  const updated = await client.entry.update(
    { entryId: "forest-homepage" },
    { sys: { ...existing.sys }, fields: updatedFields }
  );

  await client.entry.publish(
    { entryId: "forest-homepage" },
    { sys: { version: updated.sys.version } }
  );

  console.log("✅ forest-homepage updated and published with EN/IT translations.");
}

run().catch((err) => {
  console.error("Error:", err.message ?? err);
  process.exit(1);
});
