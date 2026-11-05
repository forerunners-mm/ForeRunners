-- Fix recursive RLS checks for the seven-stage learner journey.
-- The SECURITY DEFINER helper reads only the previous-stage verification fact.
create or replace function private.has_verified_previous_livelihood_stage(p_learner_id uuid, p_stage_no smallint)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.learner_stage_progress previous_stage
    where previous_stage.learner_id = p_learner_id
      and previous_stage.stage_no = p_stage_no - 1
      and previous_stage.status = 'verified'
  );
$$;

revoke all on function private.has_verified_previous_livelihood_stage(uuid,smallint) from public, anon;
grant execute on function private.has_verified_previous_livelihood_stage(uuid,smallint) to authenticated;

drop policy if exists "Learners can start their own eligible stage" on public.learner_stage_progress;
create policy "Learners can start their own eligible stage"
on public.learner_stage_progress for insert
to authenticated
with check (
  learner_id = (select auth.uid())
  and status = 'in_progress'
  and reviewed_by is null and reviewed_at is null and reviewer_feedback is null
  and exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'learner' and p.account_status = 'approved'
  )
  and (stage_no = 1 or private.has_verified_previous_livelihood_stage((select auth.uid()), stage_no))
);

drop policy if exists "Learners can update their own stage evidence" on public.learner_stage_progress;
create policy "Learners can update their own stage evidence"
on public.learner_stage_progress for update
to authenticated
using (
  learner_id = (select auth.uid())
  and status in ('in_progress','needs_support')
)
with check (
  learner_id = (select auth.uid())
  and status in ('in_progress','submitted')
  and reviewed_by is null and reviewed_at is null and reviewer_feedback is null
  and exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'learner' and p.account_status = 'approved'
  )
  and (stage_no = 1 or private.has_verified_previous_livelihood_stage((select auth.uid()), stage_no))
  and (status <> 'submitted' or (evidence_summary is not null and length(trim(evidence_summary)) >= 20))
);
