-- GuardHours initial schema, RLS, and clock helpers

create extension if not exists "pgcrypto";

-- Sites assigned to guards
create table public.sites (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  created_at timestamptz not null default now()
);

-- Profiles linked to Supabase Auth users
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  employee_id text not null,
  full_name text not null,
  mobile text,
  site_id uuid references public.sites (id) on delete set null,
  role text not null default 'guard' check (role in ('guard', 'admin')),
  created_at timestamptz not null default now(),
  constraint profiles_employee_id_unique unique (employee_id)
);

create unique index profiles_mobile_unique on public.profiles (mobile)
  where mobile is not null and mobile <> '';

-- Shift attendance records
create table public.attendance (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  clock_in timestamptz not null default now(),
  clock_out timestamptz,
  created_at timestamptz not null default now(),
  constraint attendance_clock_out_after_in check (
    clock_out is null or clock_out > clock_in
  )
);

-- One active (open) shift per guard
create unique index attendance_one_active_shift_per_user
  on public.attendance (user_id)
  where clock_out is null;

create index attendance_user_clock_in_idx on public.attendance (user_id, clock_in desc);
create index attendance_clock_in_idx on public.attendance (clock_in desc);

-- Helpers
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.prevent_attendance_tamper()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() then
    return new;
  end if;

  if tg_op = 'UPDATE' then
    if new.user_id is distinct from old.user_id
      or new.clock_in is distinct from old.clock_in
      or new.created_at is distinct from old.created_at then
      raise exception 'Guards may only clock out of an active shift';
    end if;
    if old.clock_out is not null then
      raise exception 'Shift is already closed';
    end if;
    if new.clock_out is null then
      raise exception 'Invalid clock out';
    end if;
  end if;

  return new;
end;
$$;

create trigger attendance_prevent_tamper
  before update on public.attendance
  for each row
  execute function public.prevent_attendance_tamper();

alter table public.sites enable row level security;
alter table public.profiles enable row level security;
alter table public.attendance enable row level security;

-- Sites: guards read assigned site; admins read all
create policy "Guards read own site"
  on public.sites for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.site_id = sites.id
    )
  );

create policy "Admins manage sites"
  on public.sites for all
  using (public.is_admin())
  with check (public.is_admin());

-- Profiles
create policy "Users read own profile"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

create policy "Admins manage profiles"
  on public.profiles for all
  using (public.is_admin())
  with check (public.is_admin());

-- Attendance
create policy "Read attendance"
  on public.attendance for select
  using (user_id = auth.uid() or public.is_admin());

create policy "Clock in"
  on public.attendance for insert
  with check (
    user_id = auth.uid()
    and clock_out is null
    and not exists (
      select 1
      from public.attendance a
      where a.user_id = auth.uid() and a.clock_out is null
    )
  );

create policy "Clock out active shift"
  on public.attendance for update
  using (user_id = auth.uid() and clock_out is null)
  with check (user_id = auth.uid());

create policy "Admins manage attendance"
  on public.attendance for all
  using (public.is_admin())
  with check (public.is_admin());
