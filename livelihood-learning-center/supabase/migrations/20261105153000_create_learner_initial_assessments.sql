-- Learner Initial Assessment
-- Stores one submitted assessment per submission; resubmissions create new records.
-- Learners can submit and read only their own records. Only admins can review/update.
-- Sensitive health, trauma, disability, and income details must not be requested
-- as required fields in the frontend assessment.

begin;

create table if not exists public.learner_initial_assessments (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references public.profiles(id) on delete cascade,
  responses jsonb not null,
  consent_given boolean not null default false,
  consent_text_version text not null,
  status text not null default 'submitted',
  reviewer_summary text,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint learner_initial_assessments_responses_object
    check (jsonb_typeof(responses) = 'object'),
  constraint learner_initial_assessments_response_size
    check (octet_length(responses::text) <= 20000),
  constraint learner_initial_assessments_consent_required
    check (consent_given = true),
  constraint learner_initial_assessments_consent_version
    check (length(trim(consent_text_version)) between 1 and 40),
  constraint learner_initial_assessments_status_check
    check (status in ('submitted', 'reviewing', 'reviewed', 'needs_follow_up')),
  constraint learner_initial_assessments_review_metadata
    check (
      (status = 'submitted' and reviewed_by is null and reviewed_at is null)
      or
      (status <> 'submitted' and reviewed_by is not null and reviewed_at is not null)
    )
);

create index if not exists idx_learner_initial_assessments_learner_submitted
  on public.learner_initial_assessments (learner_id, submitted_at desc);

create index if not exists idx_learner_initial_assessments_status
  on public.learner_initial_assessments (status, submitted_at desc);

alter table public.learner_initial_assessments enable row level security;

revoke all on table public.learner_initial_assessments from anon;
grant select, insert, update on table public.learner_initial_assessments to authenticated;
grant all on table public.learner_initial_assessments to service_role;

create policy learner_initial_assessment_insert_own
  on public.learner_initial_assessments
  for insert
  to authenticated
  with check (
    learner_id = (select auth.uid())
    and status = 'submitted'
    and consent_given = true
    and reviewed_by is null
    and reviewed_at is null
    and exists (
      select 1
      from public.profiles p
      where p.id = (select auth.uid())
        and p.role = 'learner'
        and p.account_status = 'approved'
    )
  );

create policy learner_initial_assessment_read_own_or_admin
  on public.learner_initial_assessments
  for select
  to authenticated
  using (
    learner_id = (select auth.uid())
    or (select private.is_admin())
  );

create policy learner_initial_assessment_admin_update
  on public.learner_initial_assessments
  for update
  to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

commit;
