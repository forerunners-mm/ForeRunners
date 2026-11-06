-- Harden stage assignment visibility for Trainers.
-- Approved Trainers can read only their own assignments; Admins retain full visibility.
-- This does not change assignment creation or deletion permissions.

begin;

drop policy if exists livelihood_stage_trainers_read_admin_or_assigned
  on public.livelihood_stage_trainers;

create policy livelihood_stage_trainers_read_admin_or_assigned
on public.livelihood_stage_trainers
for select
to authenticated
using (
  (select private.is_admin())
  or (
    trainer_id = (select auth.uid())
    and exists (
      select 1
      from public.profiles caller
      where caller.id = (select auth.uid())
        and caller.role = 'trainer'
        and caller.account_status = 'approved'
    )
  )
);

commit;
