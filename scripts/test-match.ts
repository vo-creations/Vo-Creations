// Unit tests for the repull identity matcher (lib/ingest/match.ts).
//   node --import tsx --test scripts/test-match.ts
//
// These lock the tricky cases the re-key merge must handle WITHOUT force-matching:
// "Last, First" vs "First Last", casing, whitespace, accents, and ghost/placeholder rows.

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  nameKey, nameTokenKey, isGhostName, buildNameIndex, matchName,
} from "../lib/ingest/match";

test("nameKey: casing / whitespace / Last,First all converge", () => {
  const want = "kiera parenteau";
  assert.equal(nameKey("Kiera Parenteau"), want);
  assert.equal(nameKey("  KIERA   parenteau "), want);
  assert.equal(nameKey("Parenteau, Kiera"), want);
  assert.equal(nameKey("Parenteau,Kiera"), want);
});

test("nameKey: strips accents and punctuation", () => {
  assert.equal(nameKey("Mónica Lévy-O'Brien"), "monica levy o brien");
  assert.equal(nameKey("José  Núñez"), "jose nunez");
});

test("nameTokenKey is order-insensitive", () => {
  assert.equal(nameTokenKey("Kiera Parenteau"), nameTokenKey("Parenteau Kiera"));
});

test("isGhostName flags placeholders only", () => {
  assert.equal(isGhostName("Ghost: @readingwithmandi"), true);
  assert.equal(isGhostName("@readingwithmandi"), true);
  assert.equal(isGhostName("  "), true);
  assert.equal(isGhostName("unknown"), true);
  assert.equal(isGhostName("Kiera Parenteau"), false);
});

test("matchName: unique exact → matched(exact)", () => {
  const idx = buildNameIndex([
    { id: "a", name: "Kiera Parenteau" },
    { id: "b", name: "Vincent Lei" },
  ]);
  const r = matchName("Parenteau, Kiera", idx);
  assert.deepEqual(r, { status: "matched", id: "a", name: "Kiera Parenteau", confidence: "exact" });
});

test("matchName: order-only difference → matched(reordered)", () => {
  const idx = buildNameIndex([{ id: "a", name: "Parenteau Kiera" }]);
  const r = matchName("Kiera Parenteau", idx);
  assert.equal(r.status, "matched");
  if (r.status === "matched") assert.equal(r.confidence, "reordered");
});

test("matchName: duplicate names → ambiguous (HELD, never auto-picked)", () => {
  const idx = buildNameIndex([
    { id: "a", name: "Chris Yang" },
    { id: "b", name: "Chris Yang" },
  ]);
  const r = matchName("chris yang", idx);
  assert.equal(r.status, "ambiguous");
  if (r.status === "ambiguous") assert.deepEqual(r.ids.sort(), ["a", "b"]);
});

test("matchName: no candidate → unmatched (HELD)", () => {
  const idx = buildNameIndex([{ id: "a", name: "Kiera Parenteau" }]);
  assert.equal(matchName("Someone Else", idx).status, "unmatched");
});

test("matchName: ghost query → ghost (never matched)", () => {
  const idx = buildNameIndex([{ id: "a", name: "Kiera Parenteau" }]);
  assert.equal(matchName("Ghost: @whoever", idx).status, "ghost");
});

test("buildNameIndex: ghost candidates are not match targets", () => {
  const idx = buildNameIndex([{ id: "g", name: "Ghost: @x" }]);
  assert.equal(matchName("Ghost: @x", idx).status, "ghost");
  assert.equal(idx.byKey.size, 0);
});
