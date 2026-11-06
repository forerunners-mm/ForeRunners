# Trainer learner-name Edge Function

This function replaces the public-schema SECURITY DEFINER learner-name RPC used by the Trainer Journey review screen. The related trainer-assignment migration no longer creates that RPC.

## Runtime secrets

Configure these secrets for the Edge Function in Supabase Dashboard (Edge Functions > Secrets):

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY` — the same publishable key used by the LMS browser client
- `SUPABASE_SECRET_KEY` — server-only secret key; never add it to GitHub or browser code

## Authentication model

Keep the Supabase Edge gateway's default JWT verification enabled. The browser sends its normal Supabase user access token as the Bearer token and the configured publishable key in the `apikey` header. The function additionally validates the API key header and calls Supabase Auth `getUser(token)`.

The function requires the caller's profile to be an approved Trainer, reads only that Trainer's assigned stages, and returns only approved learner IDs and names found in progress for those stages. It accepts no learner ID or stage number from the caller and never returns phone numbers or other profile fields.

The server-only secret key bypasses RLS. Therefore, the function must retain all authorization checks and must never expose that secret to the browser. The related RLS policies independently require the caller to remain an approved Trainer for stage progress and activity submission access/review.

## Deployment and verification

- Deploy only after the required PR migrations are applied in a dedicated test project.
- Do not disable gateway JWT verification.
- Test missing API key, missing/invalid/expired Bearer token, learner account, pending/suspended Trainer, approved Trainer with no assignments, and Trainer assigned to one or more stages.
- Confirm the response contains only `learner_id` and `full_name`.
- Verify a Trainer whose role/status is changed after assignment immediately loses RLS access to stage progress and activity submissions.
- Do not deploy to Production as part of this PR.
