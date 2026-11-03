-- Remove only the standalone duplicate unique index. The equivalent UNIQUE
-- constraint (and its backing index) remains in place, so uniqueness is preserved.
-- Supabase Performance Advisor identified this as an exact duplicate.

drop index if exists public.lesson_progress_learner_lesson_uidx;
