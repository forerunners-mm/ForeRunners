-- ForeRunners Livelihood & Vocational Learning Center
-- Live schema recovery snapshot exported from Supabase project fsypwxvenjqujielhtqb.
-- Generated: 2026-11-03.
-- IMPORTANT: Review/recovery snapshot only, NOT a verified fresh-project migration.
-- Test on a disposable Supabase project before use. Auth/storage schemas and Supabase-managed
-- roles are platform-provided. Course content seed data is in live_seed_data_20261103.sql.
-- No learner PII, auth users, credentials, or secrets are included.

begin;
create schema if not exists private;

-- Platform extension prerequisite
create extension if not exists pg_cron with schema pg_catalog;

-- 1. Tables (columns and defaults)
create table if not exists private.quiz_answer_keys (
  question_id uuid not null,
  correct_option_index integer not null
);

create table if not exists public.announcements (
  id uuid not null default gen_random_uuid(),
  title_my text not null,
  title_en text not null,
  body_my text not null,
  body_en text not null,
  is_published boolean not null default false,
  published_at timestamp with time zone,
  created_by uuid not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists public.assignment_submissions (
  id uuid not null default gen_random_uuid(),
  assignment_id uuid not null,
  learner_id uuid not null,
  text_response text,
  file_path text,
  status text not null default 'submitted'::text,
  feedback text,
  score numeric(5,2),
  submitted_at timestamp with time zone not null default now(),
  reviewed_at timestamp with time zone,
  reviewed_by uuid
);

create table if not exists public.assignments (
  id uuid not null default gen_random_uuid(),
  course_id uuid not null,
  title_my text not null,
  title_en text not null,
  instructions_my text,
  instructions_en text,
  due_at timestamp with time zone,
  is_published boolean not null default false,
  created_at timestamp with time zone not null default now()
);

create table if not exists public.attendance_records (
  id uuid not null default gen_random_uuid(),
  learner_id uuid not null,
  course_id uuid not null,
  batch_id uuid,
  session_date date not null,
  status text not null,
  notes text,
  recorded_by uuid not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists public.batches (
  id uuid not null default gen_random_uuid(),
  name text not null,
  level text not null,
  capacity integer not null default 25,
  starts_on date,
  ends_on date,
  status text not null default 'planned'::text,
  created_at timestamp with time zone not null default now()
);

create table if not exists public.career_opportunities (
  id uuid not null default gen_random_uuid(),
  title text not null,
  organization_name text,
  opportunity_type text not null,
  pathway text not null,
  description text not null,
  required_skills text[] not null default '{}'::text[],
  preferred_skills text[] not null default '{}'::text[],
  location_text text,
  work_mode text not null default 'onsite'::text,
  compensation_text text,
  application_url text,
  application_deadline date,
  status text not null default 'draft'::text,
  created_by uuid,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  title_my text,
  title_en text,
  description_my text,
  description_en text
);

create table if not exists public.career_opportunity_applications (
  id uuid not null default gen_random_uuid(),
  opportunity_id uuid not null,
  learner_id uuid not null,
  cover_note text,
  status text not null default 'submitted'::text,
  admin_notes text,
  applied_at timestamp with time zone not null default now(),
  reviewed_at timestamp with time zone,
  reviewed_by uuid
);

create table if not exists public.career_readiness_assessments (
  id uuid not null default gen_random_uuid(),
  learner_id uuid not null,
  pathway text not null,
  career_interest text,
  skill_confidence numeric(5,2) not null,
  communication_confidence numeric(5,2) not null,
  digital_readiness numeric(5,2) not null,
  problem_solving numeric(5,2) not null,
  job_search_or_business_planning numeric(5,2) not null,
  overall_score numeric(5,2) default round((((((skill_confidence + communication_confidence) + digital_readiness) + problem_solving) + job_search_or_business_planning) / 5.0), 2),
  support_needs text,
  next_steps text,
  status text not null default 'submitted'::text,
  created_at timestamp with time zone not null default now(),
  reviewed_at timestamp with time zone,
  reviewed_by uuid
);

create table if not exists public.certificates (
  id uuid not null default gen_random_uuid(),
  learner_id uuid not null,
  course_id uuid not null,
  certificate_code text not null,
  issued_at timestamp with time zone not null default now(),
  file_path text
);

create table if not exists public.course_trainers (
  id uuid not null default gen_random_uuid(),
  course_id uuid not null,
  trainer_id uuid not null,
  assigned_by uuid not null,
  assigned_at timestamp with time zone not null default now()
);

create table if not exists public.courses (
  id uuid not null default gen_random_uuid(),
  title_my text not null,
  title_en text not null,
  description_my text,
  description_en text,
  level text not null,
  sort_order integer not null default 0,
  is_published boolean not null default false,
  created_at timestamp with time zone not null default now()
);

create table if not exists public.enrollments (
  id uuid not null default gen_random_uuid(),
  learner_id uuid not null,
  course_id uuid not null,
  batch_id uuid,
  status text not null default 'pending'::text,
  applied_at timestamp with time zone not null default now(),
  reviewed_at timestamp with time zone,
  reviewed_by uuid,
  completed_at timestamp with time zone
);

create table if not exists public.graduate_followups (
  id uuid not null default gen_random_uuid(),
  enrollment_id uuid not null,
  learner_id uuid not null,
  followup_period text not null,
  employment_status text not null,
  pathway text not null,
  job_or_business_title text,
  sector text,
  location_text text,
  monthly_income numeric(14,2),
  previous_monthly_income numeric(14,2),
  income_currency text not null default 'MMK'::text,
  skills_used text[] not null default '{}'::text[],
  training_relevance integer,
  key_outcome text,
  challenges text,
  support_needed text,
  consent_to_contact boolean not null default false,
  consent_to_story boolean not null default false,
  story_text text,
  status text not null default 'submitted'::text,
  admin_notes text,
  submitted_at timestamp with time zone not null default now(),
  reviewed_at timestamp with time zone,
  reviewed_by uuid,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists public.learner_evaluations (
  id uuid not null default gen_random_uuid(),
  course_id uuid not null,
  learner_id uuid not null,
  trainer_id uuid not null,
  assessment_type text not null,
  practical_skills_score numeric(5,2) not null,
  task_completion_score numeric(5,2) not null,
  problem_solving_score numeric(5,2) not null,
  communication_score numeric(5,2) not null,
  participation_score numeric(5,2) not null,
  overall_score numeric(5,2) default round((((((practical_skills_score + task_completion_score) + problem_solving_score) + communication_score) + participation_score) / 5.0), 2),
  strengths text,
  improvement_areas text,
  evidence_notes text,
  recommendation text,
  trainer_feedback text,
  status text not null default 'submitted'::text,
  assessed_at timestamp with time zone not null default now(),
  reviewed_at timestamp with time zone,
  reviewed_by uuid,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists public.learner_notifications (
  id uuid not null default gen_random_uuid(),
  learner_id uuid not null,
  notification_key text not null,
  notification_type text not null default 'graduate_followup_due'::text,
  title_my text not null,
  title_en text not null,
  body_my text not null,
  body_en text not null,
  action_path text not null default '#graduate-followup'::text,
  metadata jsonb not null default '{}'::jsonb,
  read_at timestamp with time zone,
  created_at timestamp with time zone not null default now()
);

create table if not exists public.learner_portfolio_items (
  id uuid not null default gen_random_uuid(),
  learner_id uuid not null,
  title text not null,
  description text,
  item_type text not null default 'project'::text,
  skills text[] not null default '{}'::text[],
  evidence_url text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists public.learner_skill_profiles (
  learner_id uuid not null,
  career_pathway text not null default 'employment'::text,
  career_goal text,
  professional_summary text,
  education_history text,
  work_experience text,
  skills text[] not null default '{}'::text[],
  languages text[] not null default '{}'::text[],
  location_text text,
  portfolio_visibility text not null default 'private'::text,
  updated_at timestamp with time zone not null default now()
);

create table if not exists public.lesson_progress (
  id uuid not null default gen_random_uuid(),
  learner_id uuid not null,
  lesson_id uuid not null,
  status text not null default 'not_started'::text,
  completed_at timestamp with time zone,
  updated_at timestamp with time zone not null default now()
);

create table if not exists public.lesson_revisions (
  id uuid not null default gen_random_uuid(),
  lesson_id uuid not null,
  version_no integer not null,
  title_my text not null,
  title_en text not null,
  content_my text,
  content_en text,
  resource_path text,
  video_url text,
  changed_by uuid not null,
  change_note text,
  created_at timestamp with time zone not null default now()
);

create table if not exists public.lessons (
  id uuid not null default gen_random_uuid(),
  module_id uuid not null,
  title_my text not null,
  title_en text not null,
  content_my text,
  content_en text,
  resource_path text,
  video_url text,
  sort_order integer not null default 0,
  is_published boolean not null default false,
  created_at timestamp with time zone not null default now(),
  content_status text not null default 'draft'::text,
  version_no integer not null default 1,
  updated_at timestamp with time zone not null default now(),
  created_by uuid,
  reviewed_by uuid,
  reviewed_at timestamp with time zone
);

create table if not exists public.modules (
  id uuid not null default gen_random_uuid(),
  course_id uuid not null,
  title_my text not null,
  title_en text not null,
  description_my text,
  description_en text,
  sort_order integer not null default 0,
  created_at timestamp with time zone not null default now()
);

create table if not exists public.profiles (
  id uuid not null,
  full_name text,
  phone text,
  preferred_language text not null default 'my'::text,
  role text not null default 'learner'::text,
  account_status text not null default 'pending'::text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists public.quiz_attempts (
  id uuid not null default gen_random_uuid(),
  quiz_id uuid not null,
  learner_id uuid not null,
  answers jsonb not null default '{}'::jsonb,
  score numeric(5,2),
  passed boolean,
  submitted_at timestamp with time zone not null default now()
);

create table if not exists public.quiz_questions (
  id uuid not null default gen_random_uuid(),
  quiz_id uuid not null,
  question_my text not null,
  question_en text not null,
  options jsonb not null default '[]'::jsonb,
  sort_order integer not null default 0
);

create table if not exists public.quizzes (
  id uuid not null default gen_random_uuid(),
  course_id uuid not null,
  title_my text not null,
  title_en text not null,
  pass_mark numeric(5,2) not null default 60,
  is_published boolean not null default false,
  created_at timestamp with time zone not null default now()
);

create table if not exists public.support_messages (
  id uuid not null default gen_random_uuid(),
  request_id uuid not null,
  sender_id uuid not null,
  body text not null,
  created_at timestamp with time zone not null default now()
);

create table if not exists public.support_requests (
  id uuid not null default gen_random_uuid(),
  learner_id uuid not null,
  subject text not null,
  category text not null default 'general'::text,
  status text not null default 'open'::text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- 2. Constraints
alter table private.quiz_answer_keys add constraint quiz_answer_keys_correct_option_index_check CHECK (correct_option_index >= 0);
alter table private.quiz_answer_keys add constraint quiz_answer_keys_pkey PRIMARY KEY (question_id);
alter table private.quiz_answer_keys add constraint quiz_answer_keys_question_id_fkey FOREIGN KEY (question_id) REFERENCES quiz_questions(id) ON DELETE CASCADE;
alter table public.announcements add constraint announcements_created_by_fkey FOREIGN KEY (created_by) REFERENCES profiles(id);
alter table public.announcements add constraint announcements_pkey PRIMARY KEY (id);
alter table public.assignment_submissions add constraint assignment_submissions_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE;
alter table public.assignment_submissions add constraint assignment_submissions_assignment_id_learner_id_key UNIQUE (assignment_id, learner_id);
alter table public.assignment_submissions add constraint assignment_submissions_learner_id_fkey FOREIGN KEY (learner_id) REFERENCES profiles(id) ON DELETE CASCADE;
alter table public.assignment_submissions add constraint assignment_submissions_pkey PRIMARY KEY (id);
alter table public.assignment_submissions add constraint assignment_submissions_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES profiles(id);
alter table public.assignment_submissions add constraint assignment_submissions_status_check CHECK (status = ANY (ARRAY['submitted'::text, 'reviewing'::text, 'needs_revision'::text, 'approved'::text]));
alter table public.assignments add constraint assignments_course_id_fkey FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;
alter table public.assignments add constraint assignments_pkey PRIMARY KEY (id);
alter table public.attendance_records add constraint attendance_records_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE SET NULL;
alter table public.attendance_records add constraint attendance_records_course_id_fkey FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;
alter table public.attendance_records add constraint attendance_records_learner_id_fkey FOREIGN KEY (learner_id) REFERENCES profiles(id) ON DELETE CASCADE;
alter table public.attendance_records add constraint attendance_records_pkey PRIMARY KEY (id);
alter table public.attendance_records add constraint attendance_records_recorded_by_fkey FOREIGN KEY (recorded_by) REFERENCES profiles(id);
alter table public.attendance_records add constraint attendance_records_status_check CHECK (status = ANY (ARRAY['present'::text, 'absent'::text, 'late'::text, 'excused'::text]));
alter table public.attendance_records add constraint attendance_records_unique_session UNIQUE (learner_id, course_id, session_date);
alter table public.batches add constraint batches_capacity_check CHECK (capacity > 0);
alter table public.batches add constraint batches_level_check CHECK (level = ANY (ARRAY['BASIC'::text, 'ADVANCED'::text]));
alter table public.batches add constraint batches_name_key UNIQUE (name);
alter table public.batches add constraint batches_pkey PRIMARY KEY (id);
alter table public.batches add constraint batches_status_check CHECK (status = ANY (ARRAY['planned'::text, 'open'::text, 'active'::text, 'completed'::text, 'closed'::text]));
alter table public.career_opportunities add constraint career_opportunities_application_url_check CHECK (application_url IS NULL OR application_url ~* '^https?://'::text);
alter table public.career_opportunities add constraint career_opportunities_created_by_fkey FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL;
alter table public.career_opportunities add constraint career_opportunities_description_check CHECK (length(TRIM(BOTH FROM description)) >= 10 AND length(TRIM(BOTH FROM description)) <= 10000);
alter table public.career_opportunities add constraint career_opportunities_opportunity_type_check CHECK (opportunity_type = ANY (ARRAY['job'::text, 'internship'::text, 'apprenticeship'::text, 'self_employment'::text, 'grant'::text, 'training'::text]));
alter table public.career_opportunities add constraint career_opportunities_pathway_check CHECK (pathway = ANY (ARRAY['employment'::text, 'self_employment'::text, 'apprenticeship'::text, 'further_training'::text]));
alter table public.career_opportunities add constraint career_opportunities_pkey PRIMARY KEY (id);
alter table public.career_opportunities add constraint career_opportunities_status_check CHECK (status = ANY (ARRAY['draft'::text, 'published'::text, 'closed'::text, 'archived'::text]));
alter table public.career_opportunities add constraint career_opportunities_title_check CHECK (length(TRIM(BOTH FROM title)) >= 3 AND length(TRIM(BOTH FROM title)) <= 180);
alter table public.career_opportunities add constraint career_opportunities_work_mode_check CHECK (work_mode = ANY (ARRAY['onsite'::text, 'remote'::text, 'hybrid'::text, 'flexible'::text]));
alter table public.career_opportunity_applications add constraint career_opportunity_applications_learner_id_fkey FOREIGN KEY (learner_id) REFERENCES profiles(id) ON DELETE CASCADE;
alter table public.career_opportunity_applications add constraint career_opportunity_applications_opportunity_id_fkey FOREIGN KEY (opportunity_id) REFERENCES career_opportunities(id) ON DELETE CASCADE;
alter table public.career_opportunity_applications add constraint career_opportunity_applications_opportunity_id_learner_id_key UNIQUE (opportunity_id, learner_id);
alter table public.career_opportunity_applications add constraint career_opportunity_applications_pkey PRIMARY KEY (id);
alter table public.career_opportunity_applications add constraint career_opportunity_applications_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES profiles(id) ON DELETE SET NULL;
alter table public.career_opportunity_applications add constraint career_opportunity_applications_status_check CHECK (status = ANY (ARRAY['submitted'::text, 'under_review'::text, 'shortlisted'::text, 'accepted'::text, 'rejected'::text, 'withdrawn'::text]));
alter table public.career_readiness_assessments add constraint career_readiness_assessments_communication_confidence_check CHECK (communication_confidence >= 0::numeric AND communication_confidence <= 100::numeric);
alter table public.career_readiness_assessments add constraint career_readiness_assessments_digital_readiness_check CHECK (digital_readiness >= 0::numeric AND digital_readiness <= 100::numeric);
alter table public.career_readiness_assessments add constraint career_readiness_assessments_job_search_or_business_plann_check CHECK (job_search_or_business_planning >= 0::numeric AND job_search_or_business_planning <= 100::numeric);
alter table public.career_readiness_assessments add constraint career_readiness_assessments_learner_id_fkey FOREIGN KEY (learner_id) REFERENCES profiles(id) ON DELETE CASCADE;
alter table public.career_readiness_assessments add constraint career_readiness_assessments_pathway_check CHECK (pathway = ANY (ARRAY['employment'::text, 'self_employment'::text, 'apprenticeship'::text, 'further_training'::text]));
alter table public.career_readiness_assessments add constraint career_readiness_assessments_pkey PRIMARY KEY (id);
alter table public.career_readiness_assessments add constraint career_readiness_assessments_problem_solving_check CHECK (problem_solving >= 0::numeric AND problem_solving <= 100::numeric);
alter table public.career_readiness_assessments add constraint career_readiness_assessments_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES profiles(id) ON DELETE SET NULL;
alter table public.career_readiness_assessments add constraint career_readiness_assessments_skill_confidence_check CHECK (skill_confidence >= 0::numeric AND skill_confidence <= 100::numeric);
alter table public.career_readiness_assessments add constraint career_readiness_assessments_status_check CHECK (status = ANY (ARRAY['submitted'::text, 'reviewed'::text]));
alter table public.certificates add constraint certificates_certificate_code_key UNIQUE (certificate_code);
alter table public.certificates add constraint certificates_certificate_code_unique UNIQUE (certificate_code);
alter table public.certificates add constraint certificates_course_id_fkey FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;
alter table public.certificates add constraint certificates_learner_id_course_id_key UNIQUE (learner_id, course_id);
alter table public.certificates add constraint certificates_learner_id_fkey FOREIGN KEY (learner_id) REFERENCES profiles(id) ON DELETE CASCADE;
alter table public.certificates add constraint certificates_pkey PRIMARY KEY (id);
alter table public.course_trainers add constraint course_trainers_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES profiles(id);
alter table public.course_trainers add constraint course_trainers_course_id_fkey FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;
alter table public.course_trainers add constraint course_trainers_course_id_trainer_id_key UNIQUE (course_id, trainer_id);
alter table public.course_trainers add constraint course_trainers_pkey PRIMARY KEY (id);
alter table public.course_trainers add constraint course_trainers_trainer_id_fkey FOREIGN KEY (trainer_id) REFERENCES profiles(id) ON DELETE CASCADE;
alter table public.courses add constraint courses_level_check CHECK (level = ANY (ARRAY['BASIC'::text, 'ADVANCED'::text]));
alter table public.courses add constraint courses_pkey PRIMARY KEY (id);
alter table public.enrollments add constraint enrollments_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE SET NULL;
alter table public.enrollments add constraint enrollments_course_id_fkey FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;
alter table public.enrollments add constraint enrollments_learner_id_course_id_key UNIQUE (learner_id, course_id);
alter table public.enrollments add constraint enrollments_learner_id_fkey FOREIGN KEY (learner_id) REFERENCES profiles(id) ON DELETE CASCADE;
alter table public.enrollments add constraint enrollments_pkey PRIMARY KEY (id);
alter table public.enrollments add constraint enrollments_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES profiles(id);
alter table public.enrollments add constraint enrollments_status_check CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text, 'completed'::text, 'withdrawn'::text]));
alter table public.graduate_followups add constraint graduate_followups_employment_status_check CHECK (employment_status = ANY (ARRAY['employed'::text, 'self_employed'::text, 'unemployed_seeking'::text, 'unemployed_not_seeking'::text, 'studying'::text, 'apprenticeship'::text, 'other'::text]));
alter table public.graduate_followups add constraint graduate_followups_enrollment_id_fkey FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE;
alter table public.graduate_followups add constraint graduate_followups_followup_period_check CHECK (followup_period = ANY (ARRAY['30_day'::text, '90_day'::text, '180_day'::text]));
alter table public.graduate_followups add constraint graduate_followups_income_currency_check CHECK (income_currency = ANY (ARRAY['MMK'::text, 'USD'::text, 'other'::text]));
alter table public.graduate_followups add constraint graduate_followups_learner_id_fkey FOREIGN KEY (learner_id) REFERENCES profiles(id) ON DELETE CASCADE;
alter table public.graduate_followups add constraint graduate_followups_monthly_income_check CHECK (monthly_income IS NULL OR monthly_income >= 0::numeric);
alter table public.graduate_followups add constraint graduate_followups_one_period_per_enrollment UNIQUE (enrollment_id, followup_period);
alter table public.graduate_followups add constraint graduate_followups_pathway_check CHECK (pathway = ANY (ARRAY['employment'::text, 'self_employment'::text, 'apprenticeship'::text, 'further_training'::text, 'other'::text]));
alter table public.graduate_followups add constraint graduate_followups_pkey PRIMARY KEY (id);
alter table public.graduate_followups add constraint graduate_followups_previous_monthly_income_check CHECK (previous_monthly_income IS NULL OR previous_monthly_income >= 0::numeric);
alter table public.graduate_followups add constraint graduate_followups_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES profiles(id) ON DELETE SET NULL;
alter table public.graduate_followups add constraint graduate_followups_status_check CHECK (status = ANY (ARRAY['submitted'::text, 'reviewed'::text, 'follow_up_needed'::text]));
alter table public.graduate_followups add constraint graduate_followups_story_consent CHECK (consent_to_story OR story_text IS NULL);
alter table public.graduate_followups add constraint graduate_followups_training_relevance_check CHECK (training_relevance >= 1 AND training_relevance <= 5);
alter table public.learner_evaluations add constraint learner_evaluations_assessment_type_check CHECK (assessment_type = ANY (ARRAY['baseline'::text, 'midterm'::text, 'final'::text, 'practical'::text]));
alter table public.learner_evaluations add constraint learner_evaluations_communication_score_check CHECK (communication_score >= 0::numeric AND communication_score <= 100::numeric);
alter table public.learner_evaluations add constraint learner_evaluations_course_id_fkey FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;
alter table public.learner_evaluations add constraint learner_evaluations_learner_id_fkey FOREIGN KEY (learner_id) REFERENCES profiles(id) ON DELETE CASCADE;
alter table public.learner_evaluations add constraint learner_evaluations_participation_score_check CHECK (participation_score >= 0::numeric AND participation_score <= 100::numeric);
alter table public.learner_evaluations add constraint learner_evaluations_pkey PRIMARY KEY (id);
alter table public.learner_evaluations add constraint learner_evaluations_practical_skills_score_check CHECK (practical_skills_score >= 0::numeric AND practical_skills_score <= 100::numeric);
alter table public.learner_evaluations add constraint learner_evaluations_problem_solving_score_check CHECK (problem_solving_score >= 0::numeric AND problem_solving_score <= 100::numeric);
alter table public.learner_evaluations add constraint learner_evaluations_recommendation_check CHECK (recommendation IS NULL OR (recommendation = ANY (ARRAY['continue_learning'::text, 'ready_for_next_level'::text, 'course_completion_recommended'::text, 'needs_support'::text])));
alter table public.learner_evaluations add constraint learner_evaluations_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES profiles(id) ON DELETE SET NULL;
alter table public.learner_evaluations add constraint learner_evaluations_status_check CHECK (status = ANY (ARRAY['submitted'::text, 'reviewed'::text]));
alter table public.learner_evaluations add constraint learner_evaluations_task_completion_score_check CHECK (task_completion_score >= 0::numeric AND task_completion_score <= 100::numeric);
alter table public.learner_evaluations add constraint learner_evaluations_trainer_course_fk FOREIGN KEY (course_id, trainer_id) REFERENCES course_trainers(course_id, trainer_id) ON DELETE CASCADE;
alter table public.learner_evaluations add constraint learner_evaluations_trainer_id_fkey FOREIGN KEY (trainer_id) REFERENCES profiles(id) ON DELETE RESTRICT;
alter table public.learner_notifications add constraint learner_notifications_learner_id_fkey FOREIGN KEY (learner_id) REFERENCES profiles(id) ON DELETE CASCADE;
alter table public.learner_notifications add constraint learner_notifications_notification_key_key UNIQUE (notification_key);
alter table public.learner_notifications add constraint learner_notifications_pkey PRIMARY KEY (id);
alter table public.learner_portfolio_items add constraint learner_portfolio_items_item_type_check CHECK (item_type = ANY (ARRAY['project'::text, 'practical_work'::text, 'work_sample'::text, 'volunteer_experience'::text, 'certificate'::text, 'other'::text]));
alter table public.learner_portfolio_items add constraint learner_portfolio_items_learner_id_fkey FOREIGN KEY (learner_id) REFERENCES profiles(id) ON DELETE CASCADE;
alter table public.learner_portfolio_items add constraint learner_portfolio_items_pkey PRIMARY KEY (id);
alter table public.learner_portfolio_items add constraint learner_portfolio_items_title_check CHECK (length(TRIM(BOTH FROM title)) >= 2 AND length(TRIM(BOTH FROM title)) <= 180);
alter table public.learner_skill_profiles add constraint learner_skill_profiles_career_pathway_check CHECK (career_pathway = ANY (ARRAY['employment'::text, 'self_employment'::text, 'apprenticeship'::text, 'further_training'::text, 'undecided'::text]));
alter table public.learner_skill_profiles add constraint learner_skill_profiles_learner_id_fkey FOREIGN KEY (learner_id) REFERENCES profiles(id) ON DELETE CASCADE;
alter table public.learner_skill_profiles add constraint learner_skill_profiles_pkey PRIMARY KEY (learner_id);
alter table public.learner_skill_profiles add constraint learner_skill_profiles_portfolio_visibility_check CHECK (portfolio_visibility = ANY (ARRAY['private'::text, 'admin_only'::text]));
alter table public.lesson_progress add constraint lesson_progress_learner_id_fkey FOREIGN KEY (learner_id) REFERENCES profiles(id) ON DELETE CASCADE;
alter table public.lesson_progress add constraint lesson_progress_learner_id_lesson_id_key UNIQUE (learner_id, lesson_id);
alter table public.lesson_progress add constraint lesson_progress_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE;
alter table public.lesson_progress add constraint lesson_progress_pkey PRIMARY KEY (id);
alter table public.lesson_progress add constraint lesson_progress_status_check CHECK (status = ANY (ARRAY['not_started'::text, 'in_progress'::text, 'completed'::text]));
alter table public.lesson_revisions add constraint lesson_revisions_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES profiles(id);
alter table public.lesson_revisions add constraint lesson_revisions_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE;
alter table public.lesson_revisions add constraint lesson_revisions_lesson_id_version_no_key UNIQUE (lesson_id, version_no);
alter table public.lesson_revisions add constraint lesson_revisions_pkey PRIMARY KEY (id);
alter table public.lessons add constraint lessons_content_status_check CHECK (content_status = ANY (ARRAY['draft'::text, 'in_review'::text, 'published'::text, 'archived'::text]));
alter table public.lessons add constraint lessons_created_by_fkey FOREIGN KEY (created_by) REFERENCES profiles(id);
alter table public.lessons add constraint lessons_module_id_fkey FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE;
alter table public.lessons add constraint lessons_pkey PRIMARY KEY (id);
alter table public.lessons add constraint lessons_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES profiles(id);
alter table public.lessons add constraint lessons_version_no_check CHECK (version_no > 0);
alter table public.modules add constraint modules_course_id_fkey FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;
alter table public.modules add constraint modules_pkey PRIMARY KEY (id);
alter table public.profiles add constraint profiles_account_status_check CHECK (account_status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text, 'suspended'::text]));
alter table public.profiles add constraint profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
alter table public.profiles add constraint profiles_pkey PRIMARY KEY (id);
alter table public.profiles add constraint profiles_preferred_language_check CHECK (preferred_language = ANY (ARRAY['my'::text, 'en'::text]));
alter table public.profiles add constraint profiles_role_check CHECK (role = ANY (ARRAY['learner'::text, 'admin'::text, 'trainer'::text]));
alter table public.quiz_attempts add constraint quiz_attempts_learner_id_fkey FOREIGN KEY (learner_id) REFERENCES profiles(id) ON DELETE CASCADE;
alter table public.quiz_attempts add constraint quiz_attempts_pkey PRIMARY KEY (id);
alter table public.quiz_attempts add constraint quiz_attempts_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE;
alter table public.quiz_questions add constraint quiz_questions_pkey PRIMARY KEY (id);
alter table public.quiz_questions add constraint quiz_questions_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE;
alter table public.quizzes add constraint quizzes_course_id_fkey FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;
alter table public.quizzes add constraint quizzes_pass_mark_check CHECK (pass_mark >= 0::numeric AND pass_mark <= 100::numeric);
alter table public.quizzes add constraint quizzes_pkey PRIMARY KEY (id);
alter table public.support_messages add constraint support_messages_body_check CHECK (length(TRIM(BOTH FROM body)) >= 1 AND length(TRIM(BOTH FROM body)) <= 10000);
alter table public.support_messages add constraint support_messages_pkey PRIMARY KEY (id);
alter table public.support_messages add constraint support_messages_request_id_fkey FOREIGN KEY (request_id) REFERENCES support_requests(id) ON DELETE CASCADE;
alter table public.support_messages add constraint support_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES profiles(id);
alter table public.support_requests add constraint support_requests_category_check CHECK (category = ANY (ARRAY['general'::text, 'course'::text, 'technical'::text, 'safeguarding'::text, 'complaint'::text, 'other'::text]));
alter table public.support_requests add constraint support_requests_learner_id_fkey FOREIGN KEY (learner_id) REFERENCES profiles(id) ON DELETE CASCADE;
alter table public.support_requests add constraint support_requests_pkey PRIMARY KEY (id);
alter table public.support_requests add constraint support_requests_status_check CHECK (status = ANY (ARRAY['open'::text, 'in_progress'::text, 'resolved'::text, 'closed'::text]));

-- 3. Non-constraint indexes
CREATE INDEX idx_assignment_submissions_learner ON public.assignment_submissions USING btree (learner_id);
CREATE INDEX idx_assignment_submissions_reviewer ON public.assignment_submissions USING btree (reviewed_by);
CREATE INDEX idx_assignments_course ON public.assignments USING btree (course_id);
CREATE INDEX attendance_records_course_date_idx ON public.attendance_records USING btree (course_id, session_date);
CREATE INDEX attendance_records_learner_idx ON public.attendance_records USING btree (learner_id, course_id);
CREATE INDEX career_opportunities_public_idx ON public.career_opportunities USING btree (status, application_deadline);
CREATE INDEX career_applications_learner_idx ON public.career_opportunity_applications USING btree (learner_id, applied_at DESC);
CREATE INDEX career_applications_opportunity_idx ON public.career_opportunity_applications USING btree (opportunity_id, status);
CREATE INDEX career_readiness_learner_idx ON public.career_readiness_assessments USING btree (learner_id, created_at DESC);
CREATE INDEX idx_certificates_course ON public.certificates USING btree (course_id);
CREATE INDEX idx_enrollments_batch ON public.enrollments USING btree (batch_id);
CREATE INDEX idx_enrollments_course ON public.enrollments USING btree (course_id);
CREATE INDEX idx_enrollments_reviewer ON public.enrollments USING btree (reviewed_by);
CREATE INDEX graduate_followups_learner_idx ON public.graduate_followups USING btree (learner_id, submitted_at DESC);
CREATE INDEX graduate_followups_period_idx ON public.graduate_followups USING btree (followup_period, status);
CREATE INDEX learner_evaluations_learner_course_idx ON public.learner_evaluations USING btree (learner_id, course_id, assessed_at DESC);
CREATE INDEX learner_evaluations_trainer_course_idx ON public.learner_evaluations USING btree (trainer_id, course_id, assessed_at DESC);
CREATE INDEX learner_notifications_learner_created_idx ON public.learner_notifications USING btree (learner_id, created_at DESC);
CREATE INDEX learner_notifications_unread_idx ON public.learner_notifications USING btree (learner_id, created_at DESC) WHERE (read_at IS NULL);
CREATE INDEX learner_portfolio_items_learner_idx ON public.learner_portfolio_items USING btree (learner_id, created_at DESC);
CREATE INDEX idx_lesson_progress_lesson ON public.lesson_progress USING btree (lesson_id);
CREATE UNIQUE INDEX lesson_progress_learner_lesson_uidx ON public.lesson_progress USING btree (learner_id, lesson_id);
CREATE INDEX lesson_revisions_lesson_version_idx ON public.lesson_revisions USING btree (lesson_id, version_no DESC);
CREATE INDEX idx_lessons_module ON public.lessons USING btree (module_id);
CREATE INDEX idx_modules_course ON public.modules USING btree (course_id);
CREATE INDEX idx_quiz_attempts_learner ON public.quiz_attempts USING btree (learner_id);
CREATE INDEX idx_quiz_attempts_quiz ON public.quiz_attempts USING btree (quiz_id);
CREATE INDEX idx_quiz_questions_quiz ON public.quiz_questions USING btree (quiz_id);
CREATE INDEX idx_quizzes_course ON public.quizzes USING btree (course_id);
CREATE INDEX support_messages_request_created_idx ON public.support_messages USING btree (request_id, created_at);
CREATE INDEX support_requests_learner_updated_idx ON public.support_requests USING btree (learner_id, updated_at DESC);

-- 4. Functions
CREATE OR REPLACE FUNCTION private.admin_review_learner_evaluation(p_evaluation_id uuid, p_feedback text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
 if (select auth.uid()) is null or not (select private.is_admin()) then
  raise exception 'Administrator permission required';
 end if;
 update public.learner_evaluations set status='reviewed',trainer_feedback=nullif(trim(p_feedback),''),reviewed_at=now(),reviewed_by=(select auth.uid()),updated_at=now()
 where id=p_evaluation_id;
 if not found then raise exception 'Evaluation not found'; end if;
end;
$function$
;

CREATE OR REPLACE FUNCTION private.admin_set_profile_role(p_user_id uuid, p_role text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
 if not (select private.is_admin()) then raise exception 'Admin access required'; end if;
 if p_role not in ('learner','trainer') then raise exception 'Only learner or trainer role can be assigned here'; end if;
 update public.profiles set role=p_role,updated_at=now() where id=p_user_id;
 if not found then raise exception 'Profile not found'; end if;
end;
$function$
;

CREATE OR REPLACE FUNCTION private.admin_set_profile_status(p_user_id uuid, p_status text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
 if not (select private.is_admin()) then raise exception 'Admin access required'; end if;
 if p_status not in ('pending','approved','rejected','suspended') then raise exception 'Invalid account status'; end if;
 update public.profiles set account_status=p_status,updated_at=now() where id=p_user_id;
 if not found then raise exception 'Profile not found'; end if;
end;
$function$
;

CREATE OR REPLACE FUNCTION private.admin_update_profile(p_user_id uuid, p_role text, p_account_status text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
 if (select auth.uid()) is null or not (select private.is_admin()) then
  raise exception 'Administrator permission required';
 end if;
 if p_user_id=(select auth.uid()) then raise exception 'You cannot change your own role or status here'; end if;
 if p_role not in ('learner','trainer','admin') then raise exception 'Invalid role'; end if;
 if p_account_status not in ('pending','approved','rejected','suspended') then raise exception 'Invalid account status'; end if;
 update public.profiles set role=p_role,account_status=p_account_status,updated_at=now() where id=p_user_id;
 if not found then raise exception 'Profile not found'; end if;
end;
$function$
;

CREATE OR REPLACE FUNCTION private.create_admin_quiz(p_course_id uuid, p_title_my text, p_title_en text, p_pass_mark numeric, p_questions jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_quiz_id uuid;
  v_item jsonb;
  v_question_id uuid;
  v_options jsonb;
  v_correct integer;
  v_sort integer := 0;
begin
  if auth.uid() is null or not private.is_admin() then
    raise exception 'Admin access required' using errcode = '42501';
  end if;
  if p_course_id is null or not exists (select 1 from public.courses c where c.id = p_course_id) then
    raise exception 'A valid course is required';
  end if;
  if nullif(btrim(p_title_my), '') is null or nullif(btrim(p_title_en), '') is null then
    raise exception 'Quiz titles are required in both languages';
  end if;
  if p_pass_mark is null or p_pass_mark < 1 or p_pass_mark > 100 then
    raise exception 'Pass mark must be between 1 and 100';
  end if;
  if jsonb_typeof(p_questions) <> 'array' or jsonb_array_length(p_questions) < 1 or jsonb_array_length(p_questions) > 50 then
    raise exception 'Provide between 1 and 50 questions';
  end if;

  insert into public.quizzes(course_id,title_my,title_en,pass_mark,is_published)
  values (p_course_id,btrim(p_title_my),btrim(p_title_en),p_pass_mark,false)
  returning id into v_quiz_id;

  for v_item in select value from jsonb_array_elements(p_questions)
  loop
    v_sort := v_sort + 1;
    if nullif(btrim(v_item->>'question_my'),'') is null
       or nullif(btrim(v_item->>'question_en'),'') is null then
      raise exception 'Each question needs Myanmar and English text';
    end if;
    v_options := v_item->'options';
    if jsonb_typeof(v_options) <> 'array' or jsonb_array_length(v_options) < 2 or jsonb_array_length(v_options) > 6 then
      raise exception 'Each question must have 2 to 6 options';
    end if;
    if exists (
      select 1 from jsonb_array_elements(v_options) o
      where nullif(btrim(o.value->>'my'),'') is null or nullif(btrim(o.value->>'en'),'') is null
    ) then
      raise exception 'Every option needs Myanmar and English text';
    end if;
    if coalesce(v_item->>'correct_option_index','') !~ '^[0-9]+$' then
      raise exception 'Correct option index must be a non-negative integer';
    end if;
    v_correct := (v_item->>'correct_option_index')::integer;
    if v_correct < 0 or v_correct >= jsonb_array_length(v_options) then
      raise exception 'Correct option index is outside the options list';
    end if;

    insert into public.quiz_questions(quiz_id,question_my,question_en,options,sort_order)
    values(v_quiz_id,btrim(v_item->>'question_my'),btrim(v_item->>'question_en'),v_options,v_sort)
    returning id into v_question_id;

    insert into private.quiz_answer_keys(question_id,correct_option_index)
    values(v_question_id,v_correct);
  end loop;

  return v_quiz_id;
end;
$function$
;

CREATE OR REPLACE FUNCTION private.create_due_graduate_followup_notifications()
 RETURNS bigint
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION private.get_assigned_course_learners(p_course_id uuid)
 RETURNS TABLE(learner_id uuid, full_name text)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
 if (select auth.uid()) is null or not (select private.is_assigned_trainer(p_course_id)) then
  raise exception 'Assigned trainer permission required';
 end if;
 return query
 select p.id,p.full_name
 from public.enrollments e
 join public.profiles p on p.id=e.learner_id
 where e.course_id=p_course_id and e.status in ('approved','completed')
   and p.account_status='approved' and p.role='learner'
 order by p.full_name nulls last;
end;
$function$
;

CREATE OR REPLACE FUNCTION private.guard_profile_privileges()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  if (new.role is distinct from old.role or new.account_status is distinct from old.account_status)
     and not private.is_admin() then
    raise exception 'Only an administrator can change role or account status';
  end if;
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION private.is_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'admin'
      and p.account_status = 'approved'
  );
$function$
;

CREATE OR REPLACE FUNCTION private.is_assigned_trainer(p_course_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
 select exists (
  select 1 from public.profiles p
  join public.course_trainers ct on ct.trainer_id=p.id
  where p.id=(select auth.uid()) and p.role='trainer'
   and p.account_status='approved' and ct.course_id=p_course_id
 );
$function$
;

CREATE OR REPLACE FUNCTION private.is_trainer_for_course(p_course_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
 select exists(
  select 1 from public.course_trainers ct
  join public.profiles p on p.id=ct.trainer_id
  where ct.course_id=p_course_id and ct.trainer_id=(select auth.uid())
    and p.role='trainer' and p.account_status='approved'
 );
$function$
;

CREATE OR REPLACE FUNCTION private.issue_course_certificate(p_learner_id uuid, p_course_id uuid)
 RETURNS TABLE(certificate_id uuid, certificate_code text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
 v_certificate_id uuid;
 v_code text;
 v_total_lessons integer;
 v_completed_lessons integer;
 v_total_quizzes integer;
 v_passed_quizzes integer;
begin
 if auth.uid() is null or not private.is_admin() then
  raise exception 'Admin access required';
 end if;

 if not exists (
  select 1 from public.enrollments e
  where e.learner_id=p_learner_id and e.course_id=p_course_id
    and e.status in ('approved','completed')
 ) then
  raise exception 'Learner must have an approved course enrollment';
 end if;

 select count(*) into v_total_lessons
 from public.lessons l join public.modules m on m.id=l.module_id
 where m.course_id=p_course_id and l.is_published=true;

 if v_total_lessons=0 then
  raise exception 'This course has no published lessons';
 end if;

 select count(*) into v_completed_lessons
 from public.lesson_progress lp
 join public.lessons l on l.id=lp.lesson_id
 join public.modules m on m.id=l.module_id
 where lp.learner_id=p_learner_id and m.course_id=p_course_id
   and l.is_published=true and lp.status='completed';

 if v_completed_lessons < v_total_lessons then
  raise exception 'Learner has not completed all published lessons';
 end if;

 select count(*) into v_total_quizzes
 from public.quizzes q
 where q.course_id=p_course_id and q.is_published=true;

 select count(*) into v_passed_quizzes
 from public.quizzes q
 where q.course_id=p_course_id and q.is_published=true
 and exists (
  select 1 from public.quiz_attempts qa
  where qa.quiz_id=q.id and qa.learner_id=p_learner_id and qa.passed=true
 );

 if v_passed_quizzes < v_total_quizzes then
  raise exception 'Learner has not passed all published quizzes';
 end if;

 if exists(select 1 from public.certificates c where c.learner_id=p_learner_id and c.course_id=p_course_id) then
  raise exception 'A certificate has already been issued for this course';
 end if;

 v_code := 'FR-LVC-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,12));
 insert into public.certificates(learner_id,course_id,certificate_code)
 values(p_learner_id,p_course_id,v_code)
 returning id into v_certificate_id;

 return query select v_certificate_id,v_code;
end;
$function$
;

CREATE OR REPLACE FUNCTION private.submit_quiz_attempt_core(p_quiz_id uuid, p_answers jsonb)
 RETURNS TABLE(attempt_id uuid, score numeric, passed boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_pass_mark numeric;
  v_total integer;
  v_answer_count integer;
  v_correct integer := 0;
  v_question_id uuid;
  v_option_index integer;
  v_correct_index integer;
  v_option_count integer;
  v_attempt_id uuid;
  v_score numeric;
  v_passed boolean;
  r record;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF p_answers IS NULL OR pg_catalog.jsonb_typeof(p_answers) <> 'object' THEN
    RAISE EXCEPTION 'Answers must be a JSON object';
  END IF;

  SELECT q.pass_mark
    INTO v_pass_mark
  FROM public.quizzes AS q
  WHERE q.id = p_quiz_id
    AND q.is_published = true
    AND EXISTS (
      SELECT 1
      FROM public.enrollments AS e
      WHERE e.course_id = q.course_id
        AND e.learner_id = v_uid
        AND e.status IN ('approved', 'completed')
    );

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Quiz unavailable or enrollment not approved';
  END IF;

  SELECT count(*)::integer
    INTO v_total
  FROM public.quiz_questions AS qq
  WHERE qq.quiz_id = p_quiz_id;

  SELECT count(*)::integer
    INTO v_answer_count
  FROM pg_catalog.jsonb_object_keys(p_answers);

  IF v_total = 0 OR v_answer_count <> v_total THEN
    RAISE EXCEPTION 'All quiz questions must be answered';
  END IF;

  FOR r IN
    SELECT key, value
    FROM pg_catalog.jsonb_each(p_answers)
  LOOP
    IF r.key !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
      RAISE EXCEPTION 'Invalid question identifier';
    END IF;

    v_question_id := r.key::uuid;

    IF pg_catalog.jsonb_typeof(r.value) <> 'number'
       OR (r.value #>> '{}') !~ '^[0-9]+$' THEN
      RAISE EXCEPTION 'Answer option must be a non-negative integer';
    END IF;

    v_option_index := (r.value #>> '{}')::integer;

    SELECT ak.correct_option_index,
           pg_catalog.jsonb_array_length(qq.options)
      INTO v_correct_index, v_option_count
    FROM public.quiz_questions AS qq
    JOIN private.quiz_answer_keys AS ak
      ON ak.question_id = qq.id
    WHERE qq.id = v_question_id
      AND qq.quiz_id = p_quiz_id;

    IF NOT FOUND
       OR v_option_index < 0
       OR v_option_index >= v_option_count
       OR v_correct_index >= v_option_count THEN
      RAISE EXCEPTION 'Invalid question or answer option';
    END IF;

    IF v_option_index = v_correct_index THEN
      v_correct := v_correct + 1;
    END IF;
  END LOOP;

  v_score := pg_catalog.round((v_correct::numeric * 100) / v_total, 2);
  v_passed := v_score >= v_pass_mark;

  INSERT INTO public.quiz_attempts (
    quiz_id, learner_id, answers, score, passed
  )
  VALUES (
    p_quiz_id, v_uid, p_answers, v_score, v_passed
  )
  RETURNING id INTO v_attempt_id;

  RETURN QUERY
  SELECT v_attempt_id, v_score, v_passed;
END;
$function$
;

CREATE OR REPLACE FUNCTION private.submit_quiz_attempt_internal(p_quiz_id uuid, p_answers jsonb)
 RETURNS TABLE(attempt_id uuid, score numeric, passed boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_pass_mark numeric;
  v_total integer;
  v_correct integer := 0;
  v_question_id uuid;
  v_option_index integer;
  v_correct_index integer;
  v_option_count integer;
  v_attempt_id uuid;
  v_score numeric;
  v_passed boolean;
  v_answer jsonb;
  v_key text;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF p_answers IS NULL OR jsonb_typeof(p_answers) <> 'object' THEN
    RAISE EXCEPTION 'Answers must be a JSON object';
  END IF;

  SELECT q.pass_mark
    INTO v_pass_mark
  FROM public.quizzes AS q
  WHERE q.id = p_quiz_id
    AND q.is_published = true
    AND EXISTS (
      SELECT 1
      FROM public.enrollments AS e
      WHERE e.course_id = q.course_id
        AND e.learner_id = v_uid
        AND e.status IN ('approved', 'completed')
    );

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Quiz unavailable or enrollment not approved';
  END IF;

  SELECT count(*)::integer
    INTO v_total
  FROM public.quiz_questions AS qq
  WHERE qq.quiz_id = p_quiz_id;

  IF v_total = 0 OR jsonb_object_length(p_answers) <> v_total THEN
    RAISE EXCEPTION 'All quiz questions must be answered';
  END IF;

  FOR v_key, v_answer IN
    SELECT key, value FROM jsonb_each(p_answers)
  LOOP
    IF v_key !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
      RAISE EXCEPTION 'Invalid question identifier';
    END IF;

    v_question_id := v_key::uuid;

    IF jsonb_typeof(v_answer) <> 'number'
       OR (v_answer #>> '{}')::numeric <> trunc((v_answer #>> '{}')::numeric) THEN
      RAISE EXCEPTION 'Answer option must be an integer';
    END IF;

    v_option_index := (v_answer #>> '{}')::integer;

    SELECT ak.correct_option_index, jsonb_array_length(qq.options)
      INTO v_correct_index, v_option_count
    FROM public.quiz_questions AS qq
    JOIN private.quiz_answer_keys AS ak
      ON ak.question_id = qq.id
    WHERE qq.id = v_question_id
      AND qq.quiz_id = p_quiz_id;

    IF NOT FOUND
       OR v_option_index < 0
       OR v_option_index >= v_option_count THEN
      RAISE EXCEPTION 'Invalid question or answer option';
    END IF;

    IF v_option_index = v_correct_index THEN
      v_correct := v_correct + 1;
    END IF;
  END LOOP;

  v_score := round((v_correct::numeric * 100) / v_total, 2);
  v_passed := v_score >= v_pass_mark;

  INSERT INTO public.quiz_attempts (
    quiz_id, learner_id, answers, score, passed
  )
  VALUES (
    p_quiz_id, v_uid, p_answers, v_score, v_passed
  )
  RETURNING id INTO v_attempt_id;

  RETURN QUERY
  SELECT v_attempt_id, v_score, v_passed;
END;
$function$
;

CREATE OR REPLACE FUNCTION private.verify_course_certificate(p_certificate_code text)
 RETURNS TABLE(certificate_code text, learner_name text, course_title_my text, course_title_en text, issued_at timestamp with time zone, valid boolean)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
 select c.certificate_code,p.full_name,co.title_my,co.title_en,c.issued_at,true
 from public.certificates c
 join public.profiles p on p.id=c.learner_id
 join public.courses co on co.id=c.course_id
 where upper(c.certificate_code)=upper(trim(p_certificate_code))
 limit 1;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_review_learner_evaluation(p_evaluation_id uuid, p_feedback text)
 RETURNS void
 LANGUAGE sql
 SET search_path TO ''
AS $function$ select private.admin_review_learner_evaluation(p_evaluation_id,p_feedback); $function$
;

CREATE OR REPLACE FUNCTION public.admin_set_profile_role(p_user_id uuid, p_role text)
 RETURNS void
 LANGUAGE sql
 SET search_path TO ''
AS $function$ select private.admin_set_profile_role(p_user_id,p_role); $function$
;

CREATE OR REPLACE FUNCTION public.admin_set_profile_status(p_user_id uuid, p_status text)
 RETURNS void
 LANGUAGE sql
 SET search_path TO ''
AS $function$ select private.admin_set_profile_status(p_user_id,p_status); $function$
;

CREATE OR REPLACE FUNCTION public.admin_update_profile(p_user_id uuid, p_role text, p_account_status text)
 RETURNS void
 LANGUAGE sql
 SET search_path TO ''
AS $function$ select private.admin_update_profile(p_user_id,p_role,p_account_status); $function$
;

CREATE OR REPLACE FUNCTION public.create_admin_quiz(p_course_id uuid, p_title_my text, p_title_en text, p_pass_mark numeric, p_questions jsonb)
 RETURNS uuid
 LANGUAGE sql
 SET search_path TO ''
AS $function$
  select private.create_admin_quiz(p_course_id,p_title_my,p_title_en,p_pass_mark,p_questions);
$function$
;

CREATE OR REPLACE FUNCTION public.get_assigned_course_learners(p_course_id uuid)
 RETURNS TABLE(learner_id uuid, full_name text)
 LANGUAGE sql
 STABLE
 SET search_path TO ''
AS $function$ select * from private.get_assigned_course_learners(p_course_id); $function$
;

CREATE OR REPLACE FUNCTION public.handle_new_learner()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''))
  on conflict (id) do nothing;
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.issue_course_certificate(p_learner_id uuid, p_course_id uuid)
 RETURNS TABLE(certificate_id uuid, certificate_code text)
 LANGUAGE sql
 SET search_path TO ''
AS $function$
 select * from private.issue_course_certificate(p_learner_id,p_course_id);
$function$
;

CREATE OR REPLACE FUNCTION public.set_enrollment_completed_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
begin
 if new.status='completed' and (tg_op='INSERT' or old.status is distinct from 'completed') then
  new.completed_at=coalesce(new.completed_at,now());
 elsif new.status<>'completed' then
  new.completed_at=null;
 end if;
 return new;
end; $function$
;

CREATE OR REPLACE FUNCTION public.submit_quiz_attempt(p_quiz_id uuid, p_answers jsonb)
 RETURNS TABLE(attempt_id uuid, score numeric, passed boolean)
 LANGUAGE sql
 SET search_path TO ''
AS $function$
  SELECT *
  FROM private.submit_quiz_attempt_core(p_quiz_id, p_answers);
$function$
;

CREATE OR REPLACE FUNCTION public.verify_course_certificate(p_certificate_code text)
 RETURNS TABLE(certificate_code text, learner_name text, course_title_my text, course_title_en text, issued_at timestamp with time zone, valid boolean)
 LANGUAGE sql
 SET search_path TO ''
AS $function$
 select * from private.verify_course_certificate(p_certificate_code);
$function$
;

-- 5. RLS enablement
alter table private.quiz_answer_keys enable row level security;
alter table public.announcements enable row level security;
alter table public.assignment_submissions enable row level security;
alter table public.assignments enable row level security;
alter table public.attendance_records enable row level security;
alter table public.batches enable row level security;
alter table public.career_opportunities enable row level security;
alter table public.career_opportunity_applications enable row level security;
alter table public.career_readiness_assessments enable row level security;
alter table public.certificates enable row level security;
alter table public.course_trainers enable row level security;
alter table public.courses enable row level security;
alter table public.enrollments enable row level security;
alter table public.graduate_followups enable row level security;
alter table public.learner_evaluations enable row level security;
alter table public.learner_notifications enable row level security;
alter table public.learner_portfolio_items enable row level security;
alter table public.learner_skill_profiles enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.lesson_revisions enable row level security;
alter table public.lessons enable row level security;
alter table public.modules enable row level security;
alter table public.profiles enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quizzes enable row level security;
alter table public.support_messages enable row level security;
alter table public.support_requests enable row level security;

-- 6. RLS policies (includes storage.objects policies)
create policy announcements_admin_manage on public.announcements as permissive for all to authenticated using (( SELECT private.is_admin() AS is_admin)) with check (( SELECT private.is_admin() AS is_admin));
create policy announcements_read_published on public.announcements as permissive for select to authenticated using ((is_published OR ( SELECT private.is_admin() AS is_admin)));
create policy submissions_admin_update on public.assignment_submissions as permissive for update to authenticated using (( SELECT private.is_admin() AS is_admin)) with check (( SELECT private.is_admin() AS is_admin));
create policy submissions_insert_self_enrolled on public.assignment_submissions as permissive for insert to authenticated with check (((learner_id = ( SELECT auth.uid() AS uid)) AND (EXISTS ( SELECT 1
   FROM (assignments a
     JOIN enrollments e ON ((e.course_id = a.course_id)))
  WHERE ((a.id = assignment_submissions.assignment_id) AND (e.learner_id = ( SELECT auth.uid() AS uid)) AND (e.status = ANY (ARRAY['approved'::text, 'completed'::text])))))));
create policy submissions_read_self_or_admin on public.assignment_submissions as permissive for select to authenticated using (((learner_id = ( SELECT auth.uid() AS uid)) OR ( SELECT private.is_admin() AS is_admin)));
create policy assignments_admin_delete on public.assignments as permissive for delete to authenticated using (( SELECT private.is_admin() AS is_admin));
create policy assignments_admin_insert on public.assignments as permissive for insert to authenticated with check (( SELECT private.is_admin() AS is_admin));
create policy assignments_admin_update on public.assignments as permissive for update to authenticated using (( SELECT private.is_admin() AS is_admin)) with check (( SELECT private.is_admin() AS is_admin));
create policy assignments_read_enrolled_or_admin on public.assignments as permissive for select to authenticated using ((( SELECT private.is_admin() AS is_admin) OR (EXISTS ( SELECT 1
   FROM enrollments e
  WHERE ((e.course_id = assignments.course_id) AND (e.learner_id = ( SELECT auth.uid() AS uid)) AND (e.status = ANY (ARRAY['approved'::text, 'completed'::text])))))));
create policy attendance_admin_all on public.attendance_records as permissive for all to authenticated using (( SELECT private.is_admin() AS is_admin)) with check (( SELECT private.is_admin() AS is_admin));
create policy attendance_read_self on public.attendance_records as permissive for select to authenticated using ((learner_id = ( SELECT auth.uid() AS uid)));
create policy batches_admin_delete on public.batches as permissive for delete to authenticated using (( SELECT private.is_admin() AS is_admin));
create policy batches_admin_insert on public.batches as permissive for insert to authenticated with check (( SELECT private.is_admin() AS is_admin));
create policy batches_admin_update on public.batches as permissive for update to authenticated using (( SELECT private.is_admin() AS is_admin)) with check (( SELECT private.is_admin() AS is_admin));
create policy batches_read_approved_or_admin on public.batches as permissive for select to authenticated using ((( SELECT private.is_admin() AS is_admin) OR (EXISTS ( SELECT 1
   FROM enrollments e
  WHERE ((e.learner_id = ( SELECT auth.uid() AS uid)) AND (e.batch_id = batches.id) AND (e.status = 'approved'::text))))));
create policy opportunity_admin_delete on public.career_opportunities as permissive for delete to authenticated using (( SELECT private.is_admin() AS is_admin));
create policy opportunity_admin_insert on public.career_opportunities as permissive for insert to authenticated with check ((( SELECT private.is_admin() AS is_admin) AND (created_by = ( SELECT auth.uid() AS uid))));
create policy opportunity_admin_update on public.career_opportunities as permissive for update to authenticated using (( SELECT private.is_admin() AS is_admin)) with check (( SELECT private.is_admin() AS is_admin));
create policy opportunity_read_published_or_admin on public.career_opportunities as permissive for select to authenticated using (((status = 'published'::text) OR ( SELECT private.is_admin() AS is_admin)));
create policy career_application_admin_update on public.career_opportunity_applications as permissive for update to authenticated using (( SELECT private.is_admin() AS is_admin)) with check (( SELECT private.is_admin() AS is_admin));
create policy career_application_insert_own on public.career_opportunity_applications as permissive for insert to authenticated with check (((learner_id = ( SELECT auth.uid() AS uid)) AND (status = 'submitted'::text) AND (EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = ( SELECT auth.uid() AS uid)) AND (p.role = 'learner'::text) AND (p.account_status = 'approved'::text)))) AND (EXISTS ( SELECT 1
   FROM career_opportunities o
  WHERE ((o.id = career_opportunity_applications.opportunity_id) AND (o.status = 'published'::text) AND ((o.application_deadline IS NULL) OR (o.application_deadline >= CURRENT_DATE)))))));
create policy career_application_read_own_or_admin on public.career_opportunity_applications as permissive for select to authenticated using (((learner_id = ( SELECT auth.uid() AS uid)) OR ( SELECT private.is_admin() AS is_admin)));
create policy career_application_update_own_withdraw on public.career_opportunity_applications as permissive for update to authenticated using (((learner_id = ( SELECT auth.uid() AS uid)) AND (status = 'submitted'::text))) with check (((learner_id = ( SELECT auth.uid() AS uid)) AND (status = 'withdrawn'::text)));
create policy career_admin_update on public.career_readiness_assessments as permissive for update to authenticated using (( SELECT private.is_admin() AS is_admin)) with check (( SELECT private.is_admin() AS is_admin));
create policy career_insert_self on public.career_readiness_assessments as permissive for insert to authenticated with check (((learner_id = ( SELECT auth.uid() AS uid)) AND (EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = ( SELECT auth.uid() AS uid)) AND (p.role = 'learner'::text) AND (p.account_status = 'approved'::text))))));
create policy career_read_self_or_admin on public.career_readiness_assessments as permissive for select to authenticated using (((learner_id = ( SELECT auth.uid() AS uid)) OR ( SELECT private.is_admin() AS is_admin)));
create policy certificates_admin_delete on public.certificates as permissive for delete to authenticated using (( SELECT private.is_admin() AS is_admin));
create policy certificates_admin_insert on public.certificates as permissive for insert to authenticated with check (( SELECT private.is_admin() AS is_admin));
create policy certificates_admin_update on public.certificates as permissive for update to authenticated using (( SELECT private.is_admin() AS is_admin)) with check (( SELECT private.is_admin() AS is_admin));
create policy certificates_read_self_or_admin on public.certificates as permissive for select to authenticated using (((learner_id = ( SELECT auth.uid() AS uid)) OR ( SELECT private.is_admin() AS is_admin)));
create policy course_trainers_admin_manage on public.course_trainers as permissive for all to authenticated using (( SELECT private.is_admin() AS is_admin)) with check ((( SELECT private.is_admin() AS is_admin) AND (assigned_by = ( SELECT auth.uid() AS uid)) AND (EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = course_trainers.trainer_id) AND (p.role = 'trainer'::text) AND (p.account_status = 'approved'::text))))));
create policy course_trainers_trainer_read_own on public.course_trainers as permissive for select to authenticated using ((trainer_id = ( SELECT auth.uid() AS uid)));
create policy courses_admin_delete on public.courses as permissive for delete to authenticated using (( SELECT private.is_admin() AS is_admin));
create policy courses_admin_insert on public.courses as permissive for insert to authenticated with check (( SELECT private.is_admin() AS is_admin));
create policy courses_admin_update on public.courses as permissive for update to authenticated using (( SELECT private.is_admin() AS is_admin)) with check (( SELECT private.is_admin() AS is_admin));
create policy courses_catalogue_or_enrolled on public.courses as permissive for select to authenticated using (((is_published = true) OR ( SELECT private.is_admin() AS is_admin) OR (EXISTS ( SELECT 1
   FROM enrollments e
  WHERE ((e.learner_id = ( SELECT auth.uid() AS uid)) AND (e.course_id = courses.id) AND (e.status = ANY (ARRAY['approved'::text, 'completed'::text])))))));
create policy courses_public_catalogue on public.courses as permissive for select to anon using ((is_published = true));
create policy courses_trainer_assigned_read on public.courses as permissive for select to authenticated using (( SELECT private.is_assigned_trainer(courses.id) AS is_assigned_trainer));
create policy enrollments_admin_delete on public.enrollments as permissive for delete to authenticated using (( SELECT private.is_admin() AS is_admin));
create policy enrollments_admin_update on public.enrollments as permissive for update to authenticated using (( SELECT private.is_admin() AS is_admin)) with check (( SELECT private.is_admin() AS is_admin));
create policy enrollments_insert_self_pending on public.enrollments as permissive for insert to authenticated with check (((learner_id = ( SELECT auth.uid() AS uid)) AND (status = 'pending'::text)));
create policy enrollments_read_self_or_admin on public.enrollments as permissive for select to authenticated using (((learner_id = ( SELECT auth.uid() AS uid)) OR ( SELECT private.is_admin() AS is_admin)));
create policy graduate_followups_admin_update on public.graduate_followups as permissive for update to authenticated using (( SELECT private.is_admin() AS is_admin)) with check (( SELECT private.is_admin() AS is_admin));
create policy graduate_followups_insert_own_completed on public.graduate_followups as permissive for insert to authenticated with check (((learner_id = ( SELECT auth.uid() AS uid)) AND (status = 'submitted'::text) AND (reviewed_at IS NULL) AND (reviewed_by IS NULL) AND (admin_notes IS NULL) AND (EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = ( SELECT auth.uid() AS uid)) AND (p.role = 'learner'::text) AND (p.account_status = 'approved'::text)))) AND (EXISTS ( SELECT 1
   FROM enrollments e
  WHERE ((e.id = graduate_followups.enrollment_id) AND (e.learner_id = ( SELECT auth.uid() AS uid)) AND (e.status = 'completed'::text) AND (e.completed_at IS NOT NULL) AND (CURRENT_DATE >= ((e.completed_at)::date +
        CASE graduate_followups.followup_period
            WHEN '30_day'::text THEN 30
            WHEN '90_day'::text THEN 90
            WHEN '180_day'::text THEN 180
            ELSE NULL::integer
        END)))))));
create policy graduate_followups_read_own_or_admin on public.graduate_followups as permissive for select to authenticated using (((learner_id = ( SELECT auth.uid() AS uid)) OR ( SELECT private.is_admin() AS is_admin)));
create policy graduate_followups_update_own on public.graduate_followups as permissive for update to authenticated using (((learner_id = ( SELECT auth.uid() AS uid)) AND (status = 'submitted'::text))) with check (((learner_id = ( SELECT auth.uid() AS uid)) AND (status = 'submitted'::text) AND (reviewed_at IS NULL) AND (reviewed_by IS NULL) AND (admin_notes IS NULL)));
create policy evaluations_admin_update on public.learner_evaluations as permissive for update to authenticated using (( SELECT private.is_admin() AS is_admin)) with check (( SELECT private.is_admin() AS is_admin));
create policy evaluations_read_self_or_assigned_trainer_or_admin on public.learner_evaluations as permissive for select to authenticated using (((learner_id = ( SELECT auth.uid() AS uid)) OR ( SELECT private.is_admin() AS is_admin) OR ((trainer_id = ( SELECT auth.uid() AS uid)) AND ( SELECT private.is_assigned_trainer(learner_evaluations.course_id) AS is_assigned_trainer))));
create policy evaluations_trainer_insert_assigned on public.learner_evaluations as permissive for insert to authenticated with check (((trainer_id = ( SELECT auth.uid() AS uid)) AND (status = 'submitted'::text) AND ( SELECT private.is_assigned_trainer(learner_evaluations.course_id) AS is_assigned_trainer) AND (EXISTS ( SELECT 1
   FROM enrollments e
  WHERE ((e.learner_id = learner_evaluations.learner_id) AND (e.course_id = learner_evaluations.course_id) AND (e.status = ANY (ARRAY['approved'::text, 'completed'::text])))))));
create policy evaluations_trainer_update_own_submitted on public.learner_evaluations as permissive for update to authenticated using (((trainer_id = ( SELECT auth.uid() AS uid)) AND (status = 'submitted'::text) AND ( SELECT private.is_assigned_trainer(learner_evaluations.course_id) AS is_assigned_trainer))) with check (((trainer_id = ( SELECT auth.uid() AS uid)) AND (status = 'submitted'::text) AND ( SELECT private.is_assigned_trainer(learner_evaluations.course_id) AS is_assigned_trainer) AND (EXISTS ( SELECT 1
   FROM enrollments e
  WHERE ((e.learner_id = learner_evaluations.learner_id) AND (e.course_id = learner_evaluations.course_id) AND (e.status = ANY (ARRAY['approved'::text, 'completed'::text])))))));
create policy learner_notifications_mark_own_read on public.learner_notifications as permissive for update to authenticated using ((learner_id = ( SELECT auth.uid() AS uid))) with check ((learner_id = ( SELECT auth.uid() AS uid)));
create policy learner_notifications_read_own_or_admin on public.learner_notifications as permissive for select to authenticated using (((learner_id = ( SELECT auth.uid() AS uid)) OR ( SELECT private.is_admin() AS is_admin)));
create policy portfolio_self_delete on public.learner_portfolio_items as permissive for delete to authenticated using ((learner_id = ( SELECT auth.uid() AS uid)));
create policy portfolio_self_insert on public.learner_portfolio_items as permissive for insert to authenticated with check (((learner_id = ( SELECT auth.uid() AS uid)) AND (EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = ( SELECT auth.uid() AS uid)) AND (p.role = 'learner'::text) AND (p.account_status = 'approved'::text))))));
create policy portfolio_self_or_admin_read on public.learner_portfolio_items as permissive for select to authenticated using (((learner_id = ( SELECT auth.uid() AS uid)) OR ( SELECT private.is_admin() AS is_admin)));
create policy portfolio_self_update on public.learner_portfolio_items as permissive for update to authenticated using ((learner_id = ( SELECT auth.uid() AS uid))) with check ((learner_id = ( SELECT auth.uid() AS uid)));
create policy skill_profile_admin_update on public.learner_skill_profiles as permissive for update to authenticated using (( SELECT private.is_admin() AS is_admin)) with check (( SELECT private.is_admin() AS is_admin));
create policy skill_profile_self_insert on public.learner_skill_profiles as permissive for insert to authenticated with check (((learner_id = ( SELECT auth.uid() AS uid)) AND (EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = ( SELECT auth.uid() AS uid)) AND (p.role = 'learner'::text) AND (p.account_status = 'approved'::text))))));
create policy skill_profile_self_read on public.learner_skill_profiles as permissive for select to authenticated using (((learner_id = ( SELECT auth.uid() AS uid)) OR ( SELECT private.is_admin() AS is_admin)));
create policy skill_profile_self_update on public.learner_skill_profiles as permissive for update to authenticated using ((learner_id = ( SELECT auth.uid() AS uid))) with check ((learner_id = ( SELECT auth.uid() AS uid)));
create policy progress_insert_self_enrolled on public.lesson_progress as permissive for insert to authenticated with check (((learner_id = ( SELECT auth.uid() AS uid)) AND (EXISTS ( SELECT 1
   FROM ((lessons l
     JOIN modules m ON ((m.id = l.module_id)))
     JOIN enrollments e ON ((e.course_id = m.course_id)))
  WHERE ((l.id = lesson_progress.lesson_id) AND (e.learner_id = ( SELECT auth.uid() AS uid)) AND (e.status = ANY (ARRAY['approved'::text, 'completed'::text])))))));
