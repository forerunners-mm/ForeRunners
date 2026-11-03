# ForeRunners Livelihood & Vocational Learning Center

Bilingual (Myanmar / English) learning platform for the ForeRunners Livelihood & Vocational Learning Program.

## Technology
- Static frontend: HTML, CSS and JavaScript modules
- Hosting target: GitHub Pages
- Authentication, database and private file storage: Supabase
- Supabase project region: Singapore (ap-southeast-1)
- Supabase project reference: `fsypwxvenjqujielhtqb`

## Local / deployment configuration
1. Keep `config.js` limited to the Supabase project URL and browser-safe publishable key.
2. Never put a Supabase `service_role` key, secret key, database password, or private provider token in this folder or any browser JavaScript.
3. The original SQL for the first 19 applied migrations is not available in this repository. To recover the current live state, use the reviewed recovery artifacts under `supabase/recovery/`: `live_schema_snapshot_20261103.sql` (tables, constraints, indexes, functions, RLS, policies, grants, triggers, private Storage bucket and scheduled reminder job) and then `live_seed_data_20261103.sql` (the bilingual course catalogue, lessons and unpublished BASIC quiz). These are recovery snapshots, not a substitute for the historical migration files. Test the scripts in order on a disposable Supabase project before production use.
4. The LMS changes were merged to `main` in PR #9. The repository GitHub Pages deployment workflow completed successfully for the merge commit. The intended LMS subpath is `/ForeRunners/livelihood-learning-center/`.
5. Before inviting learners, verify the published URL in a browser and confirm the Supabase Auth Site URL and Redirect URLs match the deployed address. The successful workflow run alone does not verify browser access or Auth redirects.

## Current learning programme
- Two course levels: BASIC and ADVANCED
- Six modules and one published bilingual introductory lesson in each level/module (12 lessons total)
- Planned cohort capacity: 100 learners, delivered in four batches of 25
- Existing BASIC quiz: 10 bilingual multiple-choice questions, currently unpublished pending content review
- The 12 published lessons are introductory learning units, not a complete facilitator-validated curriculum or workbook. Trainers should expand and validate lesson content, activities and assessment rubrics before a full cohort launch.

## Implemented platform features
- Learner registration, sign-in, profile and Admin approval
- Course catalogue, enrollment applications, course access and lesson progress
- Protected quiz answer keys, server-side scoring and Admin bilingual quiz authoring
- Assignment authoring, learner submissions, file attachments, grading and feedback
- Certificate issuance checks, unique certificate codes, printable certificates and public verification
- Attendance, MEL reports and CSV exports
- Announcements and private learner–Admin support requests/messages
- Bilingual lesson authoring with draft/review/publish/archive states and revision history
- Trainer accounts, course assignment and trainer lesson draft submission
- Trainer competency assessments and learner skills portfolio / career-readiness self-assessment
- Employment, internship, apprenticeship, self-employment, grant and training opportunities with learner applications
- Graduate follow-up surveys at 30, 90 and 180 days
- Course-filterable donor outcome dashboard with small-sample suppression and aggregate-only export
- Automated in-app graduate follow-up reminders: daily Supabase Cron job creates one reminder per due period; learners see and mark their own reminders as read inside their account

## Graduate reminder behavior
- Scheduler: daily at 00:15 UTC (06:45 Myanmar time)
- Reminders are generated only for completed enrollments whose 30/90/180-day follow-up date has arrived and for which no response exists.
- Unique notification keys prevent duplicate reminders.
- Learners can read only their own notifications and update only the read timestamp.
- Reminder delivery is in-app only. No email, SMS, Telegram, or push message is sent.
- The existing follow-up contact consent is not treated as blanket permission for external messaging.

## Security notes
- Public frontend uses only the Supabase publishable key.
- Supabase Row Level Security is enabled on exposed LMS tables.
- Learner-owned records are restricted to their authenticated account.
- Admin operations rely on protected database policies / functions; do not promote users through public signup.
- Quiz answer keys remain in the private schema.
- Assignment files remain in private Storage and are accessed through short-lived signed links.

## Validation status
- GitHub Actions CI checks JavaScript syntax as an ES module, required LMS files, duplicate HTML IDs and key interface elements, and runs Playwright browser smoke tests for unauthenticated access, hidden role workspaces, bilingual language toggle and login/sign-up view switching. Main-branch CI run #124 passed after PR #9 was merged. The browser smoke test does not replace live role-based testing.
- Database schema and reminder function were checked against the connected Supabase project. Anonymous-role SQL probes confirmed that the public course catalogue is readable, while profiles, enrollments, lessons, quiz questions/attempts, assignments, certificates, notifications and career records return zero visible rows; sensitive graduate follow-up and private answer-key tables reject anonymous SELECT at the database privilege layer.
- Removed one verified redundant standalone `lesson_progress` unique index in migration `202611030005_remove_duplicate_lesson_progress_index.sql`; the equivalent UNIQUE constraint remains. Two equivalent certificate-code UNIQUE constraints are retained pending a careful constraint dependency review.
- The scheduled reminder job is active. A manual function invocation completed and created zero rows because the project currently has no completed enrollments due for follow-up.
- Supabase lists 23 applied migration versions. The original first 19 migration SQL files remain unavailable; a live schema recovery snapshot and programme seed-data script have now been added. Fresh-project replay and validation are still outstanding. The 16 missing foreign-key indexes were added in migration `202611030004_add_missing_foreign_key_indexes.sql` and applied to the connected project.
- At the last data check: 0 enrollments, 0 completed enrollments, 0 graduate follow-up responses and 0 career opportunities/applications. No outcome rate should be interpreted as 0% success.
- Role-based end-to-end testing with separate Admin, Trainer and approved Learner accounts remains outstanding; the automated browser smoke test uses a mocked signed-out Supabase session and covers only the unauthenticated entry screen and public UI behavior.
- The lesson PDF/resource upload and video-hosting workflow is not implemented.
- External email/SMS/push delivery is not configured.
- PR #9 is merged into `main`. The GitHub Pages deployment workflow completed successfully (run #21), but the published URL has not yet been independently confirmed in a browser and Supabase Auth redirect/site URL settings remain to be checked.
- The recovery snapshot is a current-state export, not a tested migration chain. It must be replayed and checked on a disposable new Supabase project before claiming fresh-environment reproducibility.

## Supabase recovery files
- `supabase/recovery/live_schema_snapshot_20261103.sql` — current-state DDL, constraints, indexes, functions, RLS, policies, grants, triggers, private bucket metadata and Cron schedule. No learner PII or credentials.
- `supabase/recovery/live_seed_data_20261103.sql` — 2 courses, 12 modules, 12 bilingual introductory lessons, 1 unpublished BASIC quiz, 10 questions and private answer keys. Does not contain learner records.
- Replay on a disposable Supabase project first; ensure platform roles, Auth and Storage are provisioned, and check the pg_cron extension and scheduler. Do not run these recovery scripts over an existing production database.

## Release gate
PR #9 was merged into `main`. Main-branch CI and the GitHub Pages deployment workflow both completed successfully for the merge commit. This is not yet a full production launch approval: complete real Admin, Trainer and approved Learner end-to-end tests, verify the published URL and Supabase Auth redirects, and validate recovery scripts on a disposable Supabase project before onboarding learners.
