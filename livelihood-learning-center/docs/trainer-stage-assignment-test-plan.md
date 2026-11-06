# Trainer Stage Assignment — Pre-release Test Plan

> **Environment:** Use a dedicated Supabase test project only. Do not run these tests against Production.
>
> **Migration order (apply in this exact order in the isolated test project):**
> 1. `20261105180000_create_livelihood_development_journey.sql` — creates stages and learner stage progress.
> 2. `20261105183000_fix_livelihood_stage_rls.sql` — replaces recursive learner stage RLS checks with the private previous-stage helper.
> 3. `20261105190000_add_stage_practical_activities.sql` — creates the activity catalogue referenced by activity submissions.
> 4. `20261105200000_create_activity_evidence_submissions.sql` — creates activity-level learner evidence and review records.
> 5. `20261105210000_assign_trainers_by_journey_stage.sql` — creates stage-scoped Trainer assignments and review policies.
>
> The first migration is already part of the merged journey foundation. The next two are included in PR #23; the fourth is PR #25; the fifth is PR #29 as security-hardened by PR #30. Confirm that all prerequisite PRs are integrated into the test branch before applying this sequence.
>
> PR #30 replaces the former public-schema learner-name SECURITY DEFINER RPC with the `trainer-assigned-learner-names` Edge Function. The migration should not create that RPC.
>
> Do not create a paid Supabase branch or apply migrations unless the project owner explicitly approves the quoted cost and test action.

## 1. Test accounts and synthetic records

Create separate accounts and synthetic data:
- **Admin A** — approved Admin.
- **Trainer A** — approved Trainer assigned to Stages 2 and 3.
- **Trainer B** — approved Trainer assigned to Stage 3 only.
- **Trainer C** — approved but unassigned Trainer.
- **Trainer D** — pending or suspended Trainer; no access should be granted.
- **Learner A** — approved learner with progress and activity evidence in Stages 2 and 3.
- **Learner B** — approved learner with progress and activity evidence in Stage 4.
- **Learner C** — pending or suspended learner; must not appear in the Edge Function response.

Use synthetic names and evidence only. Never copy real learner records into the test project.

## 2. Admin assignment tests

| ID | Action | Expected result |
|---|---|---|
| ADM-01 | Admin assigns Trainer A to Stage 2 | Assignment succeeds and appears in Admin and Trainer A workspaces. |
| ADM-02 | Admin assigns Trainer A to Stage 3 | Assignment succeeds; one Trainer can hold multiple stages. |
| ADM-03 | Admin assigns Trainer B to Stage 3 | Assignment succeeds; multiple Trainers can support one stage. |
| ADM-04 | Admin attempts to assign pending, suspended, rejected, or learner account | Database rejects assignment. |
| ADM-05 | Admin removes Trainer A from Stage 2 | Assignment is removed; access to Stage 2 is denied on the next request. |
| ADM-06 | Non-Admin attempts to insert or delete an assignment | Database rejects the action. |
| ADM-07 | Trainer attempts to assign themself or another Trainer | Database rejects the action. |

## 3. Edge Function authentication and privacy

Invoke `trainer-assigned-learner-names` using the LMS session. Keep the Edge gateway's default JWT verification enabled.

| ID | Account/action | Expected result |
|---|---|---|
| EF-01 | Request without `apikey` header | Rejected. |
| EF-02 | Request with incorrect API key | Rejected with 401. |
| EF-03 | Request without Bearer token | Rejected with 401. |
| EF-04 | Request with invalid or expired user token | Rejected with 401. |
| EF-05 | Approved Learner calls the function | Rejected with 403. |
| EF-06 | Pending or suspended Trainer calls the function | Rejected with 403. |
| EF-07 | Approved Trainer with no assignments calls the function | Returns an empty `learners` array. |
| EF-08 | Trainer A calls the function | Returns only approved learners with progress in Stages 2 and 3. |
| EF-09 | Trainer A is assigned Stage 2 only after Stage 3 removal | Stage 3-only learners disappear from the next response. |
| EF-10 | Inspect response body | Contains only `learner_id` and `full_name`; no phone, email, notes, assessment, or referral data. |
| EF-11 | Inspect browser bundle and network response | Server-only `SUPABASE_SECRET_KEY` is never sent to the browser. |
| EF-12 | Change Trainer A role/status after assignment | Function denies access on the next request. |

The function uses an elevated server-side key to perform its lookup. Its authorization checks are therefore a critical security boundary and must not be removed or weakened.

## 4. Trainer RLS and privacy tests

