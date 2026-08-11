-- Forest sync: a separate clock for the counters
-- ---------------------------------------------------------------------------
-- One synced_at governed everything, so the tree counters inherited the 24h
-- window the projects and species need. That meant the headline figure could
-- be a day out of date — and it was, on the day the forest reached its season
-- target: the site read 47/50 while Tree-Nation already said 50.
--
-- The counters now refresh on the page's own ISR cadence and keep their time
-- here; synced_at stays with the projects and species, which change rarely and
-- cost one request per species to resolve.
--
-- Nullable: rows written before the split have no counter timestamp, which
-- correctly reads as "stale" and triggers one refresh.
--
-- Idempotent. Run once in the Supabase SQL editor (DDL cannot go through the
-- REST service key).
-- ---------------------------------------------------------------------------

begin;

alter table public.forest_sync
  add column if not exists counters_synced_at timestamptz;

commit;
