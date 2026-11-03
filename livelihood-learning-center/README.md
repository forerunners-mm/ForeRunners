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
3. **Important migration limitation:** the connected Supabase project reports 22 applied migrations, but this repository currently contains only the three graduate follow-up / notification SQL files. The original SQL for the earlier 19 migrations is not present in this repository. Do not use these three files alone to provision a fresh Supabase project. A complete schema-and-policy baseline export is still required before fresh-environment reproducibility can be claimed.
4. Enable GitHub Pages for the repository after the pull request is reviewed and merged. The intended subpath is `/ForeRunners/livelihood-learning-center/`.
5. Confirm the published URL and Supabase Auth redirect/site URL settings before inviting learners.

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
- GitHub Actions CI checks JavaScript syntax, required LMS files, duplicate HTML IDs and key interface elements.
- Database schema and reminder function were checked against the connected Supabase project.
- The scheduled reminder job is active. A manual function invocation completed and created zero rows because the project currently has no completed enrollments due for follow-up.
- **Migration reproducibility is not complete:** Supabase lists 22 applied migration versions, while the repository contains only 3 migration files. The connected project is operational, but a fresh Supabase project cannot yet be rebuilt from this repository alone.
- At the last data check: 0 enrollments, 0 completed enrollments, 0 graduate follow-up responses and 0 career opportunities/applications. No outcome rate should be interpreted as 0% success.
- Real browser end-to-end testing with separate Admin, Trainer and approved Learner accounts has not yet been completed.
- The lesson PDF/resource upload and video-hosting workflow is not implemented.
- External email/SMS/push delivery is not configured.
- Production merge, GitHub Pages deployment and domain verification have not been performed.
- A complete export of the 19 earlier database migrations (or an equivalent reviewed schema baseline) is still required before calling the repository fully reproducible.

## Release gate
PR #9 remains a draft and must be reviewed before merge. Do not merge or announce the platform as live until the release owner approves the PR, completes role-based browser tests, confirms GitHub Pages and Supabase Auth settings, and verifies the published URL.