create policy progress_read_self_or_admin on public.lesson_progress as permissive for select to authenticated using (((learner_id = ( SELECT auth.uid() AS uid)) OR ( SELECT private.is_admin() AS is_admin)));
create policy progress_update_self_or_admin on public.lesson_progress as permissive for update to authenticated using (((learner_id = ( SELECT auth.uid() AS uid)) OR ( SELECT private.is_admin() AS is_admin))) with check (((learner_id = ( SELECT auth.uid() AS uid)) OR ( SELECT private.is_admin() AS is_admin)));
create policy lesson_revisions_admin_insert on public.lesson_revisions as permissive for insert to authenticated with check ((( SELECT private.is_admin() AS is_admin) AND (changed_by = ( SELECT auth.uid() AS uid))));
create policy lesson_revisions_admin_read on public.lesson_revisions as permissive for select to authenticated using (( SELECT private.is_admin() AS is_admin));
create policy lesson_revisions_trainer_insert on public.lesson_revisions as permissive for insert to authenticated with check (((changed_by = ( SELECT auth.uid() AS uid)) AND (EXISTS ( SELECT 1
   FROM (lessons l
     JOIN modules m ON ((m.id = l.module_id)))
  WHERE ((l.id = lesson_revisions.lesson_id) AND ( SELECT private.is_assigned_trainer(m.course_id) AS is_assigned_trainer))))));
