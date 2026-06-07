#!/usr/bin/env node
// Seed creators.email from a CSV so creators can log in (Phase 3 magic-link auth).
//
//   node --env-file=.env.local scripts/seed-creator-emails.mjs <file.csv> [--apply]
//
// CSV needs a header row with `email` plus ONE identifier column (first match wins):
//   external_id (Sideshift userId)  |  handle  |  name
// Examples:
//   email,external_id
//   email,handle
//   email,name
//
// Dry-run by default (prints what WOULD change + anything unmatched/ambiguous).
// Pass --apply to write. Matching is case-insensitive; handle ignores a leading "@".

import { readFile } from "node:fs/promises";
import postgres from "postgres";

const [file, ...flags] = process.argv.slice(2);
const APPLY = flags.includes("--apply");
if (!file) {
  console.error("usage: node --env-file=.env.local scripts/seed-creator-emails.mjs <file.csv> [--apply]");
  process.exit(1);
}

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  return lines.slice(1).map((line) => {
    const cells = line.split(",").map((c) => c.trim());
    return Object.fromEntries(headers.map((h, i) => [h, cells[i] ?? ""]));
  });
}

const sql = postgres(process.env.POSTGRES_URL || process.env.DATABASE_URL, { prepare: false });

async function findCreator(row) {
  if (row.external_id) {
    const r = await sql`select id, name, email from creators where external_id = ${row.external_id}`;
    return r.length === 1 ? { creator: r[0], by: "external_id" } : { ambiguous: r.length > 1, by: "external_id" };
  }
  if (row.handle) {
    const h = row.handle.replace(/^@/, "");
    const r = await sql`select distinct c.id, c.name, c.email from campaign_accounts a
      join creators c on c.id = a.creator_id where lower(a.handle) = lower(${h})`;
    return r.length === 1 ? { creator: r[0], by: "handle" } : { ambiguous: r.length > 1, by: "handle" };
  }
  if (row.name) {
    const r = await sql`select id, name, email from creators where lower(name) = lower(${row.name})`;
    return r.length === 1 ? { creator: r[0], by: "name" } : { ambiguous: r.length > 1, by: "name" };
  }
  return { creator: null, by: "none" };
}

const rows = parseCsv(await readFile(file, "utf8"));
console.log(`\n  ${rows.length} rows from ${file} · mode: ${APPLY ? "APPLY" : "dry-run"}\n`);

let updated = 0;
const unmatched = [];
for (const row of rows) {
  if (!row.email) { unmatched.push({ row, reason: "no email column/value" }); continue; }
  const { creator, ambiguous, by } = await findCreator(row);
  if (!creator) {
    unmatched.push({ row, reason: ambiguous ? `ambiguous by ${by}` : `no match by ${by}` });
    continue;
  }
  const same = (creator.email || "").toLowerCase() === row.email.toLowerCase();
  console.log(`  ${same ? "=" : "→"} ${creator.name.padEnd(24)} ${creator.email || "(none)"} ${same ? "" : "⇒ " + row.email}  [${by}]`);
  if (!same && APPLY) {
    await sql`update creators set email = ${row.email}, updated_at = now() where id = ${creator.id}`;
    updated++;
  } else if (!same) {
    updated++; // would update
  }
}

console.log(`\n  ${APPLY ? "updated" : "would update"}: ${updated} · unmatched: ${unmatched.length}`);
for (const u of unmatched) console.log(`    ✗ ${JSON.stringify(u.row)} — ${u.reason}`);
if (!APPLY && updated) console.log("\n  Re-run with --apply to write.\n");
await sql.end();
