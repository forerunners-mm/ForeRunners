// Pure request helpers so CORS and key configuration can be tested without
// starting a Supabase Edge Runtime or exposing real credentials.

export function corsHeadersFor(origin: string | null, allowedOrigins: ReadonlySet<string>) {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
  if (origin && allowedOrigins.has(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  return headers;
}

// Supabase hosted runtimes may expose named key maps. Singular and legacy
// variables remain supported for local development and older projects.
export function readApiKey(
  namedValue: string | null,
  singleValue: string | null,
  legacyValue: string | null,
): string | null {
  if (namedValue) {
    try {
      const keys = JSON.parse(namedValue) as Record<string, unknown>;
      if (typeof keys.default === "string" && keys.default.length > 0) {
        return keys.default;
      }
    } catch {
      return null;
    }
  }
  return singleValue || legacyValue || null;
}