create policy lesson_revisions_trainer_read on public.lesson_revisions as permissive for select to authenticated using ((EXISTS ( SELECT 1
   FROM (lessons l
     JOIN modules m ON ((m.id = l.module_id)))
  WHERE ((l.id = lesson_revisions.lesson_id) AND ( SELECT private.is_assigned_trainer(m.course_id) AS is_assigned_trainer)))));
create policy lessons_admin_delete on public.lessons as permissive for delete to authenticated using (( SELECT private.is_admin() AS is_admin));
create policy lessons_admin_insert on public.lessons as permissive for insert to authenticated with check (( SELECT private.is_admin() AS is_admin));
create policy lessons_admin_update on public.lessons as permissive for update to authenticated using (( SELECT private.is_admin() AS is_admin)) with check (( SELECT private.is_admin() AS is_admin));
create policy lessons_read_enrolled_or_admin on public.lessons as permissive for select to authenticated using ((( SELECT private.is_admin() AS is_admin) OR (EXISTS ( SELECT 1
   FROM (modules m
     JOIN enrollments e ON ((e.course_id = m.course_id)))
  WHERE ((m.id = lessons.module_id) AND (e.learner_id = ( SELECT auth.uid() AS uid)) AND (e.status = ANY (ARRAY['approved'::text, 'completed'::text])))))));
