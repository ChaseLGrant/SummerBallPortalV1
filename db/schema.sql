-- ============================================
-- Summer Ball Portal — Database Schema
-- Run in Supabase SQL Editor to set up tables
-- ============================================

-- 1) profiles — links to auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('player','coach','program')),
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- 2) player_profiles
create table if not exists public.player_profiles (
  id uuid primary key references public.profiles(id) on delete cascade,
  full_name text not null default '',
  phone text,
  email text,
  school text,
  class_year text,
  positions text[] default '{}',
  bats text,
  throws text,
  height text,
  weight int,
  hometown text,
  availability_start date,
  availability_end date,
  open_to_travel boolean default false,
  metrics jsonb default '{}',
  bio text,
  video_links text[] default '{}',
  headshot_url text,
  coach_id uuid references public.profiles(id),
  coach_uploaded boolean default false,
  updated_at timestamptz default now()
);

alter table public.player_profiles enable row level security;

create policy "Player profiles are viewable by everyone"
  on public.player_profiles for select using (true);

create policy "Players can insert own profile"
  on public.player_profiles for insert with check (
    auth.uid() = id
    or (
      coach_uploaded = true
      and coach_id = auth.uid()
      and exists (select 1 from public.profiles where id = auth.uid() and role = 'coach')
    )
  );

create policy "Players can update own profile"
  on public.player_profiles for update using (
    auth.uid() = id
    or (
      coach_uploaded = true
      and coach_id = auth.uid()
    )
  );

create policy "Coaches can delete their uploaded players"
  on public.player_profiles for delete using (
    coach_uploaded = true and coach_id = auth.uid()
  );

create index idx_player_positions on public.player_profiles using gin(positions);
create index idx_player_class_year on public.player_profiles(class_year);
create index idx_player_school on public.player_profiles(school);

-- 3) program_listings
create table if not exists public.program_listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  program_name text not null default '',
  league_name text,
  location_city text,
  location_state text,
  website text,
  contact_name text,
  contact_email text,
  contact_phone text,
  travel_type text,
  host_family text,
  league_fees numeric,
  fees_includes text,
  positions_needed text[] default '{}',
  roster_openings int,
  start_date date,
  end_date date,
  description text,
  logo_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.program_listings enable row level security;

create policy "Program listings are viewable by everyone"
  on public.program_listings for select using (true);

create policy "Program owners can insert listings"
  on public.program_listings for insert with check (
    auth.uid() = owner_id
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'program')
  );

create policy "Program owners can update own listings"
  on public.program_listings for update using (auth.uid() = owner_id);

create policy "Program owners can delete own listings"
  on public.program_listings for delete using (auth.uid() = owner_id);

create index idx_program_state on public.program_listings(location_state);
create index idx_program_positions on public.program_listings using gin(positions_needed);

-- 4) coach_profiles
create table if not exists public.coach_profiles (
  id uuid primary key references public.profiles(id) on delete cascade,
  full_name text not null default '',
  college_name text,
  title text,
  phone text,
  updated_at timestamptz default now()
);

alter table public.coach_profiles enable row level security;

create policy "Coach profiles are viewable by everyone"
  on public.coach_profiles for select using (true);

create policy "Coaches can insert own profile"
  on public.coach_profiles for insert with check (auth.uid() = id);

create policy "Coaches can update own profile"
  on public.coach_profiles for update using (auth.uid() = id);

-- ============================================
-- Storage Buckets (run separately or via dashboard)
-- ============================================
-- Create buckets: 'avatars' and 'logos' in Supabase Dashboard > Storage
-- Set them as public buckets for read access
-- Add policies:
--   avatars: authenticated users can upload to their own folder (uid/*)
--   logos: authenticated users with role=program can upload
