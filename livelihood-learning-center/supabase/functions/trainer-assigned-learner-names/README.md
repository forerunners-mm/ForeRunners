# Trainer learner-name Edge Function

This function replaces the public-schema SECURITY DEFINER RPC used by the Trainer Journey review screen.

## Runtime secrets

Configure these secrets for the Edge Function in Supabase Dashboard (Edge Functions > Secrets):

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY` — the same publishable key used by the LMS browser client
- `SUPABASE_SECRET_KEY` — server-only secret key; never add it to GitHub or browser code

## Authentication model

The function is deployed with platform JWT verification disabled because modern `sb_publishable_...` keys are not JWTs. It then requires the exact configured publishable key in the `apikey` header, validates the Bearer access token with Supabase Auth `getUser(token)`, and checks that the caller's profile is an approved Trainer. It queries only the caller's assigned stages and returns approved learner IDs and names. It accepts no learner ID or stage number from the caller and never returns phone numbers or other profile fields.

The server-only secret key bypasses RLS. Therefore, the function must retain all authorization checks and must never expose that secret to the browser.

## Deployment and verification

- Deploy only after the required PR migrations are applied in a dedicated test project.
- Set `verify_jwt=false` only because the function performs its own authentication as described above.
- Test missing API key, missing/invalid/expired Bearer token, learner account, pending/suspended trainer, approved trainer with no assignments, and trainer assigned to one or more stages.
- Confirm the response contains only `learner_id` and `full_name`.
- Do not deploy to Production as part of this PR.