create policy lessons_trainer_assigned_read on public.lessons as permissive for select to authenticated using ((EXISTS ( SELECT 1
   FROM modules m
  WHERE ((m.id = lessons.module_id) AND ( SELECT private.is_assigned_trainer(m.course_id) AS is_assigned_trainer)))));
create policy lessons_trainer_insert_draft on public.lessons as permissive for insert to authenticated with check (((content_status = 'draft'::text) AND (is_published = false) AND (created_by = ( SELECT auth.uid() AS uid)) AND (EXISTS ( SELECT 1
   FROM modules m
  WHERE ((m.id = lessons.module_id) AND ( SELECT private.is_assigned_trainer(m.course_id) AS is_assigned_trainer))))));
create policy lessons_trainer_update_draft on public.lessons as permissive for update to authenticated using (((content_status = ANY (ARRAY['draft'::text, 'in_review'::text])) AND (is_published = false) AND (EXISTS ( SELECT 1
   FROM modules m
  WHERE ((m.id = lessons.module_id) AND ( SELECT private.is_assigned_trainer(m.course_id) AS is_assigned_trainer)))))) with check (((content_status = ANY (ARRAY['draft'::text, 'in_review'::text])) AND (is_published = false) AND (EXISTS ( SELECT 1
   FROM modules m
  WHERE ((m.id = lessons.module_id) AND ( SELECT private.is_assigned_trainer(m.course_id) AS is_assigned_trainer))))));
