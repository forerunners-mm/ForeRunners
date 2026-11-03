-- Add missing indexes on foreign-key columns identified by Supabase performance advisors.
-- These are additive, non-destructive indexes intended to improve joins and parent-row updates/deletes.

create index if not exists idx_announcements_created_by_fk on public.announcements (created_by);
create index if not exists idx_attendance_records_batch_id_fk on public.attendance_records (batch_id);
create index if not exists idx_attendance_records_recorded_by_fk on public.attendance_records (recorded_by);
create index if not exists idx_career_opportunities_created_by_fk on public.career_opportunities (created_by);
create index if not exists idx_career_opportunity_applications_reviewed_by_fk on public.career_opportunity_applications (reviewed_by);
create index if not exists idx_career_readiness_assessments_reviewed_by_fk on public.career_readiness_assessments (reviewed_by);
create index if not exists idx_course_trainers_assigned_by_fk on public.course_trainers (assigned_by);
create index if not exists idx_course_trainers_trainer_id_fk on public.course_trainers (trainer_id);
create index if not exists idx_graduate_followups_reviewed_by_fk on public.graduate_followups (reviewed_by);
create index if not exists idx_learner_evaluations_course_id_fk on public.learner_evaluations (course_id);
create index if not exists idx_learner_evaluations_reviewed_by_fk on public.learner_evaluations (reviewed_by);
create index if not exists idx_learner_evaluations_course_id_trainer_id_fk on public.learner_evaluations (course_id, trainer_id);
create index if not exists idx_lesson_revisions_changed_by_fk on public.lesson_revisions (changed_by);
create index if not exists idx_lessons_created_by_fk on public.lessons (created_by);
create index if not exists idx_lessons_reviewed_by_fk on public.lessons (reviewed_by);
create index if not exists idx_support_messages_sender_id_fk on public.support_messages (sender_id);
