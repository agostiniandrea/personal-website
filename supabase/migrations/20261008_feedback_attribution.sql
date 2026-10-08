-- Feedback marketing attribution
-- ---------------------------------------------------------------------------
-- Records which campaign a feedback submission came from (UTM parameters on
-- the landing URL), so a paid campaign can be judged by the feedback it
-- produces rather than by traffic.
--
-- Metadata only. These columns are SEPARATE from `source` and never change it:
-- a visitor from Reddit who submits through the public form is still
-- source = 'community', still counts toward the public feedback total and
-- still grows trees exactly as before. `source`, its check constraint and
-- lib/utils/forestStats.ts are untouched.
--
-- Five nullable columns, one per UTM parameter. They are null for direct
-- visitors (no "direct" is ever invented), for internally-seeded insights and
-- for Prolific study submissions, which are deliberately never attributed.
-- Values arrive lowercased and sanitised by the API; the constraint below is
-- the database-side backstop for the length.
--
-- Example: feedback produced by the Reddit campaign.
--   select count(*) from public.feedback
--   where source = 'community' and attribution_source = 'reddit';
--
-- This script is idempotent: re-running it adds no column twice and leaves the
-- constraint in its intended final state. Run it ONCE in the Supabase SQL
-- editor (DDL cannot be issued through the REST service key) BEFORE deploying
-- the code that writes these columns — an insert naming a missing column fails.
-- ---------------------------------------------------------------------------

begin;

-- 1. Attribution columns ----------------------------------------------------
alter table public.feedback
  add column if not exists attribution_source text;

alter table public.feedback
  add column if not exists attribution_medium text;

alter table public.feedback
  add column if not exists attribution_campaign text;

alter table public.feedback
  add column if not exists attribution_content text;

alter table public.feedback
  add column if not exists attribution_term text;

-- 2. Length backstop --------------------------------------------------------
--    Dropped and re-added rather than guarded on existence, so the final state
--    is the same however many times this runs. char_length(null) is null, and
--    a null check passes, so direct visitors are unaffected.
alter table public.feedback
  drop constraint if exists feedback_attribution_length_check;

alter table public.feedback
  add constraint feedback_attribution_length_check
  check (
    char_length(attribution_source)   <= 100 and
    char_length(attribution_medium)   <= 100 and
    char_length(attribution_campaign) <= 100 and
    char_length(attribution_content)  <= 100 and
    char_length(attribution_term)     <= 100
  );

commit;
