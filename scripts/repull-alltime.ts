#!/usr/bin/env node
// One-time AUTHORITATIVE all-time repull + re-key/re-anchor.  DRY-RUN by default.
//
//   node --env-file=.env.local --import tsx scripts/repull-alltime.ts [--master <csv>] [--apply]
//
// WHY: all-time totals were rebuilt by summing date-windowed per-video CSVs, which omit
// older videos/campaigns → 6–96% undercount per creator (Kiera 13.4M vs ~28.6M; Casey
// missing). The FIX is to read the SOURCE of truth — Sideshift's per-program lifetime
// `topCreators[]` — across EVERY brand key (SIDESHIFT_KEYS) and EVERY program (active AND
// archived), grouped by the stable creator uid. See docs/DECISIONS.md topic: alltime-repull.
//
// What it does (all printed in the dry-run; nothing is written without --apply):
//   1. AUTHORITATIVE all-time  = Σ topCreators.totalViews per stable uid, across all programs.
//   2. RE-KEY plan             = bridge each authoritative uid to the existing DB creator that
//      the CSV backfill created under a SYNTHETIC id ("backfill:kiera-par"). Bridge order:
//        (a) DB creator already keyed to the real uid  → nothing to do
//        (b) master roster CSV external_id == uid      → exact canonical-name row (seed-convergent)
//        (c) handle: API roster handle → campaign_accounts.creator_id
//        (d) name : API display name → DB creator via the tolerant matcher (lib/ingest/match)
//      Ghost/ambiguous/unmatched are HELD for manual review — never force-matched, never
//      auto-duplicated. Programs get the same treatment (backfill program → real id by name).
//   3. ANCHOR  = write the API total as lifetime_views at each (program,creator)'s latest
//      snapshot date, and RE-ANCHOR the backfill series (scale to that total) so the 7/30-day
//      SHAPE is preserved with the correct absolute level. Irreconcilable series are reported.
//
// Requires the real brand keys (SIDESHIFT_KEYS) to see brands beyond the single-key company,
// and the master roster CSV (active-creators-consolidated.csv, gitignored) for the (b) bridge.

import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import postgres from "postgres";
import { fetchAllPrograms, configKeys } from "../lib/ingest/sideshift";
import { buildNameIndex, matchName, isGhostName, nameKey } from "../lib/ingest/match";
import type { NormalizedProgramData } from "../lib/ingest/types";

// ── args ──────────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const APPLY = argv.includes("--apply");
const masterPath = (() => {
  const i = argv.indexOf("--master");
  return i >= 0 ? argv[i + 1] : "active-creators-consolidated.csv";
})();
const n = (x: number) => x.toLocaleString("en-US");
const pct = (a: number, b: number) => (b === 0 ? "—" : `${(((a - b) / b) * 100).toFixed(0)}%`);
const normBrand = (s: string) => (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
const normHandle = (s: string) => (s || "").toLowerCase().replace(/^@/, "").trim();

// ── tiny CSV parser (quoted fields) ─────────────────────────────────────────────
function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [], field = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else q = false; } else field += c; }
    else if (c === '"') q = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") { if (c === "\r" && text[i + 1] === "\n") i++; if (field !== "" || row.length) { row.push(field); rows.push(row); row = []; field = ""; } }
    else field += c;
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  if (!rows.length) return [];
  const headers = rows[0].map((h) => h.trim().toLowerCase());
  return rows.slice(1).map((r) => Object.fromEntries(headers.map((h, i) => [h, (r[i] ?? "").trim()])));
}

// ── connect (DIRECT — bulk mutation, like the backfill tool) ────────────────────
const conn = process.env.DATABASE_URL_DIRECT || process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL || process.env.DATABASE_URL;
const sql = postgres(conn!, { prepare: false, idle_timeout: 30, connect_timeout: 30 });

