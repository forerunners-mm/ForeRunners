-- Minimal isolated PostgreSQL fixture for the actual trainer-stage RLS migrations.
-- This is not a replacement for the complete production schema.

create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin;
  end if;
end
$$;

create schema if not exists auth;
create schema if not exists private;

create or replace function auth.uid()
returns uuid
language sql
stable
as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;

create table public.profiles (
  id uuid primary key,
  full_name text not null,
  role text not null,
  account_status text not null
);

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'admin'
  );
$$;

grant usage on schema auth, private to authenticated;
grant execute on function auth.uid() to authenticated;
grant execute on function private.is_admin() to authenticated;

alter table public.profiles enable row level security;
grant select on public.profiles to authenticated;
create policy profiles_read_self_or_admin
on public.profiles for select to authenticated
using (id = (select auth.uid()) or (select private.is_admin()));

create table public.livelihood_stages (
  stage_no smallint primary key,
  title_en text not null
);

create table public.learner_stage_progress (
  id uuid primary key,
  learner_id uuid not null references public.profiles(id),
  stage_no smallint not null references public.livelihood_stages(stage_no),
  evidence_summary text,
  reviewer_feedback text
);
alter table public.learner_stage_progress enable row level security;
grant select on public.learner_stage_progress to authenticated;
-- Deliberately no Trainer SELECT policy: progress evidence is private.

create table public.livelihood_activity_submissions (
  id uuid primary key,
  learner_id uuid not null references public.profiles(id),
  stage_progress_id uuid not null references public.learner_stage_progress(id),
  activity_id uuid not null,
  evidence_text text not null,
  status text not null,
  score numeric(5,2),
  criterion_results jsonb not null default '{}'::jsonb,
  reviewer_feedback text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.livelihood_activity_submissions enable row level security;
grant select, update on public.livelihood_activity_submissions to authenticated;
create policy activity_submission_admin_read
on public.livelihood_activity_submissions for select to authenticated
using ((select private.is_admin()));
create policy activity_submission_admin_update
on public.livelihood_activity_submissions for update to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

insert into public.profiles (id, full_name, role, account_status) values
('00000000-0000-0000-0000-000000000001', 'Admin User', 'admin', 'approved'),
('00000000-0000-0000-0000-000000000011', 'Trainer One', 'trainer', 'approved'),
('00000000-0000-0000-0000-000000000012', 'Trainer Two', 'trainer', 'approved'),
('00000000-0000-0000-0000-000000000013', 'Pending Trainer', 'trainer', 'pending'),
('00000000-0000-0000-0000-000000000021', 'Learner One', 'learner', 'approved'),
('00000000-0000-0000-0000-000000000022', 'Learner Two', 'learner', 'approved');

insert into public.livelihood_stages (stage_no, title_en) values
(1, 'Assessment and Profiling'),
(2, 'Personalized Guidance');

insert into public.learner_stage_progress (id, learner_id, stage_no, evidence_summary) values
('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000021', 1, 'private learner evidence one'),
('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000022', 2, 'private learner evidence two');

insert into public.livelihood_activity_submissions
(id, learner_id, stage_progress_id, activity_id, evidence_text, status) values
('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000021', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'Evidence for stage one', 'submitted'),
('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000022', '10000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', 'Evidence for stage two', 'submitted');

create or replace function public.test_assert(ok boolean, message text)
returns void
language plpgsql
as $$
begin
  if not coalesce(ok, false) then
    raise exception 'TEST FAILED: %', message;
  end if;
end;
$$;
grant execute on function public.test_assert(boolean, text) to authenticated;
