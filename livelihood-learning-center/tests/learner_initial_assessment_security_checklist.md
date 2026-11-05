# Learner Initial Assessment — Security Test Plan

Run these checks in a disposable Supabase project or a controlled staging environment after applying the migration. Do not use real learner records for negative-access tests.

## Test identities

Prepare:
- Learner A: approved profile with role `learner`.
- Learner B: approved profile with role `learner`.
- Pending Learner C: role `learner`, status `pending`.
- Trainer D: approved profile with role `trainer`.
- Admin E: approved profile with role `admin`.
- Anonymous client with no authenticated session.

## Expected results

| Test | Expected |
|---|---|
| Learner A inserts a draft for A | Allowed |
| Learner A reads A's draft | Allowed |
| Learner A reads B's assessment | No rows returned |
| Learner A inserts an assessment owned by B | Rejected by RLS |
| Learner A inserts directly as submitted | Rejected by RLS |
| Learner A updates A's draft answers | Allowed |
| Learner A submits a non-empty draft | Allowed; database sets submitted timestamp |
| Learner A submits an empty draft | Rejected by trigger |
| Learner A changes learner_id on draft | Rejected by trigger/RLS |
| Learner A edits or deletes submitted assessment | Rejected |
| Learner A creates a second draft while one exists | Rejected by unique index |
| Learner A deletes own draft | Allowed |
| Pending Learner C inserts an assessment | Rejected by RLS |
| Trainer D reads or writes assessments | Rejected / no rows |
| Admin E reads assessments | Allowed |
| Admin E changes assessment content | Rejected by RLS |
| Anonymous client reads or writes | Rejected by grants/RLS |
| Contact consent false on submit | Timestamp remains null |
| Contact consent true on submit | Consent timestamp is set by database |

## Review notes

- Confirm the migration has been applied only once and is recorded in Supabase migration history.
- Inspect policies on `public.learner_initial_assessments` and verify RLS is enabled.
- Confirm no policy grants access to `anon`, Trainer, external providers or unassigned support personnel.
- Run Supabase Security and Performance Advisors after the migration is applied.
- Do not test using a service-role key in the browser; service role bypasses RLS.
