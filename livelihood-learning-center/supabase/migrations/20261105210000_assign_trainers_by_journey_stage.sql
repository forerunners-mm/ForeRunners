-- Stage-scoped trainer assignments and practical activity review permissions.
-- Requires the livelihood journey and activity-submission migrations first.

begin;

create table if not exists public.livelihood_stage_trainers (
  id uuid primary key default gen_random_uuid(),
  stage_no smallint not null references public.livelihood_stages(stage_no) on delete cascade,
  trainer_id uuid not null references public.profiles(id) on delete cascade,
  assigned_by uuid not null references public.profiles(id) on delete restrict,
  assigned_at timestamptz not null default now(),
  unique (trainer_id, stage_no)
);

create index if not exists idx_livelihood_stage_trainers_trainer
  on public.livelihood_stage_trainers(trainer_id, stage_no);

alter table public.livelihood_stage_trainers enable row level security;
revoke all on public.livelihood_stage_trainers from anon, authenticated;
grant select, insert, delete on public.livelihood_stage_trainers to authenticated;

drop policy if exists livelihood_stage_trainers_read_admin_or_assigned on public.livelihood_stage_trainers;
create policy livelihood_stage_trainers_read_admin_or_assigned
on public.livelihood_stage_trainers for select to authenticated
using (trainer_id = (select auth.uid()) or (select private.is_admin()));

drop policy if exists livelihood_stage_trainers_admin_insert on public.livelihood_stage_trainers;
create policy livelihood_stage_trainers_admin_insert
on public.livelihood_stage_trainers for insert to authenticated
with check (
  (select private.is_admin())
  and exists (
    select 1 from public.profiles p
    where p.id = trainer_id and p.role = 'trainer' and p.account_status = 'approved'
  )
  and assigned_by = (select auth.uid())
);

drop policy if exists livelihood_stage_trainers_admin_delete on public.livelihood_stage_trainers;
create policy livelihood_stage_trainers_admin_delete
on public.livelihood_stage_trainers for delete to authenticated
using ((select private.is_admin()));

-- Trainers can see only the stage progress and learner names required for their assigned stages.
drop policy if exists livelihood_stage_progress_trainer_read on public.learner_stage_progress;
create policy livelihood_stage_progress_trainer_read
on public.learner_stage_progress for select to authenticated
using (
  exists (
    select 1 from public.livelihood_stage_trainers st
    where st.stage_no = learner_stage_progress.stage_no
      and st.trainer_id = (select auth.uid())
  )
);

-- Expose only learner names to assigned trainers; do not expand profile access
-- to phone numbers or other profile fields.
drop policy if exists profiles_assigned_stage_trainer_read on public.profiles;

create or replace function public.get_assigned_stage_learner_names()
returns table (learner_id uuid, full_name text)
language sql
stable
security definer
set search_path = ''
as $$
  select distinct p.id, p.full_name
  from public.profiles p
  join public.learner_stage_progress sp on sp.learner_id = p.id
  join public.livelihood_stage_trainers st on st.stage_no = sp.stage_no
  where st.trainer_id = (select auth.uid())
    and (select auth.uid()) is not null
    and exists (
      select 1 from public.profiles caller
      where caller.id = (select auth.uid())
        and caller.role = 'trainer'
        and caller.account_status = 'approved'
    );
$$;

revoke all on function public.get_assigned_stage_learner_names() from public, anon;
grant execute on function public.get_assigned_stage_learner_names() to authenticated;

-- Activity evidence remains private to the learner, Admins and the assigned stage trainer.
drop policy if exists livelihood_activity_submission_read_assigned_trainer
on public.livelihood_activity_submissions;
create policy livelihood_activity_submission_read_assigned_trainer
on public.livelihood_activity_submissions for select to authenticated
using (
  exists (
    select 1 from public.learner_stage_progress sp
    join public.livelihood_stage_trainers st on st.stage_no = sp.stage_no
    where sp.id = livelihood_activity_submissions.stage_progress_id
      and st.trainer_id = (select auth.uid())
  )
);

drop policy if exists livelihood_activity_submission_trainer_update
on public.livelihood_activity_submissions;
create policy livelihood_activity_submission_trainer_update
on public.livelihood_activity_submissions for update to authenticated
using (
  exists (
    select 1 from public.learner_stage_progress sp
    join public.livelihood_stage_trainers st on st.stage_no = sp.stage_no
    where sp.id = livelihood_activity_submissions.stage_progress_id
      and st.trainer_id = (select auth.uid())
  )
)
with check (
  reviewed_by = (select auth.uid())
  and status in ('reviewing','needs_revision','approved')
  and exists (
    select 1 from public.learner_stage_progress sp
    join public.livelihood_stage_trainers st on st.stage_no = sp.stage_no
    where sp.id = livelihood_activity_submissions.stage_progress_id
      and st.trainer_id = (select auth.uid())
  )
);

-- Prevent changing ownership, learner, activity or submission evidence during review.
revoke update on public.livelihood_activity_submissions from authenticated;
grant update (status, score, criterion_results, reviewer_feedback, reviewed_by, reviewed_at, updated_at)
on public.livelihood_activity_submissions to authenticated;

comment on table public.livelihood_stage_trainers is
  'Admin-assigned trainers receive access only to submissions and learner names for their assigned livelihood journey stages.';

commit;
