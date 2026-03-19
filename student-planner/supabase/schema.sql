create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_number text not null,
  assignment_name text not null,
  due_date date,
  priority text not null default 'Yellow' check (priority in ('Red', 'Yellow', 'Green')),
  comment text not null default '',
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists assignments_user_id_idx
on public.assignments (user_id);

create index if not exists assignments_user_id_due_date_idx
on public.assignments (user_id, due_date);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists set_assignments_updated_at on public.assignments;
create trigger set_assignments_updated_at
before update on public.assignments
for each row
execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.assignments enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Users can view own assignments" on public.assignments;
create policy "Users can view own assignments"
on public.assignments
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own assignments" on public.assignments;
create policy "Users can insert own assignments"
on public.assignments
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own assignments" on public.assignments;
create policy "Users can update own assignments"
on public.assignments
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own assignments" on public.assignments;
create policy "Users can delete own assignments"
on public.assignments
for delete
to authenticated
using (auth.uid() = user_id);
