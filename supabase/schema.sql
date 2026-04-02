-- Daily Guide — paste into Supabase SQL Editor and run once.
-- Storage: Dashboard → Storage → New bucket → name: post-images → Public bucket ON.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
drop policy if exists "profiles_select_all" on public.profiles;
create policy "profiles_select_all" on public.profiles for select using (true);
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

create table if not exists public.communities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  created_by uuid references auth.users (id),
  created_at timestamptz not null default now()
);
alter table public.communities enable row level security;
drop policy if exists "communities_read" on public.communities;
create policy "communities_read" on public.communities for select using (true);
drop policy if exists "communities_insert_auth" on public.communities;
create policy "communities_insert_auth" on public.communities for insert with check (auth.role() = 'authenticated');

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  image_url text,
  community_id uuid not null references public.communities (id) on delete restrict,
  author_id uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now()
);
alter table public.posts enable row level security;
drop policy if exists "posts_read" on public.posts;
create policy "posts_read" on public.posts for select using (true);
drop policy if exists "posts_insert_own" on public.posts;
create policy "posts_insert_own" on public.posts for insert with check (auth.uid() = author_id);

create table if not exists public.answers (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  body text not null,
  author_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.answers enable row level security;
drop policy if exists "answers_read" on public.answers;
create policy "answers_read" on public.answers for select using (true);
drop policy if exists "answers_insert_own" on public.answers;
create policy "answers_insert_own" on public.answers for insert with check (auth.uid() = author_id);

create table if not exists public.community_members (
  user_id uuid not null references auth.users (id) on delete cascade,
  community_id uuid not null references public.communities (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, community_id)
);
alter table public.community_members enable row level security;
drop policy if exists "cm_select_own" on public.community_members;
create policy "cm_select_own" on public.community_members for select using (auth.uid() = user_id);
drop policy if exists "cm_insert_own" on public.community_members;
create policy "cm_insert_own" on public.community_members for insert with check (auth.uid() = user_id);
drop policy if exists "cm_delete_own" on public.community_members;
create policy "cm_delete_own" on public.community_members for delete using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $func$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'display_name',
      split_part(new.email, '@', 1),
      'User'
    )
  );
  return new;
end;
$func$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

insert into public.communities (name, slug, description)
 values
  ('Everyday problems', 'everyday-problems', 'Locks, keys, travel hiccups, and small crises.'),
  ('Career', 'career', 'Interviews, resumes, and workplace navigation.'),
  ('News & updates', 'news', 'Community announcements and timely discussion.'),
  ('General', 'general', 'Anything that does not fit elsewhere.')
 on conflict (slug) do nothing;
-- Optional: Storage policies (after bucket "post-images" exists and is public)
-- insert into storage.buckets (id, name, public) values ('post-images', 'post-images', true)
--   on conflict (id) do nothing;
-- create policy "read_post_images" on storage.objects for select using (bucket_id = 'post-images');
-- create policy "upload_post_images" on storage.objects for insert
--   with check (bucket_id = 'post-images' and auth.role() = 'authenticated');