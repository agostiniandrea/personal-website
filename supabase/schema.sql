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
  ip                   text,
  created_at           timestamptz not null default now(),

  constraint feedback_category_check check (
    category in ('UX', 'Accessibility', 'Performance', 'Design', 'Content', 'Bug', 'General thoughts')
  ),
  constraint feedback_status_check check (
    status in ('pending', 'accepted', 'rejected', 'implemented')
  )
);

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
