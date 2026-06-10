// Sideshift adapter — the ONLY module that talks to the Sideshift API.
// Confirmed contract: docs/DECISIONS.md (topic: sideshift-api, topic: sideshift-multikey).
//
//   Base: https://app.sideshift.app/api/v1   Auth: header `x-api-key: <key>`
//   GET /programs?status=active                  → paginated programs (active only)
//   GET /programs                                → paginated programs (ALL statuses)
//   GET /creators?programId=X&limit=200          → paginated full roster + handles
//   GET /analytics/overview?programId=X&topCreatorsLimit=1000
//                                                → data.topCreators[] = lifetime totals
//
// MULTI-BRAND: each Sideshift API key is scoped to ONE company and sees only that
// company's programs (verified: the "Vo Creations" key sees only #Allinmotion +
// the archived Makon AI). To cover every brand the agency runs, set SIDESHIFT_KEYS
// to either a JSON map {"Brand":"sk_live_…"} (preferred — keeps brand labels for the
// coverage report; the Apps Script format) OR a flat comma/space/newline list. The
// single SIDESHIFT_API_KEY is still honored as a fallback. See DECISIONS
// topic: sideshift-multikey.
//
// Everything is normalized into lib/ingest/types.ts shapes; nothing outside this
// file imports Sideshift or knows its wire format.

import type {
  IngestAdapter, NormalizedProgram, NormalizedProgramData,
  NormalizedRosterEntry, NormalizedCreatorMetric, RawPayload,
} from "./types";

const PAGE_SIZE = 200;       // /creators default page is 25; ask for the max
const TOP_CREATORS_LIMIT = 1000; // > any single program's active-creator count

function baseUrl(): string {
  return (process.env.SIDESHIFT_BASE_URL || "https://app.sideshift.app/api/v1").replace(/\/+$/, "");
}

/** A brand key plus its human label (from the JSON map; null for flat-list keys). */
export interface KeyEntry {
  key: string;
  label: string | null;
}

/**
 * Every brand key to ingest. SIDESHIFT_KEYS may be:
 *   • a JSON map  {"BlackBox":"sk_live_…","Codédex":"sk_live_…"}  (preferred — labels kept)
 *   • a flat list "sk_live_…, sk_live_…"  (comma/space/newline-separated)
 * Falls back to the single SIDESHIFT_API_KEY. Deduped by key, order preserved.
 */
export function configKeys(): KeyEntry[] {
  const raw = (process.env.SIDESHIFT_KEYS || process.env.SIDESHIFT_API_KEY || "").trim();
  if (!raw) {
    throw new Error("No Sideshift API key: set SIDESHIFT_KEYS (JSON map or flat list) or SIDESHIFT_API_KEY.");
  }
  let entries: KeyEntry[] = [];
  // JSON map first (the Apps Script format) — keeps the brand label per key.
  if (raw.startsWith("{")) {
    try {
      const obj = JSON.parse(raw);
      if (obj && typeof obj === "object" && !Array.isArray(obj)) {
        entries = Object.entries(obj)
          .map(([label, key]) => ({ label: String(label), key: String(key).trim() }))
          .filter((e) => e.key);
      }
    } catch {
      // not valid JSON → fall through to the flat-list parse
    }
  }
  // Flat list fallback (also catches a JSON parse that yielded nothing usable).
  if (!entries.length) {
    entries = raw.split(/[\s,]+/).map((k) => k.trim()).filter(Boolean).map((key) => ({ key, label: null }));
  }
  if (!entries.length) {
    throw new Error("SIDESHIFT_KEYS parsed to zero keys — check the value (JSON map or flat list).");
  }
  // dedupe by key, keep the first label seen
  const seen = new Set<string>();
  return entries.filter((e) => (seen.has(e.key) ? false : (seen.add(e.key), true)));
}

/** unix seconds → Date (Sideshift timestamps are seconds, not ms). */
function fromUnix(secs: unknown): Date | null {
  return typeof secs === "number" && secs > 0 ? new Date(secs * 1000) : null;
}

type Json = Record<string, any>;

async function apiGet(path: string, apiKey: string): Promise<Json> {
  const res = await fetch(`${baseUrl()}${path}`, {
    headers: { "x-api-key": apiKey, accept: "application/json" },
    // Always hit the live API; this runs server-side in the cron, never cached.
    cache: "no-store",
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Sideshift ${path} → HTTP ${res.status}: ${text.slice(0, 200)}`);
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Sideshift ${path} → non-JSON response: ${text.slice(0, 120)}`);
  }
}

/** Walk every page of a `{data, page, totalPages}` endpoint for one key. */
async function getAllPages(
  apiKey: string,
  buildPath: (page: number) => string
): Promise<{ items: Json[]; pages: Json[] }> {
  const items: Json[] = [];
  const pages: Json[] = [];
  let page = 1;
  // Hard cap so a misbehaving API can never loop forever.
  for (; page <= 100; page++) {
    const body = await apiGet(buildPath(page), apiKey);
    pages.push(body);
    const data = Array.isArray(body.data) ? body.data : [];
    items.push(...data);
    const totalPages = Number(body.totalPages) || 1;
    if (page >= totalPages || data.length === 0) break;
  }
  return { items, pages };
}

function mapProgram(p: Json): NormalizedProgram {
  return {
    externalId: String(p.id),
    name: String(p.name ?? "Untitled program"),
    companyId: p.companyId ?? null,
    companyName: p.companyName ?? null,
    // Sideshift uses "active" for live and "archived" for ended; anything not
    // explicitly active normalizes to "ended".
    status: p.status === "active" ? "active" : "ended",
    startsAt: fromUnix(p.startsAt),
    endsAt: fromUnix(p.endsAt),
  };
}

