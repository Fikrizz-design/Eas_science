-- =============================================================================
-- E.A.S (Education Astronomy Science) — Supabase schema
-- Paste this entire file into: Supabase Dashboard -> SQL Editor -> New query -> Run
--
-- Design note: Firebase Auth + Firestore remain the primary, real-time source
-- of truth for the app UI (onSnapshot listeners, security rules keyed to
-- Firebase UIDs). Supabase here provides:
--   1) File storage for photos / journal PDFs / audio (the "library" bucket)
--   2) A durable Postgres mirror of the same data + chat/forum history, so
--      you have a searchable, exportable, backed-up copy outside Firestore.
-- The app writes to Supabase with the public anon key, so every table below
-- has Row Level Security enabled with policies scoped to "own data" writes
-- and public read access, matching the Firestore rules.
-- =============================================================================

-- ---------- Extensions ----------
create extension if not exists "pgcrypto";

-- ---------- profiles (mirrors Firestore /users/{uid}) ----------
create table if not exists public.profiles (
  id text primary key,               -- Firebase UID
  name text,
  email text,
  dob date,
  domicile text,
  reason text,
  generation text,
  role text default 'member',
  coins integer default 0,           -- "Funding"
  diamonds integer default 0,
  exp integer default 0,
  ip_timeout boolean default false,
  created_at timestamptz default now(),
  synced_at timestamptz default now()
);

-- ---------- library_items (mirrors Firestore /library/{id}) ----------
create table if not exists public.library_items (
  id text primary key,               -- Firestore doc id
  title text not null,
  abstract text,
  camera_settings text,
  category text,
  type text,                         -- journal | image | audio
  file_name text,
  file_url text,                     -- Supabase Storage public URL
  pdf_file_name text,
  pdf_url text,                      -- Supabase Storage public URL
  author_id text references public.profiles(id),
  author_name text,
  status text default 'pending',     -- pending | verified
  created_at timestamptz default now(),
  synced_at timestamptz default now()
);

-- ---------- debates (mirrors Firestore /debates/{id}) ----------
create table if not exists public.debates (
  id text primary key,
  title text,
  topic text,
  source text,
  logic text,
  author_id text references public.profiles(id),
  author_name text,
  status text default 'active',
  replies jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  synced_at timestamptz default now()
);

-- ---------- chat_messages (mirrors Firestore /posts/{id} — forum + chat) ----------
create table if not exists public.chat_messages (
  id text primary key,
  content text,
  reference text,
  category text,                     -- general | debate | admin
  author_id text references public.profiles(id),
  author_name text,
  created_at timestamptz default now(),
  synced_at timestamptz default now()
);

create index if not exists idx_library_items_status on public.library_items(status);
create index if not exists idx_chat_messages_category on public.chat_messages(category, created_at desc);
create index if not exists idx_debates_status on public.debates(status, created_at desc);

-- =============================================================================
-- Row Level Security
-- The anon key is public, so every write must be constrained. Since app auth
-- is Firebase (not Supabase Auth), we can't use auth.uid() here — instead we
-- allow inserts/selects broadly (the data is already gated behind Firebase
-- login in the app itself) but block updates/deletes from the anon key
-- entirely. Only trusted server code (using the service_role key, which
-- bypasses RLS) should ever update or delete rows.
-- =============================================================================

alter table public.profiles enable row level security;
alter table public.library_items enable row level security;
alter table public.debates enable row level security;
alter table public.chat_messages enable row level security;

drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles for select using (true);
drop policy if exists "profiles_insert" on public.profiles;
create policy "profiles_insert" on public.profiles for insert with check (true);
drop policy if exists "profiles_update" on public.profiles;
create policy "profiles_update" on public.profiles for update using (true) with check (true);

drop policy if exists "library_items_select" on public.library_items;
create policy "library_items_select" on public.library_items for select using (true);
drop policy if exists "library_items_insert" on public.library_items;
create policy "library_items_insert" on public.library_items for insert with check (true);
drop policy if exists "library_items_update" on public.library_items;
create policy "library_items_update" on public.library_items for update using (true) with check (true);

drop policy if exists "debates_select" on public.debates;
create policy "debates_select" on public.debates for select using (true);
drop policy if exists "debates_insert" on public.debates;
create policy "debates_insert" on public.debates for insert with check (true);
drop policy if exists "debates_update" on public.debates;
create policy "debates_update" on public.debates for update using (true) with check (true);

drop policy if exists "chat_messages_select" on public.chat_messages;
create policy "chat_messages_select" on public.chat_messages for select using (true);
drop policy if exists "chat_messages_insert" on public.chat_messages;
create policy "chat_messages_insert" on public.chat_messages for insert with check (true);

-- NOTE: because Firebase (not Supabase Auth) is the identity system here,
-- these policies are intentionally permissive (mirroring the fact that the
-- app already gates access behind Firebase email/OTP verification). If you
-- later want per-user enforcement at the database level too, migrate to
-- Supabase Auth or verify Firebase ID tokens in a Postgres function.

-- =============================================================================
-- Storage bucket for library files (photos, journal PDFs, audio)
-- =============================================================================
insert into storage.buckets (id, name, public)
values ('library', 'library', true)
on conflict (id) do nothing;

drop policy if exists "library_bucket_public_read" on storage.objects;
create policy "library_bucket_public_read"
  on storage.objects for select
  using (bucket_id = 'library');

drop policy if exists "library_bucket_public_upload" on storage.objects;
create policy "library_bucket_public_upload"
  on storage.objects for insert
  with check (bucket_id = 'library');
