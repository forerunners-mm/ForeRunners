-- Career guidance referrals
-- Learners explicitly request and consent to each referral.
-- Learners can see only their own referral and learner-facing scheduling updates.
-- Only admins can review and update referrals.

begin;

create table if not exists public.career_guidance_referrals (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references public.profiles(id) on delete cascade,
  referral_type text not null,
  learner_message text,
  consent_given boolean not null default false,
  consent_text_version text not null,
  status text not null default 'requested',
  provider_name text,
  provider_contact text,
  meeting_mode text,
  meeting_at timestamptz,
  meeting_location text,
  learner_visible_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint career_guidance_referrals_type_check
    check (referral_type in ('career_counselor','business_mentor','vocational_guidance','digital_skills','other')),
  constraint career_guidance_referrals_status_check
    check (status in ('requested','under_review','accepted','scheduled','completed','cancelled','declined')),
  constraint career_guidance_referrals_consent_check
    check (consent_given = true and length(trim(consent_text_version)) between 1 and 40),
  constraint career_guidance_referrals_message_size
    check (learner_message is null or octet_length(learner_message) <= 8000),
  constraint career_guidance_referrals_scheduled_check
    check (status <> 'scheduled' or (provider_name is not null and meeting_mode is not null and meeting_at is not null)),
  constraint career_guidance_referrals_mode_check
    check (meeting_mode is null or meeting_mode in ('online','in_person','phone'))
);

create index if not exists idx_career_guidance_referrals_learner_created
  on public.career_guidance_referrals (learner_id, created_at desc);
create index if not exists idx_career_guidance_referrals_status_created
  on public.career_guidance_referrals (status, created_at desc);

alter table public.career_guidance_referrals enable row level security;
revoke all on table public.career_guidance_referrals from anon;
grant select, insert, update on table public.career_guidance_referrals to authenticated;
grant all on table public.career_guidance_referrals to service_role;

create policy career_guidance_referrals_learner_insert_own
  on public.career_guidance_referrals
  for insert to authenticated
  with check (
    learner_id = (select auth.uid())
    and status = 'requested'
    and consent_given = true
    and provider_name is null
    and provider_contact is null
    and meeting_mode is null
    and meeting_at is null
    and meeting_location is null
    and learner_visible_summary is null
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid())
        and p.role = 'learner'
        and p.account_status = 'approved'
    )
  );

create policy career_guidance_referrals_read_own_or_admin
  on public.career_guidance_referrals
  for select to authenticated
  using (learner_id = (select auth.uid()) or (select private.is_admin()));

create policy career_guidance_referrals_admin_update
  on public.career_guidance_referrals
  for update to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

commit;
