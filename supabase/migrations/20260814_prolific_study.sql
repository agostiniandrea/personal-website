-- Prolific usability study support
-- ---------------------------------------------------------------------------
-- Lets a recruited usability-study participant submit through the normal
-- Forest feedback form while keeping those records clearly separate from real
-- community feedback.
--
-- Three nullable columns carry the Prolific identifiers that arrive as URL
-- parameters on the study link. They stay null for every ordinary visitor, so
-- nothing about the public form changes.
--
-- A new `usability_study` source keeps the public Forest counters honest:
-- solicited, paid feedback is not a community insight and never grows trees.
-- See lib/utils/forestStats.ts for the queries that exclude it.
--
-- This script is idempotent: re-running it adds no column twice and leaves the
-- constraint in its intended final state. Run it once in the Supabase SQL
-- editor (DDL cannot be issued through the REST service key).
-- ---------------------------------------------------------------------------

begin;

-- 1. Prolific identifiers ---------------------------------------------------
--    Pseudonymous participant id, plus the study and submission it belongs to.
--    All nullable: a null pid is what marks a row as an ordinary visitor's.
alter table public.feedback
  add column if not exists prolific_pid text;

alter table public.feedback
  add column if not exists prolific_study_id text;

alter table public.feedback
  add column if not exists prolific_session_id text;

-- 2. Widen the allowed sources ----------------------------------------------
--    Dropped and re-added rather than guarded on existence: the constraint
--    already exists from 20260731 and needs a new list, and this form leaves
--    the same final state however many times it runs.
alter table public.feedback
  drop constraint if exists feedback_source_check;

alter table public.feedback
  add constraint feedback_source_check
  check (source in (
    'community',
    'self_review',
    'research_assisted',
    'analytics',
    'usability_study'
  ));

-- 3. One submission per Prolific submission ---------------------------------
--    The API checks this before inserting so it can answer with a readable
--    message; the index is the race-condition backstop. Partial, so the
--    nulls of every ordinary visitor never collide.
create unique index if not exists feedback_prolific_session_key
  on public.feedback (prolific_session_id)
  where prolific_session_id is not null;

commit;
