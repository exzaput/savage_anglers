-- Savage Anglers - Database Additions
-- Run this in your Supabase SQL Editor to enable the new features.

-- 1. Add role to profiles
alter table public.profiles add column role text default 'user';
alter table public.profiles add column fishing_style text check (fishing_style in ('freshwater', 'saltwater', 'both'));

-- 2. Create user_gear table
create table public.user_gear (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  description text,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create user_favorite_spots table
create table public.user_favorite_spots (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  description text,
  latitude float not null,
  longitude float not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Create events table
create table public.events (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  image_url text,
  location_name text,
  latitude float,
  longitude float,
  event_date timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by uuid references public.profiles(id) on delete cascade
);

-- RLS POLICIES --

-- User Gear
alter table public.user_gear enable row level security;
create policy "User gear is viewable by everyone." on public.user_gear for select using (true);
create policy "Users can manage their own gear." on public.user_gear for all using (auth.uid() = user_id);

-- User Favorite Spots
alter table public.user_favorite_spots enable row level security;
create policy "Favorite spots are viewable by everyone." on public.user_favorite_spots for select using (true);
create policy "Users can manage their own favorite spots." on public.user_favorite_spots for all using (auth.uid() = user_id);

-- Events
alter table public.events enable row level security;
create policy "Events are viewable by everyone." on public.events for select using (true);
create policy "Only admins can manage events." on public.events for all using (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
);

-- Storage Buckets
-- Please manually create 'avatars', 'gear', and 'events' buckets in Supabase Storage and set them to PUBLIC.

-- Set initial admin (Replace with your actual user ID)
-- UPDATE public.profiles SET role = 'admin' WHERE id = 'YOUR_USER_ID_HERE';
