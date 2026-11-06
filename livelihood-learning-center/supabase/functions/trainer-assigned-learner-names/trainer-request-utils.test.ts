import { corsHeadersFor, readApiKey } from "./trainer-request-utils.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function assertEquals<T>(actual: T, expected: T, message: string) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

const allowed = new Set(["https://forerunners-mm.github.io"]);

Deno.test("CORS allows the exact published site origin", () => {
  const headers = corsHeadersFor("https://forerunners-mm.github.io", allowed);
  assertEquals(headers["Access-Control-Allow-Origin"], "https://forerunners-mm.github.io", "allowed origin");
  assertEquals(headers["Access-Control-Allow-Methods"], "POST, OPTIONS", "allowed methods");
  assertEquals(headers["Vary"], "Origin", "vary header");
});

Deno.test("CORS does not reflect an untrusted origin", () => {
  const headers = corsHeadersFor("https://attacker.example", allowed);
  assert(!("Access-Control-Allow-Origin" in headers), "untrusted origin must not receive allow-origin");
});

Deno.test("CORS does not add allow-origin when Origin is absent", () => {
  const headers = corsHeadersFor(null, allowed);
  assert(!("Access-Control-Allow-Origin" in headers), "missing origin must not receive allow-origin");
});

Deno.test("readApiKey prefers the default entry in named key map", () => {
  assertEquals(
    readApiKey(JSON.stringify({ default: "publishable-default", other: "other-key" }), "single", "legacy"),
    "publishable-default",
    "named key has priority",
  );
});

Deno.test("readApiKey falls back to singular key when named map is absent", () => {
  assertEquals(readApiKey(null, "single-key", "legacy-key"), "single-key", "singular fallback");
});

Deno.test("readApiKey falls back to legacy key when newer keys are absent", () => {
  assertEquals(readApiKey(null, null, "legacy-key"), "legacy-key", "legacy fallback");
});

Deno.test("readApiKey returns null when named map is malformed", () => {
  assertEquals(readApiKey("{not-json", "single-key", "legacy-key"), null, "malformed named map");
});

Deno.test("readApiKey rejects missing or empty default entry without leaking other keys", () => {
  assertEquals(readApiKey(JSON.stringify({ other: "not-default" }), null, null), null, "missing default");
  assertEquals(readApiKey(JSON.stringify({ default: "" }), null, null), null, "empty default");
});
