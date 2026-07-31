-- Forest feedback source model
-- ---------------------------------------------------------------------------
-- Adds a transparent `source` dimension to the feedback table so the portfolio
-- can distinguish real community feedback from internally-generated
-- improvement insights, WITHOUT inventing external reviewers.
--
-- Sources:
--   community          — submitted through the public feedback form (grows trees)
--   self_review        — my own review of the site
--   research_assisted  — informed by research / AI comparison / benchmarking
--   analytics          — backed by real analytics evidence
--
-- This script is idempotent: re-running it adds no columns twice, no duplicate
-- constraints, and no duplicate seed rows. Run it once in the Supabase SQL
-- editor (DDL cannot be issued through the REST service key).
-- ---------------------------------------------------------------------------

begin;

-- 1. Columns ----------------------------------------------------------------
alter table public.feedback
  add column if not exists source text not null default 'community';

alter table public.feedback
  add column if not exists source_reference text;

alter table public.feedback
  add column if not exists trees_planted integer not null default 0;

-- 2. Backfill the pre-existing public records explicitly as community.
--    (The column default already covers them; this is belt-and-braces so the
--    intent is unmistakable and safe to re-run.)
update public.feedback
set source = 'community'
where source is null;

-- 3. Constrain the allowed sources (guarded so re-runs don't error).
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'feedback_source_check'
  ) then
    alter table public.feedback
      add constraint feedback_source_check
      check (source in ('community', 'self_review', 'research_assisted', 'analytics'));
  end if;
end $$;

-- 4. Idempotency guard for internal seeds. Community rows keep a null
--    source_reference; internal rows carry a stable unique slug.
create unique index if not exists feedback_source_reference_key
  on public.feedback (source_reference)
  where source_reference is not null;

-- 5. Seed the verified internal improvement insights.
--    Each row maps to a real, merged improvement (PR + date in git history).
--    status = 'implemented', trees_planted = 0 (internal insights never grow
--    trees), public_acknowledgment = false. Re-running is a no-op via ON CONFLICT.
insert into public.feedback
  (category, message, name, source, source_reference, status, trees_planted, public_acknowledgment, created_at)
values
  ('UX',
   'Added a persistent app-style bottom tab bar so mobile navigation stays within thumb reach.',
   'Andrea', 'self_review', 'self-review/mobile-bottom-nav', 'implemented', 0, false, '2026-07-18T12:00:00Z'),

  ('UX',
   'Canonicalised mobile deep links so navigating between sections leaves clean, shareable URLs.',
   'Andrea', 'self_review', 'self-review/clean-mobile-urls', 'implemented', 0, false, '2026-07-18T12:00:00Z'),

  ('Design',
   'Removed the floating scroll-to-top control on mobile to reduce visual clutter over content.',
   'Andrea', 'self_review', 'self-review/remove-scroll-to-top', 'implemented', 0, false, '2026-07-23T12:00:00Z'),

  ('UX',
   'Redesigned the mobile More sheet: clearer structure, larger tap targets and a reliable close action.',
   'Andrea · Research review', 'research_assisted', 'research/more-sheet-rework', 'implemented', 0, false, '2026-07-23T12:00:00Z'),

  ('Design',
   'Reworked the Forest teaser to the intended height with a full-height botanical pattern, tuned for dark mode.',
   'Andrea · Research review', 'research_assisted', 'research/forest-teaser-treatment', 'implemented', 0, false, '2026-07-23T12:00:00Z'),

  ('Design',
   'Aligned mobile body content to the header on one consistent 16px gutter across every section.',
   'Andrea', 'self_review', 'self-review/mobile-gutter-alignment', 'implemented', 0, false, '2026-07-24T12:00:00Z'),

  ('UX',
   'Consolidated the footer''s contact and social links into the mobile More sheet.',
   'Andrea', 'self_review', 'self-review/footer-into-more', 'implemented', 0, false, '2026-07-24T12:00:00Z')
on conflict (source_reference) where source_reference is not null do nothing;

commit;
