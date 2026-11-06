import { chunks, collectPagedRows } from "./trainer-lookup-utils.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function assertEquals<T>(actual: T, expected: T, message: string) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

Deno.test("chunks returns no batches for empty input", () => {
  assertEquals(chunks([], 200), [], "empty input");
});

Deno.test("chunks splits profile IDs into batches of at most 200", () => {
  const ids = Array.from({ length: 401 }, (_, index) => index);
  const batches = chunks(ids, 200);
  assertEquals(batches.map((batch) => batch.length), [200, 200, 1], "batch sizes");
  assertEquals(batches.flat(), ids, "all IDs retained in order");
});

Deno.test("chunks rejects invalid batch sizes", () => {
  let threw = false;
  try {
    chunks([1], 0);
  } catch {
    threw = true;
  }
  assert(threw, "zero batch size must throw");
});

for (const count of [0, 1, 499, 500, 501, 1000, 1001, 10_000]) {
  Deno.test(`collectPagedRows returns all ${count} rows exactly once`, async () => {
    const source = Array.from({ length: count }, (_, index) => index);
    const requestedRanges: Array<[number, number]> = [];
    const result = await collectPagedRows(async (from, to) => {
      requestedRanges.push([from, to]);
      return { data: source.slice(from, to + 1), error: null };
    }, 500, 10_000);

    assert(result.kind === "ok", "expected successful result");
    assertEquals(result.rows, source, "rows and order");
    assertEquals(new Set(result.rows).size, count, "no duplicate rows");
    if (count > 500) {
      assert(requestedRanges.length >= 2, "expected multiple page requests");
    }
  });
}

Deno.test("collectPagedRows stops safely when the configured maximum is exceeded", async () => {
  const result = await collectPagedRows(async (from, to) => ({
    data: Array.from({ length: to - from + 1 }, (_, index) => from + index),
    error: null,
  }), 500, 1_000);
  assertEquals(result, { kind: "too_many" }, "too many rows result");
});

Deno.test("collectPagedRows does not expose page query errors", async () => {
  const result = await collectPagedRows(async () => ({
    data: null,
    error: new Error("private database detail"),
  }), 500, 10_000);
  assertEquals(result, { kind: "query_error" }, "generic query error result");
});

Deno.test("collectPagedRows accepts exactly 10,000 rows", async () => {
  const source = Array.from({ length: 10_000 }, (_, index) => index);
  const result = await collectPagedRows(async (from, to) => ({
    data: source.slice(from, to + 1),
    error: null,
  }), 500, 10_000);
  assert(result.kind === "ok", "exactly the maximum should be accepted");
  assertEquals(result.rows.length, 10_000, "all rows returned at the limit");
});

Deno.test("collectPagedRows rejects 10,001 rows", async () => {
  const source = Array.from({ length: 10_001 }, (_, index) => index);
  const result = await collectPagedRows(async (from, to) => ({
    data: source.slice(from, to + 1),
    error: null,
  }), 500, 10_000);
  assertEquals(result, { kind: "too_many" }, "one row over the limit is rejected");
});
