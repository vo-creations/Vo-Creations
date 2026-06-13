// Identity matching for the one-time all-time repull (scripts/repull-alltime.ts).
//
// The backfill created creator rows with SYNTHETIC external_ids ("backfill:kiera-par")
// under the master roster's CANONICAL name. The authoritative API repull keys on the
// REAL Sideshift uid (a Firebase uid). To re-key a backfill row to its real uid we must
// bridge two name spaces (API display name ↔ master canonical name) tolerantly, WITHOUT
// ever force-matching: anything not a confident, unique match is HELD for manual review.
//
// Pure + dependency-free so it is unit-tested in isolation (scripts/test-match.ts).
// Decisions: docs/DECISIONS.md topic: alltime-repull.

/** Strip accents/diacritics and lowercase. "Móñica" → "monica". */
function deburr(s: string): string {
  return s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/**
 * Ghost / placeholder rows are NOT real people and must never be matched or
 * auto-duplicated. The backfill tags them `Ghost: @handle`; we also treat a bare
 * "@handle", an empty string, or a literal "unknown" as a ghost.
 */
export function isGhostName(raw: string | null | undefined): boolean {
  const s = (raw ?? "").trim().toLowerCase();
  if (!s) return true;
  if (s.startsWith("ghost:") || s === "ghost") return true;
  if (s.startsWith("@")) return true;            // handle-only placeholder
  if (s === "unknown" || s === "unknown creator") return true;
  return false;
}

/** "Last, First" → "First Last" (only when it's a clean two-part comma name). */
function reorderComma(s: string): string {
  const parts = s.split(",");
  if (parts.length === 2 && parts[0].trim() && parts[1].trim()) {
    return `${parts[1].trim()} ${parts[0].trim()}`;
  }
  return s;
}

/**
 * Primary comparable key: order-PRESERVING, tolerant to case / accents / extra
 * whitespace / punctuation, with "Last, First" reordered to "First Last".
 *   "  Kiera   Parenteau " → "kiera parenteau"
 *   "Parenteau, Kiera"     → "kiera parenteau"
 */
export function nameKey(raw: string | null | undefined): string {
  const reordered = reorderComma((raw ?? "").trim());
  return deburr(reordered).replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
}

/**
 * Order-INSENSITIVE key (alphabetically sorted tokens) — only used as a
 * lower-confidence fallback, because a different name order is a weaker signal.
 *   "Kiera Parenteau" and "Parenteau Kiera" → "kiera parenteau"
 */
export function nameTokenKey(raw: string | null | undefined): string {
  return nameKey(raw).split(" ").filter(Boolean).sort().join(" ");
}

export interface Candidate {
  id: string;
  name: string;
}

export type MatchConfidence = "exact" | "reordered";

export type MatchResult =
  | { status: "ghost" }
  | { status: "matched"; id: string; name: string; confidence: MatchConfidence }
  | { status: "ambiguous"; via: "exact" | "reordered"; ids: string[] }
  | { status: "unmatched" };

/** Build reusable indexes over a candidate set (the existing creator rows). */
export function buildNameIndex(candidates: Candidate[]) {
  const byKey = new Map<string, Candidate[]>();
  const byToken = new Map<string, Candidate[]>();
  for (const c of candidates) {
    if (isGhostName(c.name)) continue; // a ghost candidate can never be a match target
    const k = nameKey(c.name);
    const t = nameTokenKey(c.name);
    if (k) (byKey.get(k) ?? byKey.set(k, []).get(k)!).push(c);
    if (t) (byToken.get(t) ?? byToken.set(t, []).get(t)!).push(c);
  }
  return { byKey, byToken };
}

/**
 * Match a query name against the candidate index. Returns a confident, UNIQUE match
 * (`exact` order-preserving first, then `reordered` token-order fallback) or one of
 * the non-actionable states (`ghost` / `ambiguous` / `unmatched`) which the caller
 * MUST hold for manual review — never overwrite an id on a non-`matched` result.
 */
export function matchName(
  query: string | null | undefined,
  index: ReturnType<typeof buildNameIndex>
): MatchResult {
  if (isGhostName(query)) return { status: "ghost" };

  const k = nameKey(query);
  const exact = index.byKey.get(k) ?? [];
  if (exact.length === 1) return { status: "matched", id: exact[0].id, name: exact[0].name, confidence: "exact" };
  if (exact.length > 1) return { status: "ambiguous", via: "exact", ids: exact.map((c) => c.id) };

  const t = nameTokenKey(query);
  const tok = index.byToken.get(t) ?? [];
  if (tok.length === 1) return { status: "matched", id: tok[0].id, name: tok[0].name, confidence: "reordered" };
  if (tok.length > 1) return { status: "ambiguous", via: "reordered", ids: tok.map((c) => c.id) };

  return { status: "unmatched" };
}
