-- Forest sync: monthly tree counter
-- ---------------------------------------------------------------------------
-- Tree-Nation exposes two counters for a forest:
--   /api/forests/{slug}/tree_counter        → trees since the forest opened
--   /api/forests/{slug}/tree_counter/month  → trees planted this month
--
-- The table already caches the total so the site survives Tree-Nation being
-- slow or down. This adds the monthly figure to the same cached row, synced in
-- the same 24h window.
--
-- Nullable on purpose: the month counter is a nice-to-have next to the total,
-- so a failed month fetch stores null rather than discarding a good total, and
-- the UI simply omits the line.
--
-- NOTE: forest_sync was created directly in the dashboard and never recorded
-- in schema.sql. Its definition is added there in the same change, so the file
-- describes the database that actually exists.
--
-- Idempotent. Run once in the Supabase SQL editor (DDL cannot go through the
-- REST service key).
-- ---------------------------------------------------------------------------

begin;

alter table public.forest_sync
  add column if not exists month_count integer;

commit;
