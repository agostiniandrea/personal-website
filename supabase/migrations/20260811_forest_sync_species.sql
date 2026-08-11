-- Forest sync: species detail for the featured project
-- ---------------------------------------------------------------------------
-- The project card names its species the way a reader would ("Sengon"), which
-- on its own tells nobody anything. Tree-Nation can say what they are:
--
--   GET /api/projects/{id}/species   → the project's species, botanical names
--   GET /api/species/{id}            → common names, category, origin, CO2
--       header: X-API-VERSION: 1
--
-- Resolving a CMS name to a species costs one request per species until every
-- name is matched, so the result is cached here and only re-resolved with the
-- rest of the 24h sync.
--
-- Nullable, like the other enrichments: a failed resolve keeps the last good
-- detail, and if none was ever stored the card falls back to the plain names.
--
-- Idempotent. Run once in the Supabase SQL editor (DDL cannot go through the
-- REST service key).
-- ---------------------------------------------------------------------------

begin;

alter table public.forest_sync
  add column if not exists species jsonb;

commit;
