import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const publishableKey = Deno.env.get("SUPABASE_PUBLISHABLE_KEY");
  const secretKey = Deno.env.get("SUPABASE_SECRET_KEY");
  if (!supabaseUrl || !publishableKey || !secretKey) {
    return json({ error: "Function configuration is incomplete" }, 500);
  }

  // Edge gateway JWT verification is disabled for modern sb_publishable keys.
  // Enforce the public API key header here, then independently validate the user's JWT.
  if (req.headers.get("apikey") !== publishableKey) {
    return json({ error: "Unauthorized" }, 401);
  }
  const authorization = req.headers.get("Authorization") || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token) return json({ error: "Authentication required" }, 401);

  const userClient = createClient(supabaseUrl, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: authData, error: authError } = await userClient.auth.getUser(token);
  if (authError || !authData.user) return json({ error: "Invalid or expired session" }, 401);

  // This elevated client is server-only. Never expose SUPABASE_SECRET_KEY to the browser.
  const adminClient = createClient(supabaseUrl, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: trainer, error: trainerError } = await adminClient
    .from("profiles")
    .select("id, role, account_status")
    .eq("id", authData.user.id)
    .maybeSingle();

  if (trainerError) return json({ error: "Unable to verify trainer permissions" }, 500);
  if (!trainer || trainer.role !== "trainer" || trainer.account_status !== "approved") {
    return json({ error: "Approved Trainer access required" }, 403);
  }

  const { data: assignments, error: assignmentError } = await adminClient
    .from("livelihood_stage_trainers")
    .select("stage_no")
    .eq("trainer_id", authData.user.id);

  if (assignmentError) return json({ error: "Unable to load assigned stages" }, 500);
  const stageNumbers = [...new Set((assignments || []).map((row) => Number(row.stage_no)))];
  if (!stageNumbers.length) return json({ learners: [] });

  const { data: progress, error: progressError } = await adminClient
    .from("learner_stage_progress")
    .select("learner_id, stage_no")
    .in("stage_no", stageNumbers);

  if (progressError) return json({ error: "Unable to load assigned-stage learners" }, 500);
  const learnerIds = [...new Set((progress || []).map((row) => row.learner_id))];
  if (!learnerIds.length) return json({ learners: [] });

  const { data: profiles, error: profileError } = await adminClient
    .from("profiles")
    .select("id, full_name")
    .in("id", learnerIds)
    .eq("role", "learner")
    .eq("account_status", "approved");

  if (profileError) return json({ error: "Unable to load learner names" }, 500);

  const learners = (profiles || []).map((profile) => ({
    learner_id: profile.id,
    full_name: profile.full_name || "Learner",
  }));
  return json({ learners });
});
