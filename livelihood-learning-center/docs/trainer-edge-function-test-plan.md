# Trainer Assigned Learner Names — Edge Function Test Plan

## Scope
- Verify the caller's session with Supabase Auth before using the server-only elevated client.
- Support hosted named API-key environment variables, local singular variables, and legacy key variables.
- Paginate assigned-stage progress in stable batches of 500.
- Fetch approved learner profiles in batches of 200.
- Stop with HTTP 413 when the assigned-stage progress set exceeds 10,000 rows rather than silently returning an incomplete list.
- Restrict browser origins to the published GitHub Pages origin.

## Configuration and secrets
1. Confirm the deployed project exposes `SUPABASE_URL`.
2. Confirm one supported publishable key source is configured:
   - `SUPABASE_PUBLISHABLE_KEYS` JSON map with a `default` entry (hosted current format), or
   - `SUPABASE_PUBLISHABLE_KEY` (local/singular format), or
   - `SUPABASE_ANON_KEY` (legacy format).
3. Confirm one supported secret key source is configured:
   - `SUPABASE_SECRET_KEYS` JSON map with a `default` entry (hosted current format), or
   - `SUPABASE_SECRET_KEY` (local/singular format), or
   - `SUPABASE_SERVICE_ROLE_KEY` (legacy format).
4. Never place a secret/service-role key in frontend code, Git, or browser-visible configuration.
5. `config.toml` sets `verify_jwt = false` for this function because current publishable API keys are not JWTs. The function must retain its explicit API-key comparison and `auth.getUser(token)` verification. Do not remove either check.

## Authentication and authorization tests
- OPTIONS preflight from the published origin returns CORS headers.
- An unapproved origin is rejected.
- GET is rejected; POST is accepted.
- Missing or incorrect `apikey` is rejected.
- Missing, expired, malformed, or invalid Bearer session is rejected.
- Authenticated learner, Admin, pending Trainer, suspended Trainer, and rejected Trainer are denied.
- Approved Trainer with no stage assignment receives empty `learners` and `stage_progress` arrays.
- Approved Trainer receives only approved Learner names and progress for assigned stages.
- Secret key is never included in the response or logs.

## Pagination and scale tests
- 0 progress rows returns empty arrays.
- 1, 499, 500, and 501 progress rows return every row exactly once.
- 1,000+ progress rows across several assigned stages return all rows.
- Equal/adjacent IDs across page boundaries do not cause duplicates or omissions.
- More than 10,000 rows returns HTTP 413 with a safe, non-sensitive message.
- Profile lookup works across multiple 200-ID batches.
- Pending/rejected/suspended learner profiles are excluded.
- Simulate a database error during each page and profile batch; function returns a generic error without leaking database details.

## Release gates
- Run Deno check/lint or Supabase CLI function serve locally.
- Test both current named API-key environment variables and legacy/local fallback variables.
- Confirm the deployed project's actual API-key format before deployment.
- Test with synthetic data exceeding 1,000 progress rows.
- Review Supabase Security Advisor and Edge Function logs after isolated testing.
- Do not deploy this function or change Production secrets as part of this PR.
