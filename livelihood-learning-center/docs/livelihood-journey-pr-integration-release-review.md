# Livelihood Journey PR Integration & Release Readiness Review

**Review date:** 2026-11-06  
**Repository:** `forerunners-mm/ForeRunners`  
**Scope:** PR #22–#30, migration dependency order, learner/trainer/Admin integration, RLS and Edge Function security, CI evidence.  
**Review type:** Source and GitHub metadata review only. No database execution or live application testing was performed.

## 1. Executive decision

**Release status: NOT READY for Production.**

The seven-stage journey foundation and the subsequent learner, activity, Admin, and Trainer work form a coherent feature direction, but the complete chain has not passed end-to-end testing. One SQL function delimiter defect was found in the PR #29 branch and corrected in a new branch commit. That correction is not yet validated by PostgreSQL or CI.

Do not merge the remaining PR chain, apply Production migrations, or deploy the Edge Function until the release gates in this document are satisfied.

## 2. PR dependency map

| PR | Current GitHub state at review | Branch relationship | Review note |
|---|---|---|---|
| #22 | Merged | Base: `main` | Seven-stage journey schema foundation |
| #23 | Open / Draft | Base: `main` | Learner journey dashboard, stage RLS and practical activity catalogue |
| #24 | Open / Draft | Base: PR #23 branch | Evidence resubmission correction |
| #25 | Open / Draft | Base: PR #24 branch | Activity evidence submission schema |
| #26 | Open / Draft | Base: PR #25 branch | Alternative combined learner/Admin activity UI |
| #27 | Open / Draft | Base: PR #25 branch | Learner activity submission/history UI |
| #28 | Open / Draft | Base: PR #27 branch | Admin practical activity assessment UI |
| #29 | Open / Draft | Base: PR #28 branch | Trainer stage assignment and Trainer review UI |
| #30 | Closed / Merged | Base: PR #29 branch | Replaces public learner-name RPC with authenticated Edge Function and hardens Trainer access |

### Recommended integration route

Use this main route for review and test integration:

`#22 → #23 → #24 → #25 → #27 → #28 → #29`

PR #30 has already been merged into the PR #29 branch according to GitHub metadata. Treat its security changes as part of the current PR #29 candidate, but validate the exact resulting branch files rather than assuming every later commit on PR #30's source branch was included.

**PR #26 is an alternate implementation path.** Its `app.js` changes include learner activity submission UI and a basic Admin activity review UI. Those responsibilities are separately implemented by PR #27 and PR #28, with PR #28 adding rubric/criterion assessment. Do not merge PR #26 together with PR #27/#28 unless a fresh diff review proves a specific missing feature that must be carried over. Keep PR #26 open or close it only after the project owner chooses the canonical path.

## 3. CI and validation evidence

- PR #23 head commit `26c631e0436abeece46863176162865b2a07e625`: a GitHub Actions CI workflow run was found with conclusion `success`.
- PR #24 head commit `6ae486a09408d580c074c17c28130faf937c5508`: no PR workflow run was returned.
- PR #25 head commit `af817c7cefe87ae2c15a905f86b92430e95970ed`: no PR workflow run was returned.
- PR #26 head commit `939fac90a19296bbbf4e4fd97c6b90441e1e29a0`: no PR workflow run was returned.
- PR #27 head commit `b0ca37b3aa3ced3577d263a63777ed77897b8d1f`: no PR workflow run was returned.
- PR #28 head commit `7641220cc7fb4c1a1bd1db1c91e43be7694105b7`: no PR workflow run was returned.
- PR #29 head commit before this review's correction `2b315b1e8976786d6e9638b79ecbf20494d7cd43`: no PR workflow run was returned.
- PR #30 head commit `d1a1e6b6bc741735bd785aab4926f6c89cae8ef2`: no PR workflow run was returned.

A missing workflow result is **not** a passing check. Re-check CI against the latest PR #29 head after the new SQL correction commit.

## 4. Findings and required actions

### R-01 — SQL dollar-quoting defect in Trainer private helper

**Severity:** Blocker before migration testing.

The Trainer assignment migration on the PR #29 branch contained this invalid PostgreSQL function body delimiter:

```sql
as $
  select exists (
    ...
  );
$;
```

It must use a valid paired dollar-quote delimiter, for example:

```sql
as $$
  select exists (
    ...
  );
$$;
```

**Action taken in this review:** corrected the delimiter on the PR #29 branch in commit `38924f849c1d8c1c2acc86e9ac0204c3bc9a40f8`.

**Still required:** run `git diff --check`, SQL parsing/migration validation and the full migration sequence in an isolated test database. The correction has not been executed against PostgreSQL.

### R-02 — PR #26 duplicates the selected UI path

**Severity:** Integration risk.

PR #26 and PR #27 both change learner journey activity rendering/submission in `app.js`. PR #26 also adds an Admin activity assessment implementation, while PR #28 supplies a separate Admin review workspace with criterion-level scoring and a Trainer workflow follows in PR #29.

**Action required:** retain PR #27 → #28 → #29 as the selected route unless product review identifies a specific PR #26 feature that is missing. Do not combine sibling branches blindly.

### R-03 — No CI confirmation for PR #24–#30

