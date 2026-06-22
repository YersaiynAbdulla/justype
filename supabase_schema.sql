-- Run this in your Supabase SQL editor

-- Results table (individual test runs)
create table results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  wpm integer not null,
  accuracy integer not null,
  correct_words integer not null,
  error_count integer not null default 0,
  time_limit integer not null default 30,
  created_at timestamptz default now()
);

-- Enable RLS
alter table results enable row level security;

-- Users can insert and read their own results
create policy "Users can insert own results"
  on results for insert
  with check (auth.uid() = user_id);

create policy "Users can read own results"
  on results for select
  using (auth.uid() = user_id);

-- Leaderboard view (joins with auth.users for email)
create view leaderboard as
select
  r.id,
  r.wpm,
  r.accuracy,
  r.time_limit,
  r.created_at,
  u.email
from results r
join auth.users u on r.user_id = u.id;

-- Grant public read access to leaderboard view
grant select on leaderboard to anon, authenticated;
