-- Forest feedback table
-- Run this in your Supabase SQL editor after creating the project

create table if not exists public.feedback (
  id                   uuid        primary key default gen_random_uuid(),
  category             text        not null,
  message              text        not null,
  name                 text,
  email                text,
  linkedin             text,
  github               text,
  website              text,
  public_acknowledgment boolean    not null default false,
  status               text        not null default 'pending',
  -- Where the record came from. Public form submissions are always
  -- 'community'; the other sources are internally-seeded improvement insights
  -- (own review, research-assisted, or backed by real analytics) and never
  -- grow trees. See supabase/migrations for the backfill.
  source               text        not null default 'community',
  -- Stable, human-readable key for idempotent internal seeds. Null for
  -- community records; unique when present so re-running a seed is a no-op.
  source_reference     text,
  trees_planted        integer     not null default 0,
  ip                   text,
  created_at           timestamptz not null default now(),

  constraint feedback_category_check check (
    category in ('UX', 'Accessibility', 'Performance', 'Design', 'Content', 'Bug', 'General thoughts')
  ),
  constraint feedback_status_check check (
    status in ('pending', 'accepted', 'rejected', 'implemented')
  ),
  constraint feedback_source_check check (
    source in ('community', 'self_review', 'research_assisted', 'analytics')
  )
);

-- Idempotency guard for internal seeds (community rows keep source_reference null)
create unique index if not exists feedback_source_reference_key
  on public.feedback (source_reference)
  where source_reference is not null;

-- Enable Row Level Security
alter table public.feedback enable row level security;

-- Anyone (anon or authenticated) can INSERT new feedback
create policy "Anyone can submit feedback"
  on public.feedback
  for insert
  to anon, authenticated
  with check (true);

-- Only authenticated users (you, via the Supabase dashboard or admin app) can SELECT / UPDATE
create policy "Authenticated users can read feedback"
  on public.feedback
  for select
  to authenticated
  using (true);

create policy "Authenticated users can update feedback"
  on public.feedback
  for update
  to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- Tree-Nation counter cache
--
-- Holds a single row (id = 'tree-nation'). The site reads its forest totals
-- from Tree-Nation at most once per 24h and serves the cached values in
-- between, so a slow or unavailable Tree-Nation never blocks a page build.
--
-- Everything but tree_count is nullable: the enrichments are secondary, so a
-- failed fetch of any one stores null rather than discarding a good total.
-- ---------------------------------------------------------------------------

create table if not exists public.forest_sync (
  id          text        primary key,
  tree_count  integer     not null,
  month_count integer,
  -- Cached projection of Tree-Nation's per-project breakdown: read and
  -- replaced whole, never queried by field, so jsonb rather than a child table.
  projects    jsonb,
  -- Species detail for the featured project, resolved from the CMS names.
  species     jsonb,
  synced_at   timestamptz not null default now()
);

-- Written only by the server (service role); never exposed to anon.
alter table public.forest_sync enable row level security;
