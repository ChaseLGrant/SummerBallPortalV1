-- =============================================================================
-- Summer Ball Portal – Supabase Database Schema
-- Run this in the Supabase SQL Editor to set up all required tables.
-- =============================================================================

-- 1. Profiles (extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

-- Auto-create a profile when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. Listings
create table if not exists public.listings (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text not null,
  price numeric(10,2) not null check (price >= 0),
  category text not null check (category in ('tickets','accommodation','transport','outfits','accessories','other')),
  status text not null default 'active' check (status in ('active','sold','reserved','expired')),
  image_url text,
  seller_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.listings enable row level security;

create policy "Listings are viewable by everyone"
  on public.listings for select using (true);

create policy "Authenticated users can create listings"
  on public.listings for insert with check (auth.uid() = seller_id);

create policy "Users can update their own listings"
  on public.listings for update using (auth.uid() = seller_id);

create policy "Users can delete their own listings"
  on public.listings for delete using (auth.uid() = seller_id);

-- 3. Messages
create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  listing_id uuid references public.listings(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  receiver_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  read boolean default false not null,
  created_at timestamptz default now() not null
);

alter table public.messages enable row level security;

create policy "Users can view their own messages"
  on public.messages for select using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "Authenticated users can send messages"
  on public.messages for insert with check (auth.uid() = sender_id);

create policy "Receivers can mark messages as read"
  on public.messages for update using (auth.uid() = receiver_id);

-- 4. Indexes for performance
create index if not exists idx_listings_seller on public.listings(seller_id);
create index if not exists idx_listings_category on public.listings(category);
create index if not exists idx_listings_status on public.listings(status);
create index if not exists idx_messages_sender on public.messages(sender_id);
create index if not exists idx_messages_receiver on public.messages(receiver_id);
create index if not exists idx_messages_listing on public.messages(listing_id);

-- 5. Storage bucket for listing images
insert into storage.buckets (id, name, public)
values ('listings', 'listings', true)
on conflict (id) do nothing;

create policy "Anyone can view listing images"
  on storage.objects for select using (bucket_id = 'listings');

create policy "Authenticated users can upload listing images"
  on storage.objects for insert with check (bucket_id = 'listings' and auth.role() = 'authenticated');

create policy "Users can delete their own listing images"
  on storage.objects for delete using (bucket_id = 'listings' and auth.uid()::text = (storage.foldername(name))[1]);
