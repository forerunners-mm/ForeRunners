# Learner–Trainer–Admin End-to-End Test Plan

**Project:** ForeRunners Livelihood Learning Center  
**Scope:** Seven-stage livelihood development journey, practical activity submissions, Trainer stage assignments, Admin verification, and learner progress display.  
**Status:** Test plan only. This document does not authorize production migration, Edge Function deployment, PR merge, or paid test-branch creation.

## 1. Safety and test-environment gate

Run these tests only in an isolated Supabase test project/branch with test accounts and synthetic data.

Before testing:
- Confirm the test environment is separate from Production and record its project/branch identifier.
- Confirm the required migrations are present in dependency order:
  1. `20261105180000_create_livelihood_development_journey.sql`
  2. `20261105183000_fix_livelihood_stage_rls.sql`
  3. `20261105190000_add_stage_practical_activities.sql`
  4. `20261105200000_create_activity_evidence_submissions.sql`
  5. `20261105210000_assign_trainers_by_journey_stage.sql` including the security changes proposed in PR #30.
- Deploy the `trainer-assigned-learner-names` Edge Function to the test environment only. Keep gateway JWT verification enabled and configure secrets through the Supabase secret store; never place secret keys in frontend code or test notes.
- Confirm the frontend build under test points to the test project and uses only its publishable key.
- Use synthetic learner names and evidence. Do not copy real learner records, contact details, counseling notes, or sensitive assessment responses.
- Capture the migration list, function deployment version, frontend commit SHA, and test date in the test record.

**Stop condition:** If any migration is missing, the Edge Function is unavailable, the app points to Production, or a test account has an unexpected role/status, stop. Do not improvise by applying migrations to Production.

## 2. Test accounts and fixtures

Create the following accounts in the test environment. Set role and account status through the approved Admin workflow, not by trusting editable user metadata.

| Account | Role / status | Assignment |
|---|---|---|
| Admin A | Admin / approved | Can manage assignments and verify journey evidence |
| Trainer A | Trainer / approved | Stage 1 and Stage 2 |
| Trainer B | Trainer / approved | Stage 3 |
| Trainer C | Trainer / approved | No stage assignment |
| Trainer Suspended | Trainer / suspended | No active review access |
| Learner A | Learner / approved | Test learner for Stage 1 |
| Learner B | Learner / approved | Test learner for Stage 1 negative-access checks |
| Learner Pending | Learner / pending | Not eligible to submit |

Prepare at least two practical activities in Stage 1 and one activity in Stage 2. Use a unique evidence phrase for each test submission so that records can be traced without using personal data.

## 3. End-to-end happy path

| Step | Actor | Action | Expected result |
|---|---|---|---|
| 1 | Admin A | Assign Trainer A to Stage 1 and Stage 2 | Assignment saved; only authorized Admin can manage assignments |
| 2 | Learner A | Sign in and open the learner journey | Journey stages and available activities load in the learner's language |
| 3 | Learner A | Open a Stage 1 activity | Activity title, instructions, evidence prompt, criteria, and estimated time are visible |
| 4 | Learner A | Submit valid evidence (20–5000 characters) | Submission is created for Learner A and the selected activity/stage |
| 5 | Trainer A | Open assigned-stage review workspace | Stage 1 submission is visible with learner name, activity, stage, and evidence |
| 6 | Trainer A | Set status to Reviewing and save | Status and review metadata are saved; evidence ownership is unchanged |
| 7 | Trainer A | Score criteria, enter feedback, and choose Needs Revision | Score/criteria/feedback are saved; non-empty feedback is required |
| 8 | Learner A | Reopen the activity and read feedback | Previous attempt and feedback are visible; learner can submit a new attempt |
| 9 | Learner A | Submit revised evidence | A new attempt is created; previous attempt remains in history |
| 10 | Trainer A | Review revised attempt and choose Approved | Approved status and score are saved |
| 11 | Admin A | Open Journey Reviews and inspect Stage 1 evidence | Admin can see the evidence and Trainer review outcome |
| 12 | Admin A | Verify Stage 1 after checking the evidence | Stage 1 becomes verified; verification is performed by Admin, not learner |
| 13 | Learner A | Refresh learner journey | Stage 1 shows verified; Stage 2 unlocks only according to the configured sequential rules |
| 14 | Learner A | Open Stage 2 and submit its activity | Stage 2 evidence is linked to the correct Stage 2 progress record |

Record the actual status transitions and timestamps. If the implementation intentionally requires a separate stage-level evidence submission in addition to activity evidence, test and document that step separately; do not assume activity approval alone automatically verifies the stage.

## 4. Functional and validation test cases

| ID | Test | Expected result |
|---|---|---|
| F-01 | Submit evidence with fewer than 20 characters | Validation rejects submission with a clear message |
| F-02 | Submit evidence with more than 5000 characters | Validation rejects submission |
| F-03 | Submit valid evidence for an activity in the active stage | Submission is accepted and linked to the correct activity and stage progress |
| F-04 | Submit evidence for a later locked stage | Submission is denied |
| F-05 | Submit evidence for an activity whose stage does not match the supplied stage progress | Database/RLS rejects the mismatch |
| F-06 | Submit a second attempt while the previous attempt is submitted, reviewing, or approved | Duplicate active attempt is prevented according to the unique active-submission rule |
| F-07 | Submit a new attempt after Needs Revision | New attempt is allowed and previous attempt remains in history |
| F-08 | Trainer chooses Needs Revision without feedback | Save is rejected |
| F-09 | Trainer enters score below 0 or above 100 | Validation/database constraint rejects it |
| F-10 | Trainer saves Reviewing, Needs Revision, or Approved | Required reviewer identity and review timestamp are recorded |
| F-11 | Learner views activity history | Only that learner's submissions, scores, and feedback are shown |
| F-12 | Learner tries to edit another learner's submission | Request is denied |
| F-13 | Learner tries to mark their own stage verified | Request is denied; stage verification remains a human review action |
| F-14 | Admin reopens a verified stage (if supported) | Reopen action is recorded and learner-facing status updates consistently |

