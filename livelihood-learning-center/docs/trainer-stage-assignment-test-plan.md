# Trainer Stage Assignment — Test Plan

> **Environment:** Use a separate Supabase test project only. Do not run these tests against production.
>
> **Migration order:**
> 1. `20261105180000_create_livelihood_development_journey.sql`
> 2. `20261105200000_create_activity_evidence_submissions.sql`
> 3. `20261105210000_assign_trainers_by_journey_stage.sql`
>
> Apply the migrations only after confirming the test project has a restorable backup and the project API exposes the required public tables/RPC.

## 1. Test accounts and sample records

Create separate test accounts:
- **Admin A** — approved Admin.
- **Trainer A** — approved Trainer assigned to Stages 2 and 3.
- **Trainer B** — approved Trainer assigned to Stage 3 only.
- **Trainer C** — approved but unassigned Trainer.
- **Learner A** — approved learner with progress and activity evidence in Stages 2 and 3.
- **Learner B** — approved learner with progress and activity evidence in Stage 4.

Use synthetic names and evidence only. Do not copy real learner data into the test project.

## 2. Admin assignment tests

| ID | Action | Expected result |
|---|---|---|
| ADM-01 | Admin assigns Trainer A to Stage 2 | Assignment succeeds and appears in Admin and Trainer A workspaces. |
| ADM-02 | Admin assigns Trainer A to Stage 3 | Assignment succeeds; one trainer can hold multiple stages. |
| ADM-03 | Admin assigns Trainer B to Stage 3 | Assignment succeeds; multiple trainers can support one stage. |
| ADM-04 | Admin attempts to assign a pending, rejected, or learner account | Database rejects the assignment. |
| ADM-05 | Admin removes Trainer A from Stage 2 | Assignment disappears; Trainer A loses Stage 2 access after refresh. |
| ADM-06 | Non-Admin attempts to insert or delete an assignment | Database rejects the action. |

## 3. Trainer privacy and access tests

| ID | Account/action | Expected result |
|---|---|---|
| TR-01 | Trainer A opens the Trainer workspace | Sees only assigned Stages 2 and 3. |
| TR-02 | Trainer A loads Learner A's assigned-stage evidence | Can view evidence for Stages 2 and 3. |
| TR-03 | Trainer A tries to load Learner B's Stage 4 evidence | No Stage 4 evidence is returned. |
| TR-04 | Trainer C opens the Trainer workspace | No stage assignments and no learner evidence are shown. |
| TR-05 | Trainer A calls `get_assigned_stage_learner_names()` | Receives only learner IDs and names associated with assigned stages. |
| TR-06 | Trainer A attempts to read all learner profiles | Must not gain general profile access or see phone numbers/private profile fields. |
| TR-07 | Anonymous user calls the name RPC | Execution is denied. |
| TR-08 | Signed-in learner calls the name RPC | Returns no unrelated learner names; confirm this is acceptable or restrict RPC execution to Trainer/Admin roles in a follow-up hardening change. |

## 4. Activity review tests

| ID | Action | Expected result |
|---|---|---|
| REV-01 | Trainer A marks an assigned submission as Reviewing | Status and review metadata save successfully. |
| REV-02 | Trainer A requests Needs Revision without feedback | UI blocks the save; database constraint also rejects empty feedback. |
| REV-03 | Trainer A requests Needs Revision with feedback | Status, feedback, reviewer and review time save. |
| REV-04 | Trainer A approves an assigned submission with a score | Score (0–100), status and review metadata save. |
| REV-05 | Trainer A attempts score below 0 or above 100 | UI/database rejects the value. |
| REV-06 | Trainer A attempts to change learner_id, activity_id, stage_progress_id or evidence_text | Database rejects the update because those columns are not granted for Trainer updates. |
| REV-07 | Trainer A attempts to review a Stage 4 submission | RLS rejects the update. |
| REV-08 | Learner A attempts to update reviewer score/status/feedback | RLS/column permissions reject the update. |
| REV-09 | Admin reviews an activity submission | Existing Admin review workflow continues to work. |
| REV-10 | Learner resubmits after Needs Revision | New attempt can be created while prior attempt remains in history. |

## 5. Regression checks

- Existing course trainer assignments and course assessment screens still load.
- Existing learner course progress, assignments, file submissions and certificates remain unchanged.
- Admin can still review activity submissions.
- Learners can still read only their own activity submission history.
- Trainer access does not include initial assessments, career referrals, learner phone numbers, or unassigned stages.
- Removing a trainer assignment immediately removes access on the next data request.
- Verify PostgREST relationship queries for `livelihood_stages`, `livelihood_stage_activities` and `learner_stage_progress` resolve correctly.

## 6. Read-only schema checks

Run these only in the test project's SQL Editor after applying migrations:

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

-- Confirm the learner-name RPC exists.
select routine_schema, routine_name, security_type
from information_schema.routines
where routine_schema = 'public'
  and routine_name = 'get_assigned_stage_learner_names';

-- Confirm Trainer update is limited to review fields.
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
```

## 7. Release gate

Do not merge or apply to production until:
- All migration files apply successfully in the isolated test project.
- All test cases above pass with the separate role accounts.
- Admin and Trainer review flows are verified in the browser.
- Supabase Security Advisor and performance checks show no unresolved relevant issue.
- The team confirms backup/rollback steps and explicitly approves production rollout.

**Current status:** Test plan prepared. No test project execution, production migration, deployment, or PR merge has been performed.
