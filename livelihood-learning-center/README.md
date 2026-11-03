


## Admin dashboard
- Admin-only views implemented in the frontend: overview metrics, learner account review/search, enrollment review, course and lesson catalogue status, quiz publishing status, and learning/quiz summary reports.
- Access relies on the Supabase admin role and existing RLS policies. Never grant admin role through public signup.
- Quiz authoring (creating/editing questions and private answer keys) is not yet available in the UI. Existing quiz records can be reviewed and published/unpublished when ready.
- Browser end-to-end testing with an actual admin account remains required.


## Assignment management (implemented; requires authenticated browser testing)
- Admins can create bilingual assignments for BASIC or ADVANCED courses with bilingual instructions and optional due dates. New assignments are saved as unpublished drafts.
- Admins can publish/unpublish assignments and review learner text submissions.
- Reviewers can set a score from 0–100, choose submitted/reviewing/needs-revision/approved status, and leave feedback.
- Approved learners can view published assignments, submit one text response per assignment, and view their review status, score, and feedback.
- Submission and review permissions are enforced by Supabase Row Level Security. File attachments are not included in this iteration.
- Browser end-to-end tests with real admin and approved learner accounts are still required. No production deployment or PR merge has been performed.
