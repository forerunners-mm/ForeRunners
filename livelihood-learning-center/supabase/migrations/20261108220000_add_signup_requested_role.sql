-- Store the signup role request separately from the approved application role.
-- New accounts remain pending and keep the least-privileged learner role until Admin approval.

alter table public.profiles
  add column if not exists requested_role text not null default 'learner';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_requested_role_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_requested_role_check
      check (requested_role in ('learner', 'trainer'));
  end if;
end
$$;

create or replace function public.handle_new_learner()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
declare
  requested_role_value text;
begin
  requested_role_value :=
    case
      when new.raw_user_meta_data->>'requested_role' = 'trainer' then 'trainer'
      else 'learner'
    end;

  insert into public.profiles (id, full_name, requested_role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    requested_role_value
  )
  on conflict (id) do nothing;

  return new;
end;
$function$;
