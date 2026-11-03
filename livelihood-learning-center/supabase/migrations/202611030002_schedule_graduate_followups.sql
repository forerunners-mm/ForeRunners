alter table public.enrollments add column if not exists completed_at timestamptz;
update public.enrollments set completed_at=coalesce(completed_at,applied_at,now()) where status='completed' and completed_at is null;
create or replace function public.set_enrollment_completed_at()
returns trigger language plpgsql security invoker set search_path=public as $$
begin
 if new.status='completed' and (tg_op='INSERT' or old.status is distinct from 'completed') then
  new.completed_at=coalesce(new.completed_at,now());
 elsif new.status<>'completed' then
  new.completed_at=null;
 end if;
 return new;
end; $$;
drop trigger if exists trg_set_enrollment_completed_at on public.enrollments;
create trigger trg_set_enrollment_completed_at before insert or update of status on public.enrollments for each row execute function public.set_enrollment_completed_at();
drop policy if exists graduate_followups_insert_own_completed on public.graduate_followups;
create policy graduate_followups_insert_own_completed on public.graduate_followups for insert to authenticated with check (
 learner_id=(select auth.uid()) and status='submitted' and reviewed_at is null and reviewed_by is null and admin_notes is null
 and exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role='learner' and p.account_status='approved')
 and exists(select 1 from public.enrollments e where e.id=enrollment_id and e.learner_id=(select auth.uid()) and e.status='completed'
  and e.completed_at is not null
  and current_date >= (e.completed_at::date + case followup_period when '30_day' then 30 when '90_day' then 90 when '180_day' then 180 end))
);