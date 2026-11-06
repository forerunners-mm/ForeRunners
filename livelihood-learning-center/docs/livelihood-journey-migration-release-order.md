# Livelihood Journey — Migration Dependency and Release Order

**Scope:** Release planning for the seven-stage learner journey, practical activity evidence, and stage-scoped Trainer review.

This document is a planning checklist only. It does not apply SQL, deploy code, create a Supabase branch, or merge a pull request.

## 1. Production baseline — read-only confirmation

The connected Production project's migration history currently includes the initial assessment and career-guidance referral migrations. The seven-stage journey and its practical-activity/trainer migrations are not recorded as applied in Production.

The Production database already has the `private` schema and the existing `private.is_admin()` helper. A read-only privilege check confirmed:
- `authenticated` has `USAGE` on `private`.
- `anon` also has schema `USAGE`, but cannot execute `private.is_admin()`.
- `authenticated` can execute `private.is_admin()`.

Do not infer from the existence of the `private` schema that any new journey migration has been applied.

## 2. Required migration order

Apply only in an isolated test database first, in this order:

| Order | Migration file | Purpose | Depends on |
|---:|---|---|---|
| 1 | `20261105180000_create_livelihood_development_journey.sql` | Creates seven journey stages and learner stage progress | Existing profiles/auth baseline |
| 2 | `20261105183000_fix_livelihood_stage_rls.sql` | Adds previous-stage verification helper and learner RLS changes | Order 1; existing `private` schema and `private.is_admin()` |
| 3 | `20261105190000_add_stage_practical_activities.sql` | Adds bilingual practical activity catalogue | Order 1 |
| 4 | `20261105200000_create_activity_evidence_submissions.sql` | Adds learner activity evidence, attempts and Admin review fields | Orders 1 and 3 |
| 5 | `20261105210000_assign_trainers_by_journey_stage.sql` | Adds stage assignments, private Trainer authorization helper and scoped review policies | Orders 1 and 4; existing profiles and Admin helper |

**Do not skip or reorder these migrations.** The trainer-assignment migration refers to the activity submission table, and activity submissions refer to the journey progress and activity catalogue.

## 3. Pull request dependency chain

The code is currently split across dependent, open/draft pull requests:
- PR #22: journey schema migration (already merged to main, but not applied to Production).
- PR #23: journey dashboard, stage progress, practical activity catalogue and RLS follow-up.
- PR #24: resubmission UI correction, based on PR #23.
- PR #25: activity-level evidence submission schema, based on PR #24.
- PR #27: learner activity evidence submission UI, based on PR #25.
- PR #28: Admin practical activity assessment UI, based on PR #27.
- PR #29: Trainer stage assignment migration and assignment/review functionality.
- PR #30: security hardening for Trainer learner-name access and stage-scoped review, based on PR #29.

Before any merge, confirm the actual current base/head branches and head SHAs in GitHub. A child PR depending on an unmerged parent is not independently release-ready. Keep the PRs in draft until the full dependency chain is reviewed and tested.

## 4. Test sequence after an isolated test database is approved

1. Confirm the test database is separate from Production.
2. Apply the five migrations in the order above.
3. Run SQL checks for table existence, RLS enabled, policies, grants, function schema, function owner and function privileges.
4. Test learner self-access, stage unlocking, evidence submission, revision history and Admin review.
5. Test Trainer access with synthetic accounts:
   - assigned and approved Trainer;
   - unassigned Trainer;
   - pending or suspended Trainer;
   - Trainer whose role has changed;
   - learners in assigned and unassigned stages.
6. Verify Trainer cannot directly SELECT `learner_stage_progress`, including `evidence_summary` and `reviewer_feedback`.
7. Verify Trainer can read/update only assigned-stage activity submissions and only review columns.
8. Test Edge Function authentication, origin restrictions, empty arrays, approved learner filtering and minimal response fields.
9. Run Supabase Security Advisor and resolve relevant findings.
10. Run browser regression tests for Learner, Trainer and Admin views.

## 5. Release gate

Do not apply these migrations to Production, deploy the Edge Function, or merge the dependent PR chain until:
- the test database results are recorded;
- the RLS and Edge Function tests pass;
- the current GitHub PR dependency chain is reviewed;
- a backup/rollback plan is documented; and
- the owner explicitly approves the production rollout.

A Supabase branch was previously quoted at **$0.01344/hour**. No branch has been created. Creating one still requires explicit approval of that hourly cost. The word “next” does not count as approval.