create policy modules_admin_delete on public.modules as permissive for delete to authenticated using (( SELECT private.is_admin() AS is_admin));
create policy modules_admin_insert on public.modules as permissive for insert to authenticated with check (( SELECT private.is_admin() AS is_admin));
create policy modules_admin_update on public.modules as permissive for update to authenticated using (( SELECT private.is_admin() AS is_admin)) with check (( SELECT private.is_admin() AS is_admin));
create policy modules_read_enrolled_or_admin on public.modules as permissive for select to authenticated using ((( SELECT private.is_admin() AS is_admin) OR (EXISTS ( SELECT 1
   FROM (enrollments e
     JOIN courses c ON ((c.id = e.course_id)))
  WHERE ((e.learner_id = ( SELECT auth.uid() AS uid)) AND (c.id = modules.course_id) AND (e.status = ANY (ARRAY['approved'::text, 'completed'::text])))))));
create policy modules_trainer_assigned_read on public.modules as permissive for select to authenticated using (( SELECT private.is_assigned_trainer(modules.course_id) AS is_assigned_trainer));
create policy profiles_read_self_or_admin on public.profiles as permissive for select to authenticated using (((id = ( SELECT auth.uid() AS uid)) OR ( SELECT private.is_admin() AS is_admin)));
create policy profiles_update_self_or_admin on public.profiles as permissive for update to authenticated using (((id = ( SELECT auth.uid() AS uid)) OR ( SELECT private.is_admin() AS is_admin))) with check (((id = ( SELECT auth.uid() AS uid)) OR ( SELECT private.is_admin() AS is_admin)));
create policy quiz_attempts_read_self_or_admin on public.quiz_attempts as permissive for select to authenticated using (((learner_id = ( SELECT auth.uid() AS uid)) OR ( SELECT private.is_admin() AS is_admin)));
create policy questions_admin_delete on public.quiz_questions as permissive for delete to authenticated using (( SELECT private.is_admin() AS is_admin));
create policy questions_admin_insert on public.quiz_questions as permissive for insert to authenticated with check (( SELECT private.is_admin() AS is_admin));
create policy questions_admin_update on public.quiz_questions as permissive for update to authenticated using (( SELECT private.is_admin() AS is_admin)) with check (( SELECT private.is_admin() AS is_admin));
create policy questions_read_enrolled_or_admin on public.quiz_questions as permissive for select to authenticated using ((( SELECT private.is_admin() AS is_admin) OR (EXISTS ( SELECT 1
   FROM (quizzes q
     JOIN enrollments e ON ((e.course_id = q.course_id)))
  WHERE ((q.id = quiz_questions.quiz_id) AND (e.learner_id = ( SELECT auth.uid() AS uid)) AND (e.status = ANY (ARRAY['approved'::text, 'completed'::text])))))));
