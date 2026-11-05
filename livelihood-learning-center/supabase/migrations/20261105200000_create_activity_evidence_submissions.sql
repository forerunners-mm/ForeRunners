-- Activity-level learner evidence and human assessment.
-- Additive migration: does not alter existing course assignments or stage records.

begin;

create table if not exists public.livelihood_activity_submissions (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references public.profiles(id) on delete cascade,
  stage_progress_id uuid not null references public.learner_stage_progress(id) on delete cascade,
  activity_id uuid not null references public.livelihood_stage_activities(id) on delete restrict,
  evidence_text text not null,
  status text not null default 'submitted'
    check (status in ('submitted','reviewing','needs_revision','approved')),
  score numeric(5,2),
  criterion_results jsonb not null default '{}'::jsonb,
  reviewer_feedback text,
  reviewed_by uuid references public.profiles(id) on delete restrict,
  reviewed_at timestamptz,
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint livelihood_activity_submission_text_length
    check (length(trim(evidence_text)) between 20 and 5000),
  constraint livelihood_activity_submission_score
    check (score is null or score between 0 and 100),
  constraint livelihood_activity_submission_criteria_object
    check (jsonb_typeof(criterion_results) = 'object'),
  constraint livelihood_activity_submission_review_metadata
    check (
      (status = 'submitted' and reviewed_by is null and reviewed_at is null)
      or
      (status <> 'submitted' and reviewed_by is not null and reviewed_at is not null)
    ),
  constraint livelihood_activity_submission_feedback_for_revision
    check (status <> 'needs_revision' or (reviewer_feedback is not null and length(trim(reviewer_feedback)) > 0))
);

create index if not exists idx_livelihood_activity_submissions_learner
  on public.livelihood_activity_submissions (learner_id, submitted_at desc);
create index if not exists idx_livelihood_activity_submissions_stage
  on public.livelihood_activity_submissions (stage_progress_id, activity_id, submitted_at desc);
create index if not exists idx_livelihood_activity_submissions_review
  on public.livelihood_activity_submissions (status, submitted_at)
  where status in ('submitted','reviewing');

-- A learner can have only one active or approved record per activity.
-- A needs_revision record permits a new attempt, while preserving history.
create unique index if not exists uq_livelihood_activity_submission_active
  on public.livelihood_activity_submissions (learner_id, activity_id)
  where status in ('submitted','reviewing','approved');

alter table public.livelihood_activity_submissions enable row level security;

revoke all on table public.livelihood_activity_submissions from anon;
grant select, insert, update on table public.livelihood_activity_submissions to authenticated;
grant all on table public.livelihood_activity_submissions to service_role;

drop policy if exists livelihood_activity_submission_read_own_or_admin
  on public.livelihood_activity_submissions;
create policy livelihood_activity_submission_read_own_or_admin
  on public.livelihood_activity_submissions
  for select to authenticated
  using (learner_id = (select auth.uid()) or (select private.is_admin()));

drop policy if exists livelihood_activity_submission_insert_own
  on public.livelihood_activity_submissions;
create policy livelihood_activity_submission_insert_own
  on public.livelihood_activity_submissions
  for insert to authenticated
  with check (
    learner_id = (select auth.uid())
    and status = 'submitted'
    and reviewed_by is null
    and reviewed_at is null
    and score is null
    and reviewer_feedback is null
    and criterion_results = '{}'::jsonb
    and exists (
      select 1
      from public.profiles p
      where p.id = (select auth.uid())
        and p.role = 'learner'
        and p.account_status = 'approved'
    )
    and exists (
      select 1
      from public.learner_stage_progress sp
      join public.livelihood_stage_activities a
        on a.id = activity_id and a.stage_no = sp.stage_no and a.is_active = true
      where sp.id = stage_progress_id
        and sp.learner_id = (select auth.uid())
        and sp.status in ('in_progress','needs_support')
    )
  );

drop policy if exists livelihood_activity_submission_admin_update
  on public.livelihood_activity_submissions;
create policy livelihood_activity_submission_admin_update
  on public.livelihood_activity_submissions
  for update to authenticated
  using ((select private.is_admin()))
  with check (
    (select private.is_admin())
    and status in ('submitted','reviewing','needs_revision','approved')
  );

comment on table public.livelihood_activity_submissions is
  'Private learner evidence submissions and Admin assessment history for individual livelihood practical activities.';

commit;
