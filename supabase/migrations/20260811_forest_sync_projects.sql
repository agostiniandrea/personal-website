-- Forest sync: the projects the forest is spread across
-- ---------------------------------------------------------------------------
-- Tree-Nation's own profile page reads its per-project breakdown from
--
--   GET /impactPeriods?profile_id={id}&to={YYYY-MM-DD HH:MM:SS}
--       header: X-API-VERSION: 1
--
-- which is NOT part of the documented API. It can change or start requiring
-- auth without notice, so the derived list is cached here alongside the
-- counters: if the fetch fails, the site keeps serving the last good list, and
-- if none was ever stored the block is simply not rendered.
--
-- jsonb rather than a child table: this is a cached projection of someone
-- else's data, read and replaced whole, never queried by field or joined.
-- A table would buy nothing and add a migration every time their shape moves.
--
-- Idempotent. Run once in the Supabase SQL editor (DDL cannot go through the
-- REST service key).
-- ---------------------------------------------------------------------------

begin;

alter table public.forest_sync
  add column if not exists projects jsonb;

commit;
