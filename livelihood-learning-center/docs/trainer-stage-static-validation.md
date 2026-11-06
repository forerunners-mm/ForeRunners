# Trainer Stage Assignment — Static Validation Checklist

**Purpose:** Safe source-code checks before creating a Supabase test environment. These checks do not connect to Supabase, apply migrations, deploy Edge Functions, or modify Production.

## 1. Confirm the correct branch

In the repository folder, run:

```powershell
git branch --show-current
git status --short
```

Expected branch: `security/trainer-learner-name-edge-function`.

Do not run deployment or migration commands as part of this checklist.

## 2. Check patch formatting

```powershell
git diff --check
```

Expected: no output. If Git reports whitespace errors, fix them before proceeding.

## 3. Check the Trainer migration's SQL function definition

Open:

`livelihood-learning-center/supabase/migrations/20261105210000_assign_trainers_by_journey_stage.sql`

Confirm the helper definition uses this exact structure:

```sql
create or replace function private.trainer_can_access_livelihood_stage_progress(p_stage_progress_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  -- schema-qualified tables and auth.uid() authorization checks
$$;
```

Confirm all of the following:
- The opening and closing dollar quotes are both `$$`.
- `set search_path = ''` is present.
- All table references are schema-qualified.
- The function checks `auth.uid()`, approved Trainer role/status, and the Trainer's stage assignment.
- `grant usage on schema private to authenticated` is present.
- Function execution is revoked from `public` and `anon`, and granted to `authenticated`.
- The helper returns only a boolean and is not placed in the exposed `public` schema.

This helper is SECURITY DEFINER and therefore must be treated as a privileged security boundary. Do not remove its identity and assignment checks.

## 4. Confirm there is no direct Trainer SELECT access to stage progress

Search the Trainer migration for:

`livelihood_stage_progress_trainer_read`

Expected: only a `DROP POLICY IF EXISTS` statement; no `CREATE POLICY` statement for Trainer SELECT on `learner_stage_progress`.

Confirm the activity-submission SELECT and UPDATE policies call:

`private.trainer_can_access_livelihood_stage_progress(livelihood_activity_submissions.stage_progress_id)`

Confirm the Trainer UPDATE policy only permits review fields and requires:
- `reviewed_by = auth.uid()`
- an allowed review status
- an approved Trainer account
- an active stage assignment

## 5. Confirm the Edge Function response contract

Open:

`livelihood-learning-center/supabase/functions/trainer-assigned-learner-names/index.ts`

Expected response shape:

- `learners`: array of `learner_id` and `full_name`.
- `stage_progress`: array of `stage_progress_id`, `learner_id`, `stage_no`, and `full_name`.

Confirm both arrays are returned for:
- Trainer with no assigned stages.
- Trainer whose assigned stages have no approved learners.
- Trainer with assigned stages and approved learners.

Confirm no evidence text, reviewer feedback, phone number, email, assessment, referral, or secret key is returned.

## 6. Confirm Frontend does not join the private progress table

In `livelihood-learning-center/app.js`, inspect `loadTrainerStageReviews()`.

Expected:
- Activity submissions are queried without `learner_stage_progress(stage_no)`.
- The Edge Function supplies learner names and stage metadata.
- Frontend filtering is restricted to the Trainer's assigned stages.
- The UI does not assume a non-empty response.

## 7. Check secrets and deployment configuration

- Browser code contains only the publishable key.
- `SUPABASE_SECRET_KEY` exists only in Supabase Edge Function secrets, never in Git or frontend files.
- Edge gateway JWT verification remains enabled.
- CORS allows only the deployed LMS origin.
- Responses retain `Cache-Control: no-store`.

## 8. Supabase CLI version awareness

If using Supabase CLI, first check:

```powershell
supabase --version
supabase --help
```

Supabase announced a CLI v3 breaking change in November 2026: database commands default to the local stack, and hosted changes require explicit remote targeting/confirmation. Do not copy old deployment commands without checking the installed CLI help. This checklist does not require running any CLI migration or deployment command.

## 9. Test gate

Static checks are not a substitute for database tests. Before release, use a dedicated test project and synthetic accounts to verify:
- Approved assigned Trainer can see assigned activity submissions only.
- Unassigned, pending, suspended, or role-changed Trainer cannot read or update submissions.
- Trainer cannot directly read learner stage-progress rows or private evidence summaries.
- Learners retain access to their own submissions and progress.
- Admin retains existing review access.
- Private helper grants and RLS policies behave as expected.
- Supabase Security Advisor has been reviewed after the test migration.

**Current boundary:** No test project or paid branch is created by this document. Do not apply migrations to Production, deploy the Edge Function, or merge PRs without explicit owner approval.