**Severity:** Release blocker until validated.

Only PR #23 has an observed successful CI run in the reviewed commit set. No workflow runs were returned for PR #24–#30 heads.

**Action required:** add or run checks for JavaScript syntax, HTML integrity, SQL migration parsing, and Edge Function type/lint validation. Re-check the latest commit SHA, not the older SHA recorded above.

### R-04 — No isolated database or E2E execution

**Severity:** Release blocker.

The production project migration history does not contain the seven-stage journey migrations. No paid test branch was created, and no migration in this feature chain has been applied to Production.

**Action required:** obtain explicit approval for a test environment and any quoted recurring cost. Apply the migrations only in that isolated environment, in the documented dependency order. Then execute the Learner → Trainer → Admin test plan using synthetic accounts and evidence.

### R-05 — Private SECURITY DEFINER helper needs database verification

**Severity:** High-priority security validation.

The Trainer assignment migration uses `private.trainer_can_access_livelihood_stage_progress(uuid)` as a boolean authorization helper. It is placed in the non-exposed `private` schema, uses an empty search path, revokes execution from `public` and `anon`, and grants execution to `authenticated`.

**Action required in test environment:**
- Confirm the function owner is a trusted migration/database owner.
- Confirm the function exists only in the private schema.
- Confirm `authenticated` has the intended private schema usage and helper execute privileges.
- Confirm `anon` and `public` do not have execute privileges.
- Confirm Trainer direct SELECT on `learner_stage_progress` returns no rows.
- Confirm the helper returns only a boolean and returns false for another learner's progress ID.
- Run Supabase Security Advisor after applying the migration.

Do not treat source review as proof of the live database privilege state.

### R-06 — Trainer assignment metadata policy can be tightened

**Severity:** Low / hardening recommendation.

The current assignment SELECT policy permits a Trainer to read their own `livelihood_stage_trainers` assignment rows by user ID, without checking current approved Trainer status in that policy. The Edge Function and activity-submission policies independently check approved Trainer status, so this does not by itself grant learner evidence access. However, a suspended Trainer may still see their own stage assignment metadata.

**Recommended improvement:** require the caller to remain an approved Trainer for the self-read branch of the assignment SELECT policy, while preserving Admin access. Validate this policy change in the test database before release.

### R-07 — Activity approval and Journey Stage verification are separate decisions

**Severity:** Product workflow acceptance criterion.

Activity submissions use statuses `submitted`, `reviewing`, `needs_revision`, and `approved`. Journey stage progress separately uses stage-level states including `in_progress`, `submitted`, `verified`, and `needs_support`.

The E2E workflow must not assume that one approved activity automatically verifies a whole Journey Stage. The Admin Journey Reviews workflow must remain the final stage-verification step unless the product owner explicitly changes that rule.

## 5. Security and integration checks confirmed by source review

- Trainer activity evidence access is scoped through assigned stage numbers and an approved Trainer profile check.
- Trainer direct SELECT on `learner_stage_progress` is deliberately removed to avoid exposing stage-level evidence and reviewer feedback through row-level access.
- Trainer UPDATE is restricted to review fields; learner ID, stage progress ID, activity ID and evidence text are not in the Trainer column-level UPDATE grant.
- The Edge Function independently validates the user session and approved Trainer profile, uses a server-only secret key, and returns minimal learner identity/stage-progress metadata.
- Edge Function CORS allowlist is exact-origin based; `Cache-Control: no-store` is set. Keep gateway JWT verification enabled.
- The activity-submission migration enforces evidence length, score bounds, review metadata and non-empty feedback for `needs_revision`.
- A partial unique index allows a new attempt after `needs_revision` while preserving prior attempts.

These are source-level observations and still require live RLS/Edge Function tests.

## 6. Required test sequence

1. Confirm the latest PR #29 branch contains the corrected migration and the E2E test plan.
2. Run static checks and CI against the latest PR #29 head.
3. Obtain explicit authorization and create/use an isolated test environment.
4. Apply the migrations in order: 18:00, 18:30, 19:00, 20:00, 21:00.
5. Deploy the Edge Function to the test environment only, with secrets configured outside source control and gateway JWT verification enabled.
6. Test Admin assignment, Learner submission, Trainer review, Learner revision, Trainer approval, Admin stage verification, and next-stage unlocking.
7. Run cross-role privacy tests, including suspended/unassigned Trainer, other learner IDs, direct progress SELECT, and forbidden ownership/evidence updates.
8. Run regression tests for courses, lessons, quizzes, existing assignments/file uploads, assessments, referrals and existing Admin/Trainer permissions.
9. Record redacted evidence and obtain project-owner sign-off.

## 7. Release gate

Production release remains blocked until:
- the latest code passes CI and static checks;
- the corrected migration parses and applies in the isolated test environment;
- RLS, private helper and Edge Function security tests pass;
- the complete E2E and regression plans pass;
- no unresolved critical/high defects remain;
- the project owner explicitly approves each Production migration, Edge Function deployment and PR merge action.

**Current state:** PR #29 remains open/draft. This review did not merge any PR, create a Supabase test branch, apply a migration, deploy an Edge Function, or change Production data.
