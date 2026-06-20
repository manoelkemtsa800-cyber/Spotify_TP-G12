-- ============================================================
-- SCHÉMA SUPABASE — Spotify Clone
-- Exécute ce script dans : Supabase > SQL Editor > New query > Run
-- ============================================================

create table if not exists profiles (
  id uuid primary key,
  username text,
  avatar_url text,
  is_anonymous boolean default false,
  created_at timestamp with time zone default now()
);

create table if not exists tracks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  artist text not null,
  album text,
  duration_seconds integer not null default 0,
  cover_url text,
  audio_url text not null,
  owner_id text not null,
  created_at timestamp with time zone default now()
);

create table if not exists playlists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  cover_url text,
  owner_id text not null,
  is_public boolean default false,
  created_at timestamp with time zone default now()
);

create table if not exists playlist_tracks (
  playlist_id uuid references playlists(id) on delete cascade,
  track_id uuid references tracks(id) on delete cascade,
  position integer not null default 0,
  primary key (playlist_id, track_id)
);

create table if not exists listening_history (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  track_id uuid references tracks(id) on delete cascade,
  listened_at timestamp with time zone default now()
);

-- ============================================================
-- SÉCURITÉ (RLS)
-- ============================================================

alter table tracks enable row level security;
alter table playlists enable row level security;
alter table playlist_tracks enable row level security;
alter table listening_history enable row level security;
alter table profiles enable row level security;

create policy "Lecture publique tracks" on tracks for select using (true);
create policy "Insertion tracks" on tracks for insert with check (true);
create policy "Suppression tracks" on tracks for delete using (true);

create policy "Lecture publique playlists" on playlists for select using (true);
create policy "Insertion playlists" on playlists for insert with check (true);
create policy "Suppression playlists" on playlists for delete using (true);

create policy "Lecture playlist_tracks" on playlist_tracks for select using (true);
create policy "Insertion playlist_tracks" on playlist_tracks for insert with check (true);
create policy "Suppression playlist_tracks" on playlist_tracks for delete using (true);

create policy "Lecture historique" on listening_history for select using (true);
create policy "Insertion historique" on listening_history for insert with check (true);

create policy "Lecture profiles" on profiles for select using (true);
create policy "Insertion profiles" on profiles for insert with check (true);

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================

insert into storage.buckets (id, name, public)
values ('audio-tracks', 'audio-tracks', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('track-covers', 'track-covers', true)
on conflict (id) do nothing;

create policy "Lecture audio" on storage.objects for select using (bucket_id = 'audio-tracks');
create policy "Upload audio" on storage.objects for insert with check (bucket_id = 'audio-tracks');
create policy "Lecture covers" on storage.objects for select using (bucket_id = 'track-covers');
create policy "Upload covers" on storage.objects for insert with check (bucket_id = 'track-covers');
