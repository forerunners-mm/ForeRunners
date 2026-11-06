# Trainer learner-name Edge Function

This function replaces the public-schema SECURITY DEFINER learner-name RPC used by the Trainer Journey review screen. The related trainer-assignment migration no longer creates that RPC.

## Runtime secrets

Configure these secrets for the Edge Function in Supabase Dashboard (Edge Functions > Secrets):

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY` — the same publishable key used by the LMS browser client
- `SUPABASE_SECRET_KEY` — server-only secret key; never add it to GitHub or browser code

## Authentication model

Keep the Supabase Edge gateway's default JWT verification enabled. The browser sends its normal Supabase user access token as the Bearer token and the configured publishable key in the `apikey` header. The function additionally validates the API key header and calls Supabase Auth `getUser(token)`.

The function requires the caller's profile to be an approved Trainer, reads only that Trainer's assigned stages, and returns two minimal collections: `learners` (`learner_id`, `full_name`) and `stage_progress` (`stage_progress_id`, `learner_id`, `stage_no`, `full_name`) for approved learners in the Trainer's assigned stages. It accepts no learner ID or stage number from the caller and never returns phone numbers, evidence summaries, reviewer notes, or other profile fields.

The function's browser CORS allowlist currently permits only `https://forerunners-mm.github.io`, the published LMS origin. If the LMS moves to a custom domain or a different hosting origin, update the allowlist to that exact origin before deployment; do not replace it with a wildcard. Responses include `Cache-Control: no-store` so learner names are not stored by browser or intermediary caches.

The server-only secret key bypasses RLS. Therefore, the function must retain all authorization checks and must never expose that secret to the browser. Trainers have no direct SELECT policy on `learner_stage_progress`, because RLS cannot hide individual columns in a row. The activity-submission RLS policies call the private-schema `private.trainer_can_access_livelihood_stage_progress(uuid)` boolean helper, which checks approved Trainer status and stage assignment without exposing progress fields. The helper returns only a boolean and is not created in the exposed `public` schema. The migration explicitly grants `USAGE` on the `private` schema to `authenticated` so the RLS policy can resolve the helper; the helper's `EXECUTE` privilege remains revoked from `public` and `anon`.

## Deployment and verification

- Deploy only after the required PR migrations are applied in a dedicated test project.
- Do not disable gateway JWT verification.
- Test missing API key, missing/invalid/expired Bearer token, learner account, pending/suspended Trainer, approved Trainer with no assignments, and Trainer assigned to one or more stages.
- Confirm `learners` contains only `learner_id` and `full_name`, and `stage_progress` contains only `stage_progress_id`, `learner_id`, `stage_no`, and `full_name`.
- Confirm Trainers cannot directly select `learner_stage_progress` rows or read `evidence_summary` / `reviewer_feedback`.
- Verify a Trainer whose role/status is changed after assignment immediately loses RLS access to stage progress and activity submissions.
- Do not deploy to Production as part of this PR.
