# ForeRunners Learning Center — standalone MVP
Six free Myanmar/English beginner lessons, practice questions, email registration, login, assignment text submission, progress, and approved-certificate status.

## Run locally
Serve this folder over HTTP (for example `python -m http.server 8000`) and visit `http://localhost:8000`. Free lessons and practice quiz work without a backend.

## Activate learner accounts and assignments
1. Create a dedicated Supabase project.
2. Run `schema.sql` in Supabase SQL Editor.
3. Configure email confirmation and allowed redirect URLs in Supabase Auth.
4. Replace the two placeholders in `app.js` with the project URL and **publishable/anon** key. NEVER paste service-role keys into browser code or public GitHub.
5. Host this directory on a static site provider under HTTPS.

## Limitations / production checklist
- Current three questions per course are illustrative practice only, not a secure final exam. Build a reviewed course-specific exam bank, trusted server-side grading, staff reviewer workflow and certificate PDF signing/issuance before offering completion certificates.
- Learner assignment submission is text-only; PDF file upload requires private storage policies and upload interface.
- The learner sees approved certificate status only; no auto-issuance or PDF download.
- Provide a privacy notice, consent, data retention/deletion process, accessibility review and security testing before inviting learners.
- Existing website files are untouched; this directory is independent.
- Public printable handouts are in the separate learning-center ZIP package, not hosted here.
