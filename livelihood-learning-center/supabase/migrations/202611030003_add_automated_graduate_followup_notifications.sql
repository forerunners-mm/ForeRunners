-- Graduate follow-up in-app reminders.
-- Runs daily at 00:15 UTC (06:45 Myanmar time).
-- No email/SMS is sent; reminders are visible only inside the learner's authenticated account.

create extension if not exists pg_cron with schema pg_catalog;
grant usage on schema cron to postgres;
grant all privileges on all tables in schema cron to postgres;

create table if not exists public.learner_notifications (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references public.profiles(id) on delete cascade,
  notification_key text not null unique,
  notification_type text not null default 'graduate_followup_due',
  title_my text not null,
  title_en text not null,
  body_my text not null,
  body_en text not null,
  action_path text not null default '#graduate-followup',
  metadata jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists learner_notifications_learner_created_idx
  on public.learner_notifications (learner_id, created_at desc);
create index if not exists learner_notifications_unread_idx
  on public.learner_notifications (learner_id, created_at desc)
  where read_at is null;

alter table public.learner_notifications enable row level security;

drop policy if exists learner_notifications_read_own_or_admin on public.learner_notifications;
create policy learner_notifications_read_own_or_admin
  on public.learner_notifications
  for select to authenticated
  using (learner_id = (select auth.uid()) or (select private.is_admin()));

drop policy if exists learner_notifications_mark_own_read on public.learner_notifications;
create policy learner_notifications_mark_own_read
  on public.learner_notifications
  for update to authenticated
  using (learner_id = (select auth.uid()))
  with check (learner_id = (select auth.uid()));

grant select on public.learner_notifications to authenticated;
grant update (read_at) on public.learner_notifications to authenticated;
revoke insert, delete, truncate, references, trigger on public.learner_notifications from anon, authenticated;

create or replace function private.create_due_graduate_followup_notifications()
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  inserted_count bigint;
begin
  insert into public.learner_notifications (
    learner_id, notification_key, notification_type,
    title_my, title_en, body_my, body_en, action_path, metadata
  )
  select
    e.learner_id,
    e.id::text || ':' || due.period,
    'graduate_followup_due',
    case due.period
      when '30_day' then 'သင်တန်းဆင်းပြီး ၃၀ ရက် စစ်တမ်းဖြည့်ရန်'
      when '90_day' then 'သင်တန်းဆင်းပြီး ၉၀ ရက် စစ်တမ်းဖြည့်ရန်'
      else 'သင်တန်းဆင်းပြီး ၁၈၀ ရက် စစ်တမ်းဖြည့်ရန်'
    end,
    case due.period
      when '30_day' then 'Your 30-day graduate follow-up is due'
      when '90_day' then 'Your 90-day graduate follow-up is due'
      else 'Your 180-day graduate follow-up is due'
    end,
    case due.period
      when '30_day' then 'သင်တန်းပြီးဆုံးပြီး ၃၀ ရက် ပြည့်ပါပြီ။ လက်ရှိအလုပ်အကိုင်နှင့် သင်တန်းမှရရှိသော အကျိုးကျေးဇူးများကို မျှဝေပေးပါ။'
      when '90_day' then 'သင်တန်းပြီးဆုံးပြီး ၉၀ ရက် ပြည့်ပါပြီ။ သင့်အသက်မွေးဝမ်းကျောင်း တိုးတက်မှုအခြေအနေကို စစ်တမ်းတွင် ဖြည့်သွင်းပေးပါ။'
      else 'သင်တန်းပြီးဆုံးပြီး ၁၈၀ ရက် ပြည့်ပါပြီ။ ရေရှည်အသက်မွေးဝမ်းကျောင်းရလဒ်များကို စစ်တမ်းတွင် မျှဝေပေးပါ။'
    end,
    case due.period
      when '30_day' then 'It has been 30 days since course completion. Please share your current work situation and how the training has helped you.'
      when '90_day' then 'It has been 90 days since course completion. Please update your livelihood progress in the follow-up survey.'
      else 'It has been 180 days since course completion. Please share your longer-term livelihood outcomes in the follow-up survey.'
    end,
    '#graduate-followup',
    jsonb_build_object('enrollment_id', e.id, 'followup_period', due.period, 'due_date', (e.completed_at::date + due.days))
  from public.enrollments e
  join public.profiles p on p.id = e.learner_id
  cross join (values ('30_day'::text, 30), ('90_day'::text, 90), ('180_day'::text, 180)) as due(period, days)
  where e.status = 'completed'
    and e.completed_at is not null
    and p.role = 'learner'
    and p.account_status = 'approved'
    and current_date >= (e.completed_at::date + due.days)
    and not exists (
      select 1 from public.graduate_followups gf
      where gf.enrollment_id = e.id and gf.followup_period = due.period
    )
  on conflict (notification_key) do nothing;

  get diagnostics inserted_count = row_count;
  return inserted_count;
end;
$$;

revoke all on function private.create_due_graduate_followup_notifications() from public, anon, authenticated;

select cron.schedule(
  'lvc-graduate-followup-reminders',
  '15 0 * * *',
  'select private.create_due_graduate_followup_notifications();'
);