## 5. Role, assignment, and privacy tests

| ID | Actor / attempt | Expected result |
|---|---|---|
| P-01 | Trainer A reads assigned Stage 1/2 review queue | Only assigned-stage submissions are returned |
| P-02 | Trainer A attempts to review Stage 3 | No Stage 3 learner evidence is visible or editable |
| P-03 | Trainer B attempts to review Stage 1 | No Stage 1 learner evidence is visible or editable |
| P-04 | Trainer C (unassigned) calls the review UI/API | No learner records or submissions are returned |
| P-05 | Suspended Trainer calls the Edge Function | Access is denied |
| P-06 | Learner A calls the Trainer Edge Function | Access is denied |
| P-07 | Request omits Bearer session token | Access is denied |
| P-08 | Request uses invalid/expired session token | Access is denied |
| P-09 | Request has an unapproved Origin | CORS request is rejected |
| P-10 | Trainer directly queries `learner_stage_progress` | No rows are exposed to Trainer; no evidence summary or reviewer feedback is disclosed through this table |
| P-11 | Trainer invokes private stage-access helper for another learner's progress ID | Returns false; does not disclose learner or progress data |
| P-12 | Trainer queries activity submissions | Only submissions for assigned stages are accessible |
| P-13 | Trainer attempts to change learner_id, activity_id, stage_progress_id, or evidence_text | Update is denied; Trainer can update only permitted review fields |
| P-14 | Trainer attempts to manage stage assignments | Denied; assignment management is Admin-only |
| P-15 | Learner A requests learner names through the Edge Function | Denied; only an approved assigned Trainer may receive the minimal response |
| P-16 | Inspect Edge Function response | Contains only the documented learner identity and stage-progress metadata; no contact details, evidence text, reviewer feedback, or assessment responses |
| P-17 | Inspect browser network/log output | No secret/service-role key, access token, or refresh token is written to application logs or exposed in client source |

For the Edge Function, test both the normal browser-origin request and a server-to-server request with no Origin header. Confirm that authentication and authorization are required in both cases. CORS is not an authorization substitute.

## 6. Journey progression and Admin verification

Test these rules explicitly:
- A learner cannot skip a stage by editing browser state, calling the API directly, or submitting evidence for a locked stage.
- Activity evidence approval and Journey Stage verification are treated as distinct decisions unless the product requirements explicitly define otherwise.
- Only an authorized Admin can verify/reopen a stage.
- A stage cannot be marked verified when required evidence is missing or the review decision is incomplete.
- Stage completion percentage and verified-stage count match the stored verified stages.
- The next stage unlocks only after the previous stage satisfies its configured verification rule.
- Rejected, needs-revision, and reopened evidence does not accidentally count as verified completion.
- Learner-facing progress is consistent after refresh and after signing out/in.
- Stage-level evidence and activity-level evidence do not overwrite one another.

## 7. Regression checks

After the journey features are enabled in the test environment, confirm existing LMS features still work:
- Learner sign-in, sign-out, and session refresh.
- Course catalogue, course enrollment, lessons, and lesson progress.
- Quiz submission and answer privacy.
- Existing assignment submission, file upload, Admin review, feedback, and resubmission.
- Initial assessment history and consent handling.
- Career guidance referral request and Admin review.
- Admin dashboard and existing learner management.
- Trainer role does not gain Admin assessment/referral access.
- Bilingual labels and validation messages remain usable on desktop and mobile layouts.

## 8. Evidence to retain for each test

Use a test log with these fields:

| Field | Record |
|---|---|
| Test ID | e.g. E2E-01, P-05 |
| Environment | Test project/branch identifier only |
| Build | Frontend commit SHA |
| Database | Applied migration versions |
| Function | Edge Function deployment/version |
| Actor | Synthetic test account label |
| Result | Pass / Fail / Blocked / Not Run |
| Evidence | Redacted screenshot or request/result summary |
| Defect | Issue/PR link and concise reproduction steps |
| Retest | Date, result, tester |

Do not attach raw access tokens, secret keys, private learner records, counseling notes, or unredacted database exports to test evidence.

## 9. Release acceptance criteria

The journey feature set is **not ready for Production** until all of the following are true:
1. All prerequisite migrations have been reviewed and applied successfully in the isolated test environment.
2. All happy-path tests pass from learner submission through Trainer review and Admin stage verification.
3. All role/assignment/privacy tests pass, especially P-05, P-10, P-13, and P-16.
4. No unresolved critical/high security or data-integrity defects remain.
5. Existing LMS regression checks pass.
6. Admin and Trainer workflows are tested with separate accounts.
7. Test evidence is reviewed and signed off by the project owner.
8. A separate explicit approval is obtained before any Production migration, Edge Function deployment, PR merge, or other release action.

**Current release status:** Not tested end-to-end. This plan is documentation only; no test branch was created, no migration was applied, no Edge Function was deployed, and no PR was merged.