create policy quizzes_admin_delete on public.quizzes as permissive for delete to authenticated using (( SELECT private.is_admin() AS is_admin));
create policy quizzes_admin_insert on public.quizzes as permissive for insert to authenticated with check (( SELECT private.is_admin() AS is_admin));
create policy quizzes_admin_update on public.quizzes as permissive for update to authenticated using (( SELECT private.is_admin() AS is_admin)) with check (( SELECT private.is_admin() AS is_admin));
create policy quizzes_read_enrolled_or_admin on public.quizzes as permissive for select to authenticated using ((( SELECT private.is_admin() AS is_admin) OR (EXISTS ( SELECT 1
   FROM enrollments e
  WHERE ((e.course_id = quizzes.course_id) AND (e.learner_id = ( SELECT auth.uid() AS uid)) AND (e.status = ANY (ARRAY['approved'::text, 'completed'::text])))))));
create policy support_messages_read_participant on public.support_messages as permissive for select to authenticated using ((EXISTS ( SELECT 1
   FROM support_requests r
  WHERE ((r.id = support_messages.request_id) AND ((r.learner_id = ( SELECT auth.uid() AS uid)) OR ( SELECT private.is_admin() AS is_admin))))));
create policy support_messages_send_participant on public.support_messages as permissive for insert to authenticated with check (((sender_id = ( SELECT auth.uid() AS uid)) AND (EXISTS ( SELECT 1
   FROM support_requests r
  WHERE ((r.id = support_messages.request_id) AND ((r.learner_id = ( SELECT auth.uid() AS uid)) OR ( SELECT private.is_admin() AS is_admin)))))));
