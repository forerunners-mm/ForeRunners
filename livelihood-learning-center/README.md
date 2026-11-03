


## Admin dashboard
- Admin-only views planned: overview metrics, learner account review, enrollment review, course/lesson catalogue status, quiz publishing status, and learning/quiz summary reports.
- Access relies on the Supabase admin role and existing RLS policies. Never grant admin role through public signup.
- Quiz authoring (creating/editing questions and private answer keys) is not yet available in the UI. Existing quiz records can be reviewed and published/unpublished when ready.
- Browser end-to-end testing with an actual admin account remains required.
