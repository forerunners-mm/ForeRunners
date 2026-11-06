# Trainer Access Hardening — Test Plan

## Scope
This change is additive and targets the trainer stage-assignment SELECT policy plus pagination in the Trainer practical-activity review workspace.

## Migration order
Apply only after the existing dependency migrations:
1. `20261105180000_create_livelihood_development_journey.sql`
2. `20261105183000_fix_livelihood_stage_rls.sql`
3. `20261105190000_add_stage_practical_activities.sql`
4. `20261105200000_create_activity_evidence_submissions.sql`
5. `20261105210000_assign_trainers_by_journey_stage.sql`
6. `20261105220000_harden_stage_trainer_assignment_read.sql`

## Role and access tests
- Admin can list all stage assignments and assign/remove only approved Trainer profiles.
- Approved Trainer can read only their own stage assignment rows.
- Suspended, pending, rejected, and non-Trainer accounts cannot read assignment rows, including previously assigned rows.
- Trainer A cannot read Trainer B's assignment rows.
- Trainer can read/review activity submissions only for assigned stages.
- Trainer cannot directly select learner stage progress or initial assessments/referrals.
- Trainer cannot change submission learner, stage, activity, or evidence text while reviewing.
- Learner can read only their own submissions and cannot set review metadata or approve their own work.

## Pagination tests
- First page returns at most 100 newest submissions.
- Load More appends the next page without replacing earlier rows.
- A final page shorter than 100 hides Load More.
- Empty results show the existing empty table state without a broken control.
- Review save refreshes the first page and retains the newest-first order.
- Confirm duplicate/omitted rows do not occur across pages when the dataset is stable during the test; if records are submitted during pagination, repeat with a stable dataset because offset pagination can shift.

## Journey resubmission regression
The existing `20261105183000_fix_livelihood_stage_rls.sql` already permits a learner's stage-level evidence UPDATE when the current status is `in_progress` or `needs_support`, and requires the resulting status to be `in_progress` or `submitted`. Verify both resubmission states in the isolated test environment. This PR does not replace or rework that policy.

## Release gates
- Run JavaScript syntax/lint checks and inspect the generated diff.
- Apply migrations only in an isolated Supabase test environment after explicit approval.
- Run the role/access and pagination tests above using Admin, approved Trainer, suspended Trainer, unassigned Trainer, and Learner test accounts.
- Review Supabase Security Advisor after the test migration.
- Do not deploy the Edge Function or apply migrations to Production as part of this PR.