create policy support_requests_admin_update on public.support_requests as permissive for update to authenticated using (( SELECT private.is_admin() AS is_admin)) with check (( SELECT private.is_admin() AS is_admin));
create policy support_requests_create_own on public.support_requests as permissive for insert to authenticated with check ((learner_id = ( SELECT auth.uid() AS uid)));
create policy support_requests_read_participant on public.support_requests as permissive for select to authenticated using (((learner_id = ( SELECT auth.uid() AS uid)) OR ( SELECT private.is_admin() AS is_admin)));
create policy lvc_private_file_delete_own on storage.objects as permissive for delete to authenticated using (((bucket_id = 'lvc-learning-files'::text) AND (( SELECT private.is_admin() AS is_admin) OR ((storage.foldername(name))[1] = (( SELECT auth.uid() AS uid))::text))));
create policy lvc_private_file_read on storage.objects as permissive for select to authenticated using (((bucket_id = 'lvc-learning-files'::text) AND (( SELECT private.is_admin() AS is_admin) OR ((storage.foldername(name))[1] = (( SELECT auth.uid() AS uid))::text) OR (EXISTS ( SELECT 1
   FROM ((lessons l
     JOIN modules m ON ((m.id = l.module_id)))
     JOIN enrollments e ON ((e.course_id = m.course_id)))
  WHERE ((l.resource_path = objects.name) AND (e.learner_id = ( SELECT auth.uid() AS uid)) AND (e.status = ANY (ARRAY['approved'::text, 'completed'::text]))))))));
