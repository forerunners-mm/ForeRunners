-- Learner Initial Assessment
-- Stores a learner-owned intake record separately from the CV profile and readiness self-rating.
-- Counselor/mentor access is intentionally NOT granted until case assignment and role controls exist.

create table if not exists public.learner_initial_assessments (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'draft',
  form_version text not null default '1.0',
  answers jsonb not null default '{}'::jsonb,
  contact_consent boolean not null default false,
  contact_requested_at timestamptz,
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint learner_initial_assessments_status_check
    check (status in ('draft', 'submitted')),
  constraint learner_initial_assessments_answers_object_check
    check (jsonb_typeof(answers) = 'object'),
  constraint learner_initial_assessments_answers_size_check
    check (octet_length(answers::text) <= 32768),
  constraint learner_initial_assessments_form_version_check
    check (char_length(form_version) between 1 and 30),
  constraint learner_initial_assessments_submission_state_check
    check (
      (status = 'draft' and submitted_at is null and contact_requested_at is null)
      or
      (status = 'submitted' and submitted_at is not null)
    ),
  constraint learner_initial_assessments_contact_consent_check
    check (contact_requested_at is null or (status = 'submitted' and contact_consent))
);

create index if not exists learner_initial_assessments_learner_created_idx
  on public.learner_initial_assessments (learner_id, created_at desc);

create index if not exists learner_initial_assessments_submitted_idx
  on public.learner_initial_assessments (submitted_at desc)
  where status = 'submitted';

comment on table public.learner_initial_assessments is
  'Private learner intake assessment. Counselor access is not enabled until explicit case assignment and role controls are implemented.';
comment on column public.learner_initial_assessments.answers is
  'Versioned JSON object containing assessment answers. Do not store unnecessary sensitive information.';
comment on column public.learner_initial_assessments.contact_consent is
  'Separate optional consent for a ForeRunners counselor/mentor to contact the learner.';

create or replace function private.guard_learner_initial_assessment()
returns trigger
language plpgsql
set search_path = ''
as $function$
begin
  if tg_op = 'INSERT' then
    if new.status <> 'draft'
       or new.submitted_at is not null
       or new.contact_requested_at is not null then
      raise exception 'New assessments must begin as drafts';
    end if;
    new.updated_at := pg_catalog.now();
    return new;
  end if;

  -- A submitted assessment is immutable. A learner can create a new assessment later.
  if old.status <> 'draft' then
    raise exception 'Submitted assessments cannot be edited';
  end if;

  if new.learner_id is distinct from old.learner_id then
    raise exception 'Assessment ownership cannot be changed';
  end if;

  if new.status not in ('draft', 'submitted') then
    raise exception 'Invalid assessment status';
  end if;

  if new.status = 'submitted' then
    if new.answers = '{}'::jsonb then
      raise exception 'Please complete the assessment before submitting';
    end if;
    new.submitted_at := pg_catalog.now();
    if new.contact_consent then
      new.contact_requested_at := pg_catalog.now();
    else
      new.contact_requested_at := null;
    end if;
  else
    new.submitted_at := null;
    new.contact_requested_at := null;
  end if;

  new.updated_at := pg_catalog.now();
  return new;
end;
$function$;

revoke all on function private.guard_learner_initial_assessment() from public, anon, authenticated;

create trigger guard_learner_initial_assessment_write
before insert or update on public.learner_initial_assessments
for each row execute function private.guard_learner_initial_assessment();

alter table public.learner_initial_assessments enable row level security;

revoke all on table public.learner_initial_assessments from public, anon;
grant select, insert, update, delete on table public.learner_initial_assessments to authenticated;

create policy learner_initial_assessment_read_own_or_admin
on public.learner_initial_assessments
for select
to authenticated
using (
  learner_id = (select auth.uid())
  or (select private.is_admin())
);

create policy learner_initial_assessment_insert_own_draft
on public.learner_initial_assessments
for insert
to authenticated
with check (
  learner_id = (select auth.uid())
  and status = 'draft'
  and submitted_at is null
  and contact_requested_at is null
  and exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'learner'
      and p.account_status = 'approved'
  )
);

create policy learner_initial_assessment_update_own_draft
on public.learner_initial_assessments
for update
to authenticated
using (
  learner_id = (select auth.uid())
  and status = 'draft'
  and exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'learner'
      and p.account_status = 'approved'
  )
)
with check (
  learner_id = (select auth.uid())
  and status in ('draft', 'submitted')
  and exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'learner'
      and p.account_status = 'approved'
  )
);

create policy learner_initial_assessment_delete_own_draft
on public.learner_initial_assessments
for delete
to authenticated
using (
  learner_id = (select auth.uid())
  and status = 'draft'
  and exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'learner'
      and p.account_status = 'approved'
  )
);