| ID | Account/action | Expected result |
|---|---|---|
| TR-01 | Trainer A opens Trainer workspace | Sees only assigned Stages 2 and 3. |
| TR-02 | Trainer A loads Learner A evidence | Can view evidence in assigned Stages 2 and 3. |
| TR-03 | Trainer A requests Learner B Stage 4 evidence | No Stage 4 evidence is returned. |
| TR-04 | Trainer C opens Trainer workspace | No learner evidence is returned. |
| TR-05 | Trainer D queries stage progress and submissions | No rows are returned; update is denied. |
| TR-06 | Trainer A queries profiles directly | No general profile access; no phone numbers or private profile fields. |
| TR-07 | Learner A queries another learner's submission | No other learner's submission is returned. |
| TR-08 | Remove Trainer A's Stage 2 assignment, then repeat Stage 2 query | Access is denied on the next request. |
| TR-09 | Change Trainer A role to learner or account status to suspended | Stage progress and activity submission access is denied. |

## 5. Activity assessment tests

| ID | Action | Expected result |
|---|---|---|
| REV-01 | Trainer A marks an assigned submission Reviewing | Status and review metadata save. |
| REV-02 | Trainer A requests Needs Revision without feedback | UI blocks save; database constraint rejects empty feedback. |
| REV-03 | Trainer A requests Needs Revision with feedback | Status, feedback, reviewer and review time save. |
| REV-04 | Trainer A approves an assigned submission with score | Score (0–100), status and review metadata save. |
| REV-05 | Trainer A attempts score below 0 or above 100 | UI/database rejects the value. |
| REV-06 | Trainer A attempts to change learner_id, activity_id, stage_progress_id or evidence_text | Database rejects update because Trainer lacks UPDATE privilege for those columns. |
| REV-07 | Trainer A attempts to review Stage 4 submission | RLS rejects update. |
| REV-08 | Learner A attempts to update reviewer score/status/feedback | RLS/column permissions reject update. |
| REV-09 | Admin reviews an activity submission | Admin review continues to work. |
| REV-10 | Learner resubmits after Needs Revision | New attempt is created; prior attempt remains in history. |
| REV-11 | Trainer A loses approved status, then tries to review | RLS rejects update. |

## 6. Regression checks

- Existing course trainer assignments and course assessment screens still load.
- Existing learner course progress, assignments, file submissions and certificates remain unchanged.
- Admin can review activity submissions.
- Learners can read only their own activity submission history.
- Trainer access does not include initial assessments, career referrals, phone numbers, or unassigned stages.
- Removing a trainer assignment removes access on the next request.
- Verify PostgREST relationship queries used by Admin Activity Review resolve correctly.
- Verify the Edge Function's CORS preflight works from the deployed LMS origin.
- Verify no secrets are committed to Git or exposed in frontend files.

## 7. Read-only schema and security checks

Run only in the test project's SQL Editor after applying migrations:

```sql
-- Confirm required tables exist.
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'livelihood_stages',
    'learner_stage_progress',
    'livelihood_stage_activities',
    'livelihood_activity_submissions',
    'livelihood_stage_trainers'
  )
order by table_name;

-- Confirm the former public SECURITY DEFINER RPC is absent.
select routine_schema, routine_name, security_type
from information_schema.routines
where routine_schema = 'public'
  and routine_name = 'get_assigned_stage_learner_names';

-- Confirm Trainer UPDATE is limited to review fields.
select column_name, privilege_type
from information_schema.column_privileges
where table_schema = 'public'
  and table_name = 'livelihood_activity_submissions'
  and grantee = 'authenticated'
  and privilege_type = 'UPDATE'
order by column_name;

-- Confirm RLS is enabled on the new tables.
select relname, relrowsecurity
from pg_class
where relname in ('livelihood_stage_trainers', 'livelihood_activity_submissions');

-- Inspect policies and confirm approved-Trainer checks are present.
select schemaname, tablename, policyname, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('learner_stage_progress', 'livelihood_activity_submissions', 'livelihood_stage_trainers')
order by tablename, policyname;
```

Expected RPC query result: **zero rows**. Do not treat the absence of a database RPC as a failure; PR #30 uses the Edge Function instead.

## 8. Release gate

Do not merge or apply to Production until:
- All migrations apply successfully in an isolated test project.
- All account, Edge Function, RLS and review test cases pass.
- Admin and Trainer review flows are verified in the browser.
- Supabase Security Advisor and performance checks have been reviewed.
- Edge Function secrets are configured securely and the function is deployed only to the test project.
- Backup and rollback steps are documented.
- The project owner explicitly approves Production rollout.

**Current status:** This is a test plan only. No test project has been created, no migration has been applied to Production, no Edge Function has been deployed, and no PR has been merged.