create policy lvc_private_file_update_own on storage.objects as permissive for update to authenticated using (((bucket_id = 'lvc-learning-files'::text) AND (( SELECT private.is_admin() AS is_admin) OR ((storage.foldername(name))[1] = (( SELECT auth.uid() AS uid))::text)))) with check (((bucket_id = 'lvc-learning-files'::text) AND (( SELECT private.is_admin() AS is_admin) OR ((storage.foldername(name))[1] = (( SELECT auth.uid() AS uid))::text))));
create policy lvc_private_file_upload_own on storage.objects as permissive for insert to authenticated with check (((bucket_id = 'lvc-learning-files'::text) AND (( SELECT private.is_admin() AS is_admin) OR ((storage.foldername(name))[1] = (( SELECT auth.uid() AS uid))::text))));

-- 7. Storage bucket metadata
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types) values ('lvc-learning-files', 'lvc-learning-files', false, 20971520, null) on conflict (id) do update set name=excluded.name,public=excluded.public,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

-- 8. Non-internal triggers (includes auth.users signup trigger)
CREATE TRIGGER on_auth_user_created_lvc AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_learner();
CREATE TRIGGER trg_set_enrollment_completed_at BEFORE INSERT OR UPDATE OF status ON enrollments FOR EACH ROW EXECUTE FUNCTION set_enrollment_completed_at();
CREATE TRIGGER guard_profile_privileges BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION private.guard_profile_privileges();


-- 9. Schema privileges
grant USAGE on schema private to anon;
grant USAGE on schema private to authenticated;
grant USAGE on schema public to PUBLIC;
grant USAGE on schema public to anon;
grant USAGE on schema public to authenticated;
grant USAGE on schema public to service_role;

-- 10. Table privileges
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.announcements to anon;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.announcements to authenticated;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.announcements to service_role;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.assignment_submissions to anon;
grant DELETE, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.assignment_submissions to authenticated;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.assignment_submissions to service_role;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.assignments to anon;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.assignments to authenticated;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.assignments to service_role;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.attendance_records to anon;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.attendance_records to authenticated;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.attendance_records to service_role;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.batches to anon;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.batches to authenticated;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.batches to service_role;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.career_opportunities to anon;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.career_opportunities to authenticated;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.career_opportunities to service_role;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.career_opportunity_applications to anon;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.career_opportunity_applications to authenticated;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.career_opportunity_applications to service_role;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.career_readiness_assessments to anon;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.career_readiness_assessments to authenticated;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.career_readiness_assessments to service_role;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.certificates to anon;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.certificates to authenticated;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.certificates to service_role;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.course_trainers to anon;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.course_trainers to authenticated;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.course_trainers to service_role;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.courses to anon;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.courses to authenticated;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.courses to service_role;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.enrollments to anon;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.enrollments to authenticated;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.enrollments to service_role;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.graduate_followups to authenticated;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.graduate_followups to service_role;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.learner_evaluations to anon;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.learner_evaluations to authenticated;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.learner_evaluations to service_role;
grant SELECT, UPDATE on table public.learner_notifications to anon;
grant SELECT, UPDATE on table public.learner_notifications to authenticated;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.learner_notifications to service_role;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.learner_portfolio_items to anon;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.learner_portfolio_items to authenticated;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.learner_portfolio_items to service_role;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.learner_skill_profiles to anon;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.learner_skill_profiles to authenticated;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.learner_skill_profiles to service_role;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.lesson_progress to anon;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.lesson_progress to authenticated;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.lesson_progress to service_role;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.lesson_revisions to anon;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.lesson_revisions to authenticated;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.lesson_revisions to service_role;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.lessons to anon;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.lessons to authenticated;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.lessons to service_role;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.modules to anon;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.modules to authenticated;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.modules to service_role;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE on table public.profiles to anon;
grant REFERENCES, SELECT, TRIGGER, TRUNCATE on table public.profiles to authenticated;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.profiles to service_role;
grant REFERENCES, SELECT, TRIGGER, TRUNCATE on table public.quiz_attempts to anon;
grant REFERENCES, SELECT, TRIGGER, TRUNCATE on table public.quiz_attempts to authenticated;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.quiz_attempts to service_role;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.quiz_questions to anon;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.quiz_questions to authenticated;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.quiz_questions to service_role;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.quizzes to anon;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.quizzes to authenticated;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.quizzes to service_role;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.support_messages to anon;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.support_messages to authenticated;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.support_messages to service_role;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.support_requests to anon;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.support_requests to authenticated;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.support_requests to service_role;

-- 11. Function privileges
grant EXECUTE on function admin_review_learner_evaluation(uuid,text) to authenticated;
grant EXECUTE on function admin_review_learner_evaluation(uuid,text) to service_role;
grant EXECUTE on function admin_set_profile_role(uuid,text) to authenticated;
grant EXECUTE on function admin_set_profile_role(uuid,text) to service_role;
grant EXECUTE on function admin_set_profile_status(uuid,text) to authenticated;
grant EXECUTE on function admin_set_profile_status(uuid,text) to service_role;
grant EXECUTE on function admin_update_profile(uuid,text,text) to authenticated;
grant EXECUTE on function admin_update_profile(uuid,text,text) to service_role;
grant EXECUTE on function create_admin_quiz(uuid,text,text,numeric,jsonb) to authenticated;
grant EXECUTE on function create_admin_quiz(uuid,text,text,numeric,jsonb) to service_role;
grant EXECUTE on function get_assigned_course_learners(uuid) to authenticated;
grant EXECUTE on function get_assigned_course_learners(uuid) to service_role;
grant EXECUTE on function handle_new_learner() to service_role;
grant EXECUTE on function issue_course_certificate(uuid,uuid) to authenticated;
grant EXECUTE on function issue_course_certificate(uuid,uuid) to service_role;
grant EXECUTE on function private.admin_review_learner_evaluation(uuid,text) to authenticated;
grant EXECUTE on function private.admin_set_profile_role(uuid,text) to authenticated;
grant EXECUTE on function private.admin_set_profile_status(uuid,text) to authenticated;
grant EXECUTE on function private.admin_update_profile(uuid,text,text) to authenticated;
grant EXECUTE on function private.create_admin_quiz(uuid,text,text,numeric,jsonb) to authenticated;
grant EXECUTE on function private.get_assigned_course_learners(uuid) to authenticated;
grant EXECUTE on function private.is_admin() to authenticated;
grant EXECUTE on function private.is_assigned_trainer(uuid) to authenticated;
grant EXECUTE on function private.is_trainer_for_course(uuid) to authenticated;
grant EXECUTE on function private.issue_course_certificate(uuid,uuid) to authenticated;
grant EXECUTE on function private.submit_quiz_attempt_core(uuid,jsonb) to authenticated;
grant EXECUTE on function private.submit_quiz_attempt_internal(uuid,jsonb) to authenticated;
grant EXECUTE on function private.verify_course_certificate(text) to anon;
grant EXECUTE on function private.verify_course_certificate(text) to authenticated;
grant EXECUTE on function set_enrollment_completed_at() to PUBLIC;
grant EXECUTE on function set_enrollment_completed_at() to anon;
grant EXECUTE on function set_enrollment_completed_at() to authenticated;
grant EXECUTE on function set_enrollment_completed_at() to service_role;
grant EXECUTE on function submit_quiz_attempt(uuid,jsonb) to authenticated;
grant EXECUTE on function submit_quiz_attempt(uuid,jsonb) to service_role;
grant EXECUTE on function verify_course_certificate(text) to anon;
grant EXECUTE on function verify_course_certificate(text) to authenticated;
grant EXECUTE on function verify_course_certificate(text) to service_role;

-- 12. Scheduled jobs
select cron.schedule('lvc-graduate-followup-reminders','15 0 * * *',
 'select private.create_due_graduate_followup_notifications();');

commit;
