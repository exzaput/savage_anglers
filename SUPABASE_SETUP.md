# Supabase Setup for Savage Anglers

Please run the following SQL in your Supabase SQL Editor to set up the database schema and Row Level Security (RLS).

```sql
-- 1. Profiles Table
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  username text unique,
  full_name text,
  avatar_url text,
  bio text,
  location text,
  experience_level text check (experience_level in ('beginner', 'intermediate', 'pro')),
  latitude float,
  longitude float,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Posts Table
create table public.posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text,
  image_url text,
  type text check (type in ('general', 'catch', 'spot', 'gear')) default 'general',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Fishing Spots Table
create table public.fishing_spots (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  name text not null,
  location_name text,
  latitude float,
  longitude float,
  water_condition text,
  best_time text
);

-- 4. Gear Setups Table
create table public.gear_setups (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  rod text,
  reel text,
  line text,
  lure text,
  technique text
);

-- 5. Marketplace Items Table
create table public.marketplace_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  price numeric not null,
  description text,
  image_url text,
  category text check (category in ('Joran', 'Reel', 'Senar', 'Umpan', 'Aksesoris')),
  location_name text,
  latitude float,
  longitude float,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Comments Table
create table public.comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Likes Table
create table public.likes (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(post_id, user_id)
);

-- 8. Messages Table
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  receiver_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. Trigger for Profile Creation
-- This trigger automatically creates a profile entry when a new user signs up.
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, full_name, experience_level)
  values (
    new.id, 
    new.raw_user_meta_data->>'username', 
    new.raw_user_meta_data->>'full_name', 
    'beginner'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RLS POLICIES --

-- Profiles
alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);

-- Posts
alter table public.posts enable row level security;
create policy "Posts are viewable by everyone." on public.posts for select using (true);
create policy "Authenticated users can create posts." on public.posts for insert with check (auth.role() = 'authenticated');
create policy "Users can update own posts." on public.posts for update using (auth.uid() = user_id);
create policy "Users can delete own posts." on public.posts for delete using (auth.uid() = user_id);

-- Fishing Spots
alter table public.fishing_spots enable row level security;
create policy "Fishing spots are viewable by everyone." on public.fishing_spots for select using (true);
create policy "Authenticated users can create spots." on public.fishing_spots for insert with check (auth.role() = 'authenticated');

-- Gear Setups
alter table public.gear_setups enable row level security;
create policy "Gear setups are viewable by everyone." on public.gear_setups for select using (true);
create policy "Authenticated users can create setups." on public.gear_setups for insert with check (auth.role() = 'authenticated');

-- Marketplace
alter table public.marketplace_items enable row level security;
create policy "Marketplace items are viewable by everyone." on public.marketplace_items for select using (true);
create policy "Authenticated users can create items." on public.marketplace_items for insert with check (auth.role() = 'authenticated');
create policy "Users can update own items." on public.marketplace_items for update using (auth.uid() = user_id);
create policy "Users can delete own items." on public.marketplace_items for delete using (auth.uid() = user_id);

-- Comments
alter table public.comments enable row level security;
create policy "Comments are viewable by everyone." on public.comments for select using (true);
create policy "Authenticated users can comment." on public.comments for insert with check (auth.role() = 'authenticated');
create policy "Users can delete own comments." on public.comments for delete using (auth.uid() = user_id);

-- Likes
alter table public.likes enable row level security;
create policy "Likes are viewable by everyone." on public.likes for select using (true);
create policy "Authenticated users can like." on public.likes for insert with check (auth.role() = 'authenticated');
create policy "Users can unlike." on public.likes for delete using (auth.uid() = user_id);

-- Messages
alter table public.messages enable row level security;
create policy "Users can view their own messages." on public.messages for select using (auth.uid() = sender_id or auth.uid() = receiver_id);
create policy "Authenticated users can send messages." on public.messages for insert with check (auth.role() = 'authenticated');

-- Realtime
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.posts;
alter publication supabase_realtime add table public.comments;
alter publication supabase_realtime add table public.likes;

-- Storage Buckets
-- Create 'avatars', 'posts', 'marketplace' buckets in Supabase Storage and set them to public.

-- ==========================================
-- SEED DATA (Optional: Run this to populate the app)
-- ==========================================

-- 1. Create some profiles (Note: In a real app, these are created via Auth)
-- For this demo, we assume these IDs exist or you can replace them with real UIDs
-- INSERT INTO public.profiles (id, username, full_name, bio, location, experience_level) VALUES 
-- ('uid-1', 'angler_nusantara', 'Budi Santoso', 'Spesialis casting gabus dan toman.', 'Palembang, Sumsel', 'pro'),
-- ('uid-2', 'putri_mancing', 'Siti Aminah', 'Hobi mancing di dermaga akhir pekan.', 'Semarang, Jateng', 'beginner'),
-- ('uid-3', 'monster_hunter_id', 'Andi Wijaya', 'Mencari monster laut dalam.', 'Bali', 'pro');

-- 2. Sample Posts
-- INSERT INTO public.posts (user_id, content, image_url, type) VALUES
-- ('uid-1', 'Strike Toman monster di rawa Sumatera! Tarikannya luar biasa.', 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?q=80&w=1000&auto=format&fit=crop', 'catch'),
-- ('uid-2', 'Santai sore di dermaga Semarang. Lumayan dapat beberapa ekor bandeng.', 'https://images.unsplash.com/photo-1516939884455-1445c8652f83?q=80&w=1000&auto=format&fit=crop', 'general'),
-- ('uid-3', 'Spot rahasia di pesisir Bali. Air jernih, banyak GT.', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1000&auto=format&fit=crop', 'spot');

-- 3. Sample Spots
-- INSERT INTO public.fishing_spots (post_id, name, location_name, water_condition, best_time) VALUES
-- ((SELECT id FROM public.posts WHERE content LIKE '%rawa Sumatera%'), 'Rawa Ogan', 'Ogan Ilir, Sumsel', 'Keruh', 'Pagi hari'),
-- ((SELECT id FROM public.posts WHERE content LIKE '%pesisir Bali%'), 'Pantai Melasti', 'Ungasan, Bali', 'Sangat Jernih', 'Sore hari');

-- 4. Sample Marketplace Items
-- INSERT INTO public.marketplace_items (user_id, title, price, description, category, image_url, location_name) VALUES
-- ('uid-1', 'Reel Shimano Stella 4000', 8500000, 'Kondisi mulus 95%, jarang dipakai.', 'Reel', 'https://images.unsplash.com/photo-1611095777215-83d534f9a5d5?q=80&w=1000&auto=format&fit=crop', 'Palembang'),
-- ('uid-3', 'Joran Custom Maguro', 1200000, 'Cocok untuk jigging ringan.', 'Joran', 'https://images.unsplash.com/photo-1593106410288-caf65eca7c9d?q=80&w=1000&auto=format&fit=crop', 'Denpasar');
```