async function main() {
  console.log(`\n══ ALL-TIME REPULL ${APPLY ? "APPLY" : "DRY-RUN"} ══`);
  const keys = configKeys();
  console.log(`brand keys (SIDESHIFT_KEYS/SIDESHIFT_API_KEY): ${keys.length}${keys.some((k) => k.label) ? " (JSON map)" : " (flat list)"}`);

  // ── 1. AUTHORITATIVE all-time from the API (all keys × active+ended) ──────────
  const { data: programData, coverage } = await fetchAllPrograms({ statuses: ["active", "ended"] });
  console.log(`programs pulled: ${programData.length} (active + archived across all keys)`);
  console.log(`── PER-KEY COVERAGE (a 0-program/0-creator key = dead or wrong key) ──`);
  for (const c of coverage) {
    console.log(`    ${(c.label ?? "(unlabeled)").padEnd(22)} programs ${String(c.programs).padStart(3)} · creators ${String(c.creators).padStart(4)} · views ${n(c.views).padStart(14)}`);
  }

  type Authoritative = { uid: string; name: string; views: number; posts: number; programs: { ext: string; name: string; views: number; posts: number }[] };
  const byUid = new Map<string, Authoritative>();
  // uid → handles seen on the API roster (for the handle bridge)
  const handlesByUid = new Map<string, Set<string>>();
  for (const d of programData) {
    for (const m of d.metrics) {
      const a = byUid.get(m.externalId) ?? { uid: m.externalId, name: m.name, views: 0, posts: 0, programs: [] };
      a.views += m.lifetimeViews; a.posts += m.lifetimePosts;
      a.programs.push({ ext: d.program.externalId, name: d.program.name, views: m.lifetimeViews, posts: m.lifetimePosts });
      byUid.set(m.externalId, a);
    }
    for (const r of d.roster) {
      const set = handlesByUid.get(r.externalId) ?? new Set<string>();
      for (const acc of r.accounts) set.add(normHandle(acc.handle));
      handlesByUid.set(r.externalId, set);
    }
  }
  const authoritative = Array.from(byUid.values()).sort((x, y) => y.views - x.views);
  if (!authoritative.length) {
    console.log("\n⚠ No creators returned by the API. With only the single Vo Creations key this is expected for");
    console.log("  brands other than Allinmotion — set SIDESHIFT_KEYS to every brand key and re-run.\n");
  }

  // ── 2. DB current state ───────────────────────────────────────────────────────
  const dbCreators = await sql<{ id: string; source: string; external_id: string; name: string }[]>`
    select id, source, external_id, name from creators`;
  const dbAccounts = await sql<{ creator_id: string; handle: string }[]>`select creator_id, handle from campaign_accounts`;
  const dbProgs = await sql<{ id: string; source: string; external_id: string; name: string; company_name: string | null }[]>`
    select id, source, external_id, name, company_name from programs`;

  const creatorByExternal = new Map(dbCreators.map((c) => [c.external_id, c]));
  const creatorIndex = buildNameIndex(dbCreators.map((c) => ({ id: c.id, name: c.name })));
  const handleToCreator = new Map<string, string>();
  for (const a of dbAccounts) handleToCreator.set(normHandle(a.handle), a.creator_id);
  const creatorById = new Map(dbCreators.map((c) => [c.id, c]));

  // current DB all-time per creator (mirrors lib/queries/leaderboard allTimeBoard)
  const dbAllTimeRows = await sql<{ creator_id: string; views: string }[]>`
    with latest_pc as (
      select distinct on (s.program_id, s.creator_id) s.program_id, s.creator_id, s.lifetime_views v
      from snapshots s order by s.program_id, s.creator_id, s.snapshot_date desc)
    select creator_id, sum(v)::bigint views from latest_pc group by creator_id`;
  const dbViewsByCreator = new Map(dbAllTimeRows.map((r) => [r.creator_id, Number(r.views)]));

  // ── master roster CSV (bridge b): canonical name + real uid (+ handles) ───────
  let masterByUid = new Map<string, { name: string }>();
  let masterUidByNameKey = new Map<string, string>();
  if (existsSync(masterPath)) {
    const master = parseCsv(await readFile(masterPath, "utf8"));
    for (const m of master) {
      const uid = (m.external_id || m.externalid || m.userid || "").trim();
      const nm = (m.name || "").trim();
      if (uid && nm) { masterByUid.set(uid, { name: nm }); masterUidByNameKey.set(nameKey(nm), uid); }
    }
    console.log(`master roster: ${master.length} rows, ${masterByUid.size} with a real uid (${masterPath})`);
  } else {
    console.log(`master roster: NOT FOUND at ${masterPath} — bridge (b) disabled, using handle/name only.`);
  }

  // ── 3. RE-KEY plan per authoritative uid ──────────────────────────────────────
  type Plan = {
    a: Authoritative;
    targetId: string | null;     // DB creator to re-key/anchor onto
    via: "already" | "master-uid" | "handle" | "name" | null;
    confidence: string;
    held?: "ghost" | "ambiguous" | "unmatched" | "merge-conflict";
    note?: string;
  };
  const plans: Plan[] = [];
  for (const a of authoritative) {
    if (isGhostName(a.name)) { plans.push({ a, targetId: null, via: null, confidence: "-", held: "ghost" }); continue; }

    // (a) DB row already keyed to this real uid
    const already = creatorByExternal.get(a.uid);
    if (already) { plans.push({ a, targetId: already.id, via: "already", confidence: "exact" }); continue; }

    // (b) master roster uid → canonical name → DB creator (seed-convergent)
    const masterHit = masterByUid.get(a.uid);
    if (masterHit) {
      const m = matchName(masterHit.name, creatorIndex);
      if (m.status === "matched") { plans.push({ a, targetId: m.id, via: "master-uid", confidence: m.confidence, note: `master:"${masterHit.name}"` }); continue; }
    }

    // (c) handle bridge: any API handle for this uid → existing creator
    const handleHit = Array.from(handlesByUid.get(a.uid) ?? []).map((h) => handleToCreator.get(h)).find(Boolean);
    if (handleHit) { plans.push({ a, targetId: handleHit, via: "handle", confidence: "handle" }); continue; }

    // (d) tolerant name match on the API display name
    const m = matchName(a.name, creatorIndex);
    if (m.status === "matched") { plans.push({ a, targetId: m.id, via: "name", confidence: m.confidence }); continue; }
    if (m.status === "ambiguous") { plans.push({ a, targetId: null, via: null, confidence: "-", held: "ambiguous", note: `${m.ids.length} rows share this name` }); continue; }
    plans.push({ a, targetId: null, via: null, confidence: "-", held: "unmatched" });
  }

  // detect merge-conflicts: a re-key target whose CURRENT external_id is a DIFFERENT real uid
  // (would mean two real humans collapsing) — hold it.
  for (const p of plans) {
    if (p.targetId && p.via && p.via !== "already") {
      const cur = creatorById.get(p.targetId)!;
      if (cur.source === "sideshift" && cur.external_id !== p.a.uid && !cur.external_id.startsWith("backfill:")) {
        p.held = "merge-conflict"; p.note = `target already keyed to ${cur.external_id}`;
      }
    }
  }

  // ── REPORT: re-key plan ───────────────────────────────────────────────────────
  const reKeys = plans.filter((p) => p.targetId && p.via !== "already" && !p.held);
  const already = plans.filter((p) => p.via === "already");
  const held = plans.filter((p) => p.held);
  console.log(`\n── RE-KEY PLAN (${authoritative.length} authoritative creators) ──`);
  console.log(`  already keyed to real uid : ${already.length}`);
  console.log(`  WOULD re-key (synthetic → real uid): ${reKeys.length}`);
  for (const p of reKeys.slice(0, 60)) {
    const cur = creatorById.get(p.targetId!)!;
    console.log(`    ${p.a.name.padEnd(26)} ${cur.external_id.padEnd(20)} → ${p.a.uid}   [${p.via}/${p.confidence}]${p.note ? " " + p.note : ""}`);
  }
  if (held.length) {
    console.log(`\n  ⚠ HELD for manual review (${held.length}) — NOT re-keyed, NOT created:`);
    for (const grp of ["unmatched", "ambiguous", "merge-conflict", "ghost"] as const) {
      const g = held.filter((p) => p.held === grp);
      if (g.length) {
        console.log(`    ${grp} (${g.length}): ${g.slice(0, 40).map((p) => `${p.a.name} [${n(p.a.views)}v]${p.note ? " (" + p.note + ")" : ""}`).join("  |  ")}${g.length > 40 ? " …" : ""}`);
      }
    }
  }

  // ── REPORT: per-creator OLD vs API-NEW (the brief's verification table) ────────
  console.log(`\n── ALL-TIME: OLD (DB) vs NEW (API) — top 40 by API total ──`);
  console.log(`  creator                       API-new          DB-old        Δ%   via`);
  for (const p of plans.slice(0, 40)) {
    const apiV = p.a.views;
    const dbV = p.targetId ? (dbViewsByCreator.get(p.targetId) ?? 0) : 0;
    const tag = p.held ? `HELD:${p.held}` : (p.via ?? "");
    console.log(`  ${p.a.name.padEnd(26)} ${n(apiV).padStart(14)} ${n(dbV).padStart(14)}  ${pct(apiV, dbV).padStart(6)}   ${tag}`);
  }
  // spot-check helper
  for (const needle of ["kiera", "casey"]) {
    const hit = authoritative.filter((a) => a.name.toLowerCase().includes(needle));
    console.log(`  spot-check "${needle}": ${hit.map((a) => `${a.name}=${n(a.views)} (${a.programs.length} progs)`).join("; ") || "NOT IN API RESULT (need that brand's key)"}`);
  }

  // ── REPORT: program reconciliation ────────────────────────────────────────────
  // Map each API program to its existing DB home: the live sideshift row (already anchored),
  // or a backfill row to re-key (matched by brand name, BIDIRECTIONAL contains like the
  // backfill tool), or a genuinely new program. The matched DB program id is the anchor home.
  const apiProgs = Array.from(new Map(programData.map((d) => [d.program.externalId, d.program])).values());
  const backfillProgs = dbProgs.filter((p) => p.source === "backfill");
  const matchBackfillProg = (name: string, company: string | null) => {
    const targets = [normBrand(name), normBrand(company || "")].filter(Boolean);
    return backfillProgs.find((p) => {
      const cands = [normBrand(p.name), normBrand(p.company_name || "")].filter(Boolean);
      return cands.some((c) => targets.some((t) => c === t || c.includes(t) || t.includes(c)));
    });
  };
  // API program externalId → DB program id we will anchor onto (live row or matched backfill row)
  const anchorProgramId = new Map<string, string>();
  // backfill program rows to re-key to their real id (identity unification, --apply)
  const programReKeys: { backfillId: string; backfillName: string; realExt: string; status: string }[] = [];
  console.log(`\n── PROGRAM RECONCILIATION (${apiProgs.length} API programs) ──`);
  for (const ap of apiProgs) {
    const live = dbProgs.find((p) => p.source === "sideshift" && p.external_id === ap.externalId);
    const bf = live ? null : matchBackfillProg(ap.name, ap.companyName ?? null);
    if (live) anchorProgramId.set(ap.externalId, live.id);
    else if (bf) { anchorProgramId.set(ap.externalId, bf.id); programReKeys.push({ backfillId: bf.id, backfillName: bf.name, realExt: ap.externalId, status: ap.status ?? "ended" }); }
    const verdict = live ? "live (sideshift) — anchor in place" : bf ? `re-key backfill "${bf.name}" → ${ap.externalId}` : "NEW program (no backfill history → create on apply)";
    console.log(`    ${ap.name.padEnd(34)} [${ap.status}]  ${verdict}`);
  }

  // ── REPORT: re-anchor + CONFIDENCE GUARD (#5) ─────────────────────────────────
  // All-time always anchors to the API total. The 7/30-day WINDOW is treated by capture:
  //   capture% = current backfill latest / API all-time for that (program, creator).
  //   • capture ≥ 70%  → ADDITIVE SHIFT: add (API − current) to every snapshot, so the latest
  //       equals the API total and the REAL recent deltas are preserved (not inflated).
  //   • capture < 70%  → WARMING-UP: anchor all-time only; DO NOT show a scaled window — scaling
  //       a 0.3%-captured creator's deltas 100×+ is fake precision. The window stays warming-up
  //       until the live multi-key cron has accumulated real daily snapshots (self-resolving).
  //   • no backfill series → anchor only (nothing to shift). latest==0 → irreconcilable.
  // The window suppression is enforced at render time by the query layer's confidence guard
  // (see docs/DECISIONS topic: alltime-repull); the repull records which (program,creator) are
  // low-confidence so the board shows them as warming-up rather than fake-precise.
  const CAPTURE_MIN = 0.7;
  const latestPC = await sql<{ program_id: string; creator_id: string; v: string }[]>`
    select distinct on (program_id, creator_id) program_id, creator_id, lifetime_views v
    from snapshots order by program_id, creator_id, snapshot_date desc`;
  const latestByPC = new Map(latestPC.map((r) => [`${r.program_id}|${r.creator_id}`, Number(r.v)]));
  const progDates = await sql<{ program_id: string; d: string }[]>`select program_id, max(snapshot_date)::text d from snapshots group by program_id`;
  const anchorDateByProg = new Map(progDates.map((r) => [r.program_id, r.d]));
  const today = new Date().toISOString().slice(0, 10);
  // Held plans (ghost/ambiguous/unmatched set targetId=null; merge-conflict keeps a targetId
  // but MUST NOT be anchored — that target belongs to a different real uid) never anchor.
  const targetByUid = new Map(plans.filter((p) => p.targetId && !p.held).map((p) => [p.a.uid, p.targetId!]));

  type Method = "additive-shift" | "warming-up" | "no-series";
  type Anchor = {
    programId: string; creatorId: string; name: string; program: string;
    apiViews: number; apiPosts: number; current: number | null; anchorDate: string;
    capture: number | null; method: Method;
  };
  const anchorPlan: Anchor[] = [];
  const irreconcilable: string[] = [];
  for (const d of programData) {
    const progId = anchorProgramId.get(d.program.externalId);
    if (!progId) continue;
    for (const m of d.metrics) {
      const cid = targetByUid.get(m.externalId);
      if (!cid) continue; // held creators don't get anchored
      const cur = latestByPC.get(`${progId}|${cid}`) ?? null;
      const apiTotal = m.lifetimeViews;
      if (cur === 0 && apiTotal > 0) { irreconcilable.push(`${m.name} / ${d.program.name} (latest=0, API=${n(apiTotal)})`); continue; }
      const capture = cur === null || apiTotal === 0 ? null : cur / apiTotal;
      const method: Method = cur === null ? "no-series" : (capture !== null && capture >= CAPTURE_MIN ? "additive-shift" : "warming-up");
      anchorPlan.push({ programId: progId, creatorId: cid, name: m.name, program: d.program.name, apiViews: apiTotal, apiPosts: m.lifetimePosts, current: cur, anchorDate: anchorDateByProg.get(progId) ?? today, capture, method });
    }
  }
  const byMethod = (mm: Method) => anchorPlan.filter((a) => a.method === mm);
  console.log(`\n── RE-ANCHOR + CONFIDENCE GUARD (${anchorPlan.length} program-creator series, capture ≥ ${CAPTURE_MIN * 100}% keeps its window) ──`);
  console.log(`  additive-shift (well-captured window kept): ${byMethod("additive-shift").length} · warming-up (window suppressed): ${byMethod("warming-up").length} · anchor-only (no series): ${byMethod("no-series").length}`);
  console.log(`  creator                       program                      capture   method      all-time→`);
  for (const a of anchorPlan.slice(0, 40)) {
    const capStr = a.capture === null ? "  n/a" : `${(a.capture * 100).toFixed(0)}%`;
    console.log(`  ${a.name.slice(0, 26).padEnd(26)} ${a.program.slice(0, 26).padEnd(26)} ${capStr.padStart(6)}   ${a.method.padEnd(14)} ${n(a.apiViews)}`);
  }
  if (anchorPlan.length > 40) console.log(`    …and ${anchorPlan.length - 40} more`);
  const warming = byMethod("warming-up");
  if (warming.length) console.log(`  ⚠ WINDOW → WARMING-UP (low capture, all-time still anchored): ${warming.slice(0, 25).map((a) => `${a.name} (${a.capture !== null ? (a.capture * 100).toFixed(0) + "%" : "n/a"})`).join(", ")}${warming.length > 25 ? " …" : ""}`);
  if (irreconcilable.length) console.log(`  ⚠ IRRECONCILABLE (latest=0, can't reconcile — manual review): ${irreconcilable.slice(0, 20).join("; ")}${irreconcilable.length > 20 ? " …" : ""}`);

  const ANCHOR = argv.includes("--anchor");
  if (!APPLY) {
    console.log(`\nDRY-RUN only. Review the re-key plan + held list above, then:`);
    console.log(`  --apply           re-key creators + programs to their real ids (identity unification only)`);
    console.log(`  --apply --anchor  ALSO anchor all-time to API totals; additive-shift well-captured windows;`);
    console.log(`                    low-capture creators' all-time is anchored, their WINDOW → live-only (warming-up)`);
    console.log(`(With only the single key present, expect Allinmotion already-keyed and brands like BlackBox/Codédex absent.)\n`);
    await sql.end();
    return;
  }

  // ── APPLY ─────────────────────────────────────────────────────────────────────
  // Guard: refuse to apply if nothing reconciles (e.g. run with the single key by mistake,
  // which would no-op anyway, or a misconfigured key set that returned nothing).
  if (!reKeys.length && !already.length) { console.log("\n✖ Nothing to apply (no authoritative creators resolved). Aborting.\n"); await sql.end(); return; }

  let reKeyedCreators = 0, reKeyedPrograms = 0, anchorsWritten = 0, reshapedRows = 0, lowConfMarked = 0;
  await sql.begin(async (tx) => {
    // 1. creator identity → real uid (only confident, conflict-free matches; held are skipped)
    for (const p of reKeys) {
      if (!p.targetId) continue;
      const res = await tx`update creators set external_id = ${p.a.uid}, source = 'sideshift', updated_at = now()
        where id = ${p.targetId} and external_id <> ${p.a.uid}`;
      reKeyedCreators += res.count ?? 0;
    }
    // 2. program identity → real id (so the daily sync's (source,external_id) upsert lands here)
    for (const pr of programReKeys) {
      const res = await tx`update programs set external_id = ${pr.realExt}, source = 'sideshift', status = ${pr.status}
        where id = ${pr.backfillId} and not exists (select 1 from programs p2 where p2.source='sideshift' and p2.external_id=${pr.realExt})`;
      reKeyedPrograms += res.count ?? 0;
    }
    // 3. anchor + reshape (ONLY with --anchor). All-time ALWAYS anchors to the API total; the
    //    WINDOW is gated by capture (see RE-ANCHOR + CONFIDENCE GUARD above), now that the
    //    query-layer window-confidence guard ships in this change (DECISIONS topic: alltime-repull):
    //      • additive-shift (≥70%): add (API − current) to every non-live snapshot → latest == API
    //        total AND the real recent 7/30-day deltas are preserved (not inflated).
    //      • warming-up (<70%): write the all-time anchor (source='anchor', excluded from windows)
    //        AND set program_creators.window_confident=false, so deltaBoard sources this pair's
    //        window from LIVE rows only — warming-up until the cron accumulates real dailies. No
    //        backfill→anchor jump; all-time still corrected.
    //      • no-series: anchor only (no backfill to shift; window stays empty until live data).
    if (ANCHOR) {
      for (const an of anchorPlan) {
        if (an.method === "additive-shift" && an.current !== null && an.current !== an.apiViews) {
          const delta = an.apiViews - an.current; // additive: preserves every existing delta
          const r = await tx`update snapshots set lifetime_views = lifetime_views + ${delta}
            where program_id = ${an.programId} and creator_id = ${an.creatorId}
              and source is distinct from 'live' and source is distinct from 'anchor'`;
          reshapedRows += r.count ?? 0;
          // additive shift makes the latest backfill row == API total; no separate anchor row.
          continue;
        }
        // warming-up + no-series: write the all-time anchor row (source='anchor' → all-time only).
        await tx`insert into snapshots (snapshot_date, program_id, creator_id, lifetime_views, lifetime_posts, source, captured_at)
          values (${an.anchorDate}, ${an.programId}, ${an.creatorId}, ${an.apiViews}, ${an.apiPosts}, 'anchor', now())
          on conflict (snapshot_date, program_id, creator_id)
          do update set lifetime_views = ${an.apiViews}, lifetime_posts = ${an.apiPosts}, source = 'anchor', captured_at = now()`;
        anchorsWritten++;
        if (an.method === "warming-up") {
          // suppress this pair's window from unreliable backfill → live-only until the cron fills in.
          await tx`insert into program_creators (program_id, creator_id, status, window_confident)
            values (${an.programId}, ${an.creatorId}, 'active', false)
            on conflict (program_id, creator_id) do update set window_confident = false`;
          lowConfMarked++;
        }
      }
    }
    await tx`insert into sync_runs (source, finished_at, status, programs_synced, rows_written, warnings)
      values ('repull-alltime', now(), 'ok', ${anchorProgramId.size}, ${anchorsWritten},
        ${sql.json({ reKeyedCreators, reKeyedPrograms, anchorsWritten, reshapedRows, lowConfMarked, anchored: ANCHOR, irreconcilable })})`;
  });
  console.log(`\ndone: creators re-keyed ${reKeyedCreators}, programs re-keyed ${reKeyedPrograms}, anchors ${anchorsWritten}, additive-shifted ${reshapedRows}, warming-up(window→live-only) ${lowConfMarked}${ANCHOR ? "" : " (run with --anchor to write anchors)"}.`);
  await sql.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
