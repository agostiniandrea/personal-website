/**
 * Normalises Contentful entry names to follow the "<ContentType> - <Descriptor>" convention.
 * Run: node scripts/fix-contentful-entry-names.js
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

async function getDefaultLocale() {
  const res = await client.locale.getMany({});
  return (res.items.find((l) => l.default) ?? res.items[0]).code;
}

async function renameEntry(entryId, newName, locale) {
  const entry = await client.entry.get({ entryId });
  const currentName = entry.fields.name?.[locale] ?? "";
  if (currentName === newName) {
    console.log(`  skip '${newName}' — already correct`);
    return;
  }
  entry.fields.name = { ...entry.fields.name, [locale]: newName };
  const updated = await client.entry.update({ entryId }, entry);
  await client.entry.publish({ entryId }, { sys: { version: updated.sys.version } });
  console.log(`  ✅ '${currentName}' → '${newName}'`);
}

async function updateContentTypeDisplayField(contentTypeId, displayField) {
  const ct = await client.contentType.get({ contentTypeId });
  if (ct.displayField === displayField) {
    console.log(`  skip content type '${contentTypeId}' displayField — already '${displayField}'`);
    return;
  }
  const updated = await client.contentType.update({ contentTypeId }, { ...ct, displayField });
  await client.contentType.publish({ contentTypeId }, { sys: { version: updated.sys.version } });
  console.log(`  ✅ content type '${contentTypeId}' displayField → '${displayField}'`);
}

async function prefixEntriesByContentType(contentTypeId, prefix, nameField, locale) {
  const res = await client.entry.getMany({
    query: { content_type: contentTypeId, limit: 200 },
  });
  for (const entry of res.items) {
    const current = entry.fields[nameField]?.[locale] ?? "";
    if (!current || current.startsWith(prefix)) continue;
    const newName = `${prefix}${current}`;
    entry.fields[nameField] = { ...entry.fields[nameField], [locale]: newName };
    const updated = await client.entry.update({ entryId: entry.sys.id }, entry);
    await client.entry.publish({ entryId: entry.sys.id }, { sys: { version: updated.sys.version } });
    console.log(`  ✅ '${current}' → '${newName}'`);
  }
}

async function renameJourneyChapters(locale) {
  const res = await client.entry.getMany({
    query: { content_type: "journeyChapter", limit: 200 },
  });
  for (const entry of res.items) {
    const currentName = entry.fields.name?.[locale] ?? "";
    const city = entry.fields.city?.[locale] ?? currentName;
    if (!city || currentName.startsWith("Journey -")) continue;
    const newName = `Journey - ${city}`;
    entry.fields.name = { ...entry.fields.name, [locale]: newName };
    const updated = await client.entry.update({ entryId: entry.sys.id }, entry);
    await client.entry.publish({ entryId: entry.sys.id }, { sys: { version: updated.sys.version } });
    console.log(`  ✅ '${currentName}' → '${newName}'`);
  }
}

async function run() {
  const locale = await getDefaultLocale();
  console.log(`Locale: ${locale}\n`);

  console.log("── Forest content type displayField");
  await updateContentTypeDisplayField("forest", "name");

  console.log("\n── Forest entry");
  await renameEntry("forest-homepage", "Forest - Home", locale);

  console.log("\n── Journey Chapters");
  await renameJourneyChapters(locale);

  console.log("\n── Journey section");
  const journeyEntries = await client.entry.getMany({ query: { content_type: "journey", limit: 10 } });
  for (const e of journeyEntries.items) {
    const current = e.fields.name?.[locale] ?? e.fields.title?.[locale] ?? "";
    if (!current || current.startsWith("Journey -")) continue;
    e.fields.name = { ...(e.fields.name ?? {}), [locale]: "Journey - Home" };
    const updated = await client.entry.update({ entryId: e.sys.id }, e);
    await client.entry.publish({ entryId: e.sys.id }, { sys: { version: updated.sys.version } });
    console.log(`  ✅ '${current}' → 'Journey - Home'`);
  }

  console.log("\n── Hero Portfolio");
  const heroEntries = await client.entry.getMany({ query: { content_type: "heroPortfolio", limit: 10 } });
  for (const e of heroEntries.items) {
    const current = e.fields.name?.[locale] ?? "";
    if (!current || current === "Hero - Home") continue;
    e.fields.name = { ...(e.fields.name ?? {}), [locale]: "Hero - Home" };
    const updated = await client.entry.update({ entryId: e.sys.id }, e);
    await client.entry.publish({ entryId: e.sys.id }, { sys: { version: updated.sys.version } });
    console.log(`  ✅ '${current}' → 'Hero - Home'`);
  }

  console.log("\n── Site Footer");
  const footerEntries = await client.entry.getMany({ query: { content_type: "siteFooter", limit: 10 } });
  for (const e of footerEntries.items) {
    const current = e.fields.name?.[locale] ?? "";
    if (current && current !== "Untitled") continue;
    e.fields.name = { ...(e.fields.name ?? {}), [locale]: "Footer - Home" };
    const updated = await client.entry.update({ entryId: e.sys.id }, e);
    await client.entry.publish({ entryId: e.sys.id }, { sys: { version: updated.sys.version } });
    console.log(`  ✅ 'Untitled' → 'Footer - Home'`);
  }

  console.log("\n── Project Items");
  await prefixEntriesByContentType("projectItem", "Project - ", "name", locale);

  console.log("\n── Experience Items");
  await prefixEntriesByContentType("experienceItem", "Experience - ", "name", locale);

  console.log("\nDone.");
}

run().catch((err) => {
  console.error("Error:", err.message ?? err);
  process.exit(1);
});
