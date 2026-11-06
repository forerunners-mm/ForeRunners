# Trainer learner-name Edge Function

This function replaces the public-schema SECURITY DEFINER RPC used by the Trainer Journey review screen.

## Runtime secrets

Configure these secrets for the Edge Function in Supabase Dashboard (Edge Functions > Secrets):

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY` — the same publishable key used by the LMS browser client
- `SUPABASE_SECRET_KEY` — server-only secret key; never add it to GitHub or browser code

Do not use a legacy service-role key in the browser. The secret key is used only by this function.

## Authentication model

The function is deployed with platform JWT verification disabled because modern `sb_publishable_...` keys are not JWTs. It then:
1. Requires the exact configured publishable key in the `apikey` header.
2. Requires a Bearer access token and validates it with Supabase Auth `getUser(token)`.
3. Reads the caller's profile using the server-only secret key and requires `role=trainer` and `account_status=approved`.
4. Reads only stages assigned to that trainer, then returns only approved learner IDs and names found in progress for those stages.

The secret key bypasses RLS, so the function performs all authorization checks before returning data. It accepts no learner ID or stage number from the caller, preventing the caller from selecting another stage. It never returns phone numbers or other profile fields.

## Deployment and verification

- Deploy only after the required PR migrations are applied in a dedicated test project.
- Set `verify_jwt=false` only because the function performs its own authentication as described above.
- Test missing API key, missing/invalid/expired Bearer token, learner account, pending/suspended trainer, approved trainer with no assignments, and trainer assigned to one or more stages.
- Confirm the response contains only `learner_id` and `full_name`.
- Do not deploy to Production as part of this PR.
