import { createClient } from "npm:@supabase/supabase-js@2";
import { chunks, collectPagedRows } from "./trainer-lookup-utils.ts";
import { corsHeadersFor, readApiKey } from "./trainer-request-utils.ts";

const allowedOrigins = new Set([
  "https://forerunners-mm.github.io",
]);
const PAGE_SIZE = 500;
const MAX_STAGE_PROGRESS_ROWS = 10_000;
const PROFILE_ID_BATCH_SIZE = 200;

function json(body: unknown, status = 200, corsHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("Origin");
  const corsHeaders = corsHeadersFor(origin, allowedOrigins);
  if (origin && !allowedOrigins.has(origin)) {
    return json({ error: "Origin not allowed" }, 403, corsHeaders);
  }
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: { ...corsHeaders, "Cache-Control": "no-store" } });
  }
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405, corsHeaders);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const publishableKey = readApiKey(
    Deno.env.get("SUPABASE_PUBLISHABLE_KEYS") ?? null,
    Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? null,
    Deno.env.get("SUPABASE_ANON_KEY") ?? null,
  );
  const secretKey = readApiKey(
    Deno.env.get("SUPABASE_SECRET_KEYS") ?? null,
    Deno.env.get("SUPABASE_SECRET_KEY") ?? null,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? null,
  );
  if (!supabaseUrl || !publishableKey || !secretKey) {
    return json({ error: "Function configuration is incomplete" }, 500, corsHeaders);
  }

  // The gateway verifies the signed-in user's JWT (verify_jwt = true).
  // The handler independently confirms the session with Auth before any
  // privileged query, and checks that apikey is the configured publishable key.
  if (req.headers.get("apikey") !== publishableKey) {
    return json({ error: "Unauthorized" }, 401, corsHeaders);
  }
  const authorization = req.headers.get("Authorization") || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token) return json({ error: "Authentication required" }, 401, corsHeaders);

  const userClient = createClient(supabaseUrl, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: authData, error: authError } = await userClient.auth.getUser(token);
  if (authError || !authData.user) return json({ error: "Invalid or expired session" }, 401, corsHeaders);

  // This elevated client is server-only. Never expose the secret key to the browser.
  const adminClient = createClient(supabaseUrl, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: trainer, error: trainerError } = await adminClient
    .from("profiles")
    .select("id, role, account_status")
    .eq("id", authData.user.id)
    .maybeSingle();

  if (trainerError) return json({ error: "Unable to verify trainer permissions" }, 500, corsHeaders);
  if (!trainer || trainer.role !== "trainer" || trainer.account_status !== "approved") {
    return json({ error: "Approved Trainer access required" }, 403, corsHeaders);
  }

  const { data: assignments, error: assignmentError } = await adminClient
    .from("livelihood_stage_trainers")
    .select("stage_no")
    .eq("trainer_id", authData.user.id)
    .order("stage_no", { ascending: true });

  if (assignmentError) return json({ error: "Unable to load assigned stages" }, 500, corsHeaders);
  const stageNumbers = [...new Set((assignments || []).map((row) => Number(row.stage_no)))];
  if (!stageNumbers.length) return json({ learners: [], stage_progress: [] }, 200, corsHeaders);

  // Fetch progress in stable, bounded pages so the API's row limit cannot
  // silently truncate a Trainer's assigned-stage learner list.
  const progressResult = await collectPagedRows(
    async (from, to) => {
      const { data, error } = await adminClient
        .from("learner_stage_progress")
        .select("id, learner_id, stage_no")
        .in("stage_no", stageNumbers)
        .order("id", { ascending: true })
        .range(from, to);
      return { data, error };
    },
    PAGE_SIZE,
    MAX_STAGE_PROGRESS_ROWS,
  );

  if (progressResult.kind === "query_error") {
    return json({ error: "Unable to load assigned-stage learners" }, 500, corsHeaders);
  }
  if (progressResult.kind === "too_many") {
    return json({
      error: "Too many assigned-stage learners for one request. Please contact an Admin.",
    }, 413, corsHeaders);
  }
  const progress = progressResult.rows;

  const learnerIds = [...new Set(progress.map((row) => row.learner_id))];
  if (!learnerIds.length) return json({ learners: [], stage_progress: [] }, 200, corsHeaders);

  // Keep IN filters comfortably bounded and retrieve only the profile fields
  // needed by the Trainer interface.
  const profiles: Array<{ id: string; full_name: string | null }> = [];
  for (const idBatch of chunks(learnerIds, PROFILE_ID_BATCH_SIZE)) {
    const { data, error } = await adminClient
      .from("profiles")
      .select("id, full_name")
      .in("id", idBatch)
      .eq("role", "learner")
      .eq("account_status", "approved");

    if (error) return json({ error: "Unable to load learner names" }, 500, corsHeaders);
    profiles.push(...(data || []));
  }

  const approvedProfiles = new Map(profiles.map((profile) => [profile.id, profile]));
  const stage_progress = progress
    .filter((row) => approvedProfiles.has(row.learner_id))
    .map((row) => ({
      stage_progress_id: row.id,
      learner_id: row.learner_id,
      stage_no: Number(row.stage_no),
      full_name: approvedProfiles.get(row.learner_id)?.full_name || "Learner",
    }));
  const learners = [...new Map(stage_progress.map((row) => [row.learner_id, {
    learner_id: row.learner_id,
    full_name: row.full_name,
  }])).values()];

  return json({ learners, stage_progress }, 200, corsHeaders);
});
