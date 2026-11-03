create table if not exists public.graduate_followups (
 id uuid primary key default gen_random_uuid(),
 enrollment_id uuid not null references public.enrollments(id) on delete cascade,
 learner_id uuid not null references public.profiles(id) on delete cascade,
 followup_period text not null check (followup_period in ('30_day','90_day','180_day')),
 employment_status text not null check (employment_status in ('employed','self_employed','unemployed_seeking','unemployed_not_seeking','studying','apprenticeship','other')),
 pathway text not null check (pathway in ('employment','self_employment','apprenticeship','further_training','other')),
 job_or_business_title text,
 sector text,
 location_text text,
 monthly_income numeric(14,2) check (monthly_income is null or monthly_income >= 0),
 previous_monthly_income numeric(14,2) check (previous_monthly_income is null or previous_monthly_income >= 0),
 income_currency text not null default 'MMK' check (income_currency in ('MMK','USD','other')),
 skills_used text[] not null default '{}',
 training_relevance integer check (training_relevance between 1 and 5),
 key_outcome text,
 challenges text,
 support_needed text,
 consent_to_contact boolean not null default false,
 consent_to_story boolean not null default false,
 story_text text,
 status text not null default 'submitted' check (status in ('submitted','reviewed','follow_up_needed')),
 admin_notes text,
 submitted_at timestamptz not null default now(),
 reviewed_at timestamptz,
 reviewed_by uuid references public.profiles(id) on delete set null,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 constraint graduate_followups_one_period_per_enrollment unique(enrollment_id,followup_period),
 constraint graduate_followups_story_consent check (consent_to_story or story_text is null)
);
create index if not exists graduate_followups_learner_idx on public.graduate_followups(learner_id,submitted_at desc);
create index if not exists graduate_followups_period_idx on public.graduate_followups(followup_period,status);
alter table public.graduate_followups enable row level security;
drop policy if exists graduate_followups_read_own_or_admin on public.graduate_followups;
create policy graduate_followups_read_own_or_admin on public.graduate_followups for select to authenticated using (learner_id = (select auth.uid()) or (select private.is_admin()));
drop policy if exists graduate_followups_insert_own_completed on public.graduate_followups;
create policy graduate_followups_insert_own_completed on public.graduate_followups for insert to authenticated with check (
 learner_id = (select auth.uid())
 and status = 'submitted'
 and reviewed_at is null and reviewed_by is null and admin_notes is null
 and exists (select 1 from public.profiles p where p.id=(select auth.uid()) and p.role='learner' and p.account_status='approved')
 and exists (select 1 from public.enrollments e where e.id=enrollment_id and e.learner_id=(select auth.uid()) and e.status='completed')
);
drop policy if exists graduate_followups_update_own on public.graduate_followups;
create policy graduate_followups_update_own on public.graduate_followups for update to authenticated
using (learner_id=(select auth.uid()) and status='submitted')
with check (learner_id=(select auth.uid()) and status='submitted' and reviewed_at is null and reviewed_by is null and admin_notes is null);
drop policy if exists graduate_followups_admin_update on public.graduate_followups;
create policy graduate_followups_admin_update on public.graduate_followups for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
revoke all on public.graduate_followups from anon;
grant select,insert,update on public.graduate_followups to authenticated;
comment on table public.graduate_followups is 'Confidential learner-reported livelihood outcomes for 30/90/180 day follow-up. Public story use requires separate explicit consent.';