// Which brand key each program (by externalId) was discovered under, so a later
// fetchProgramData hits the right key. Rebuilt on every listActivePrograms() call.
const programKeyByExternalId = new Map<string, string>();

/** Build a program's roster + metrics using a SPECIFIC key (the one it belongs to). */
async function fetchProgramDataWithKey(
  program: NormalizedProgram,
  apiKey: string
): Promise<NormalizedProgramData> {
  const pid = program.externalId;
  const raw: RawPayload[] = [];

  // 1. Full roster (CRM identity + per-program handles) — paginated.
  const { items: creatorItems, pages: creatorPages } = await getAllPages(
    apiKey,
    (page) => `/creators?programId=${encodeURIComponent(pid)}&page=${page}&limit=${PAGE_SIZE}`
  );
  for (const payload of creatorPages) raw.push({ endpoint: "/creators", programExternalId: pid, payload });

  const roster: NormalizedRosterEntry[] = creatorItems.map((c) => {
    // campaigns[] spans all of a creator's programs; pull THIS program's handles.
    const campaigns = Array.isArray(c.campaigns) ? c.campaigns : [];
    const here = campaigns.find((cm: Json) => String(cm.programId) === String(pid));
    const handles = Array.isArray(here?.handles) ? here.handles : [];
    const accounts = handles
      .filter((h: Json) => h?.platform && h?.handle)
      .map((h: Json) => ({
        platform: String(h.platform).toLowerCase(),
        handle: String(h.handle),
        profileImageUrl: c.profileImageUrl ?? null,
      }));
    return {
      externalId: String(c.id),
      name: String(c.name ?? "Unknown"),
      email: c.email ?? null,
      profileImageUrl: c.profileImageUrl ?? null,
      participationStatus: here?.contractStatus ? String(here.contractStatus) : "active",
      accounts,
    };
  });

  // 2. Per-creator lifetime metrics (snapshot facts) — single call, big limit.
  const overview = await apiGet(
    `/analytics/overview?programId=${encodeURIComponent(pid)}&topCreatorsLimit=${TOP_CREATORS_LIMIT}`,
    apiKey
  );
  raw.push({ endpoint: "/analytics/overview", programExternalId: pid, payload: overview });

  const topCreators: Json[] = Array.isArray(overview?.data?.topCreators) ? overview.data.topCreators : [];
  const uniqueCreators = Number(overview?.data?.summary?.uniqueCreators);
  if (Number.isFinite(uniqueCreators) && topCreators.length < uniqueCreators) {
    // The limit didn't return everyone with activity — surfaces as a warning upstream.
    throw new Error(
      `topCreators returned ${topCreators.length} but summary.uniqueCreators=${uniqueCreators} for program ${pid}`
    );
  }
  const metrics: NormalizedCreatorMetric[] = topCreators.map((t) => ({
    externalId: String(t.id),
    name: String(t.name ?? "Unknown"),
    lifetimeViews: Number(t.totalViews) || 0,
    lifetimePosts: Number(t.totalPosts) || 0,
  }));

  return { program, roster, metrics, raw };
}

export const sideshiftAdapter: IngestAdapter = {
  source: "sideshift",

  async listActivePrograms() {
    // Iterate EVERY brand key; each key only sees its own company's programs. Remember
    // which key each program came from so fetchProgramData hits the right one.
    programKeyByExternalId.clear();
    const programs: NormalizedProgram[] = [];
    const raw: RawPayload[] = [];
    for (const { key } of configKeys()) {
      const { items, pages } = await getAllPages(
        key,
        (page) => `/programs?status=active&page=${page}&limit=${PAGE_SIZE}`
      );
      for (const payload of pages) raw.push({ endpoint: "/programs", payload });
      for (const p of items) {
        const program = mapProgram(p);
        programKeyByExternalId.set(program.externalId, key);
        programs.push(program);
      }
    }
    return { programs, raw };
  },

  async fetchProgramData(program: NormalizedProgram): Promise<NormalizedProgramData> {
    // The key this program was listed under (single-key setups have just one).
    const apiKey = programKeyByExternalId.get(program.externalId) ?? configKeys()[0].key;
    return fetchProgramDataWithKey(program, apiKey);
  },
};

/** Per-brand-key coverage — how much each key returned. Surfaces a dead/empty key. */
export interface KeyCoverage {
  label: string | null;
  programs: number;
  creators: number;
  views: number;
}

/**
 * One-time / repull entrypoint: EVERY program across EVERY brand key, optionally
 * filtered by status, each with its full roster + lifetime metrics. Key handling
 * stays entirely inside this module — callers get normalized data + per-key coverage.
 *
 * Used by scripts/repull-alltime.ts to rebuild authoritative all-time totals from
 * the API (topCreators lifetime), which date-windowed CSV sums undercounted.
 */
export async function fetchAllPrograms(
  opts?: { statuses?: ("active" | "ended")[] }
): Promise<{ data: NormalizedProgramData[]; coverage: KeyCoverage[] }> {
  const want = opts?.statuses;
  const data: NormalizedProgramData[] = [];
  const coverage: KeyCoverage[] = [];
  for (const { key, label } of configKeys()) {
    // No status filter → ALL statuses (active + archived/ended).
    const { items } = await getAllPages(key, (page) => `/programs?page=${page}&limit=${PAGE_SIZE}`);
    let progs = 0, creators = 0, views = 0;
    for (const p of items) {
      const program = mapProgram(p);
      if (want && !want.includes(program.status ?? "active")) continue;
      const d = await fetchProgramDataWithKey(program, key);
      data.push(d);
      progs++; creators += d.metrics.length; views += d.metrics.reduce((s, m) => s + m.lifetimeViews, 0);
    }
    coverage.push({ label, programs: progs, creators, views });
  }
  return { data, coverage };
}
