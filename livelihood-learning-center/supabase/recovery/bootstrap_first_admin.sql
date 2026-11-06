-- Bootstrap the first Admin for Livelihood Learning Center.
--
-- Why this exists:
-- Public signup always creates profiles with role='learner' and account_status='pending'.
-- The Admin dashboard only renders when role='admin' AND account_status='approved'.
-- In-app role controls only allow learner|trainer.
-- BEFORE UPDATE trigger private.guard_profile_privileges() requires private.is_admin(),
-- so the first Admin cannot be promoted through the client or a normal UPDATE.
-- Run this in the Supabase SQL Editor (postgres role) once.
--
-- How to run:
-- 1. Open Supabase project fsypwxvenjqujielhtqb → SQL Editor.
-- 2. Replace YOUR_EMAIL_HERE below with the Auth user email to promote.
-- 3. Run the whole script.
-- 4. Sign out and sign back in on the Learning Center site.
--
-- Safety:
-- - Prefer a dedicated Admin account; keep a separate learner account for learner UI tests.
-- - Do not commit real emails into this file.
-- - Re-running is idempotent for an already-admin user.

-- 1) Inspect current profiles
select p.id, u.email, p.full_name, p.role, p.account_status, p.created_at
from public.profiles p
left join auth.users u on u.id = p.id
order by p.created_at desc;

-- 2) Promote (or insert) the target Auth user as an approved Admin
do $$
declare
  target_email text := 'YOUR_EMAIL_HERE';
  target_id uuid;
  target_name text;
begin
  if target_email is null or target_email = '' or target_email = 'YOUR_EMAIL_HERE' then
    raise exception 'Replace YOUR_EMAIL_HERE with the Auth user email before running.';
  end if;

  select id, coalesce(nullif(raw_user_meta_data->>'full_name', ''), split_part(email, '@', 1))
    into target_id, target_name
  from auth.users
  where lower(email) = lower(target_email);

  if target_id is null then
    raise exception 'No auth.users row found for email %', target_email;
  end if;

  -- First Admin bootstrap: temporarily allow role/status changes without an Admin session.
  alter table public.profiles disable trigger guard_profile_privileges;

  begin
    insert into public.profiles (id, full_name, role, account_status)
    values (target_id, target_name, 'admin', 'approved')
    on conflict (id) do update
      set role = 'admin',
          account_status = 'approved',
          updated_at = now();
  exception
    when others then
      alter table public.profiles enable trigger guard_profile_privileges;
      raise;
  end;

  alter table public.profiles enable trigger guard_profile_privileges;
  raise notice 'Promoted % (%) to admin / approved', target_email, target_id;
end $$;

-- 3) Verify Admin rows
select p.id, u.email, p.full_name, p.role, p.account_status
from public.profiles p
join auth.users u on u.id = p.id
where p.role = 'admin'
order by p.updated_at desc;
