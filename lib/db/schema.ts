// Creator Data Platform — canonical schema (Drizzle ORM, Postgres)
// Foundation for: CRM, leaderboard, UGC Trackr, future products.
//
// Core idea: each creator has a STABLE, unique Sideshift profile (userId) that
// persists across campaigns. They get invited to a campaign and add social
// accounts (handles) per campaign. Because the profile is stable, all of a
// creator's accounts auto-link to one human — no manual matching.
// Sideshift aggregates a creator's per-campaign handles into ONE view total per
// campaign, so snapshots are keyed at (creator + campaign), not per-account.
// campaign_accounts stays as a descriptive registry of "which handles, which campaign".

import {
  pgTable, text, uuid, integer, bigint, boolean, date, timestamp, jsonb,
  primaryKey, uniqueIndex, index,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// 1. CRM — the stable human. Agency-maintained, not from Sideshift.
// ---------------------------------------------------------------------------
export const creators = pgTable("creators", {
  id: uuid("id").defaultRandom().primaryKey(),
  source: text("source").notNull().default("sideshift"),
  externalId: text("external_id").notNull(),   // STABLE Sideshift userId — the auto-link key
  name: text("name").notNull(),
  portfolioUrl: text("portfolio_url"),
  bio: text("bio"),                       // "a little about the person"
  email: text("email"),
  altEmail: text("alt_email"),            // secondary login email (login-eligible — see DECISIONS leaderboard-access)
  notes: text("notes"),                   // free-form agency notes
  status: text("status").notNull().default("active"), // active | inactive
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  uxExternal: uniqueIndex("ux_creators_source_external").on(t.source, t.externalId),
}));

// ---------------------------------------------------------------------------
// 2. Programs — the campaigns (one per brand engagement).
// ---------------------------------------------------------------------------
export const programs = pgTable("programs", {
  id: uuid("id").defaultRandom().primaryKey(),
  externalId: text("external_id").notNull(),   // Sideshift program id
  source: text("source").notNull().default("sideshift"),
  name: text("name").notNull(),
  companyId: text("company_id"),
  companyName: text("company_name"),           // the brand
  // Brand grouping that links a brand's per-BRAND backfill program to its per-TIER live
  // programs (the source key label, e.g. "aonic"). allTimeBoard dedups a brand's backfill/
  // anchor row against the live tiers by this key — one source per (brand_key, creator). Set
  // by the all-time repull; nullable (no-op on un-keyed programs). See DECISIONS alltime-repull.
  brandKey: text("brand_key"),
  status: text("status").notNull().default("active"), // active | ended
  startsAt: timestamp("starts_at", { withTimezone: true }),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  uxSourceExternal: uniqueIndex("ux_programs_source_external").on(t.source, t.externalId),
}));

// ---------------------------------------------------------------------------
// 3. Participation — this human is ON this campaign (CRM intent).
//    Separate from accounts: you can assign a creator to a campaign
//    before any handle/account exists, and track role/status here.
// ---------------------------------------------------------------------------
export const programCreators = pgTable("program_creators", {
  programId: uuid("program_id").notNull().references(() => programs.id),
  creatorId: uuid("creator_id").notNull().references(() => creators.id),
  role: text("role"),                          // e.g. lead, contributor
  status: text("status").notNull().default("active"),
  // null/true = trust this pair's backfill for 7/30d windows; false = low-capture (the CSV
  // backfill caught < ~70% of the API all-time) → deltaBoard sources the window from LIVE
  // snapshots only, so it reads "warming up" until the cron fills in. See DECISIONS
  // topic: alltime-repull. (Additive, nullable — no-op on existing rows.)
  windowConfident: boolean("window_confident"),
  joinedAt: timestamp("joined_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.programId, t.creatorId] }),
  byCreator: index("ix_progcreators_creator").on(t.creatorId),
}));

// ---------------------------------------------------------------------------
// 4. Campaign accounts — the social handle(s) a creator adds for a specific
//    campaign. Descriptive registry ("which handles, which campaign"), NOT the
//    snapshot key. A creator can have several per campaign (one per platform /
//    multiple new accounts). creatorId is NOT NULL: it auto-links via the
//    creator's stable Sideshift profile, so there is no manual matching step.
// ---------------------------------------------------------------------------
export const campaignAccounts = pgTable("campaign_accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  programId: uuid("program_id").notNull().references(() => programs.id),
  creatorId: uuid("creator_id").notNull().references(() => creators.id),
  platform: text("platform").notNull(),                // tiktok | instagram | youtube
  handle: text("handle").notNull(),                    // the handle added for this campaign
  profileImageUrl: text("profile_image_url"),
  active: boolean("active").notNull().default(true),
  firstSeenAt: timestamp("first_seen_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  // one row per (program, creator, platform, handle)
  uxHandle: uniqueIndex("ux_account_program_creator_handle").on(t.programId, t.creatorId, t.platform, t.handle),
  byCreator: index("ix_accounts_creator").on(t.creatorId),
  byProgram: index("ix_accounts_program").on(t.programId),
}));

// ---------------------------------------------------------------------------
// 5. Raw landing — immutable source payloads. Never mutate/delete.
//    Lets you reprocess history and trace any number to its origin.
// ---------------------------------------------------------------------------
export const rawIngest = pgTable("raw_ingest", {
  id: uuid("id").defaultRandom().primaryKey(),
  source: text("source").notNull(),
  endpoint: text("endpoint").notNull(),        // e.g. /analytics/overview
  programExternalId: text("program_external_id"),
  fetchedAt: timestamp("fetched_at", { withTimezone: true }).defaultNow().notNull(),
  payload: jsonb("payload").notNull(),
}, (t) => ({
  byFetched: index("ix_raw_fetched").on(t.fetchedAt),
}));

// ---------------------------------------------------------------------------
// 6. Snapshots — append-only daily facts, keyed to (creator + campaign).
//    Sideshift already aggregates a creator's per-campaign handles into one
//    view total per campaign, so this is the natural grain.
//    Every leaderboard window is a subtraction between two rows here.
//    Stored as lifetime totals (immune to month/cycle rollover).
// ---------------------------------------------------------------------------
export const snapshots = pgTable("snapshots", {
  snapshotDate: date("snapshot_date").notNull(),
  programId: uuid("program_id").notNull().references(() => programs.id),
  creatorId: uuid("creator_id").notNull().references(() => creators.id),
  lifetimeViews: bigint("lifetime_views", { mode: "number" }).notNull(),
  lifetimePosts: integer("lifetime_posts").notNull().default(0),
  // Provenance: 'live' (daily cron) | 'backfill' (CSV) | 'anchor' (all-time repull) | null
  // (legacy). 'anchor' rows are ALL-TIME only — deltaBoard excludes them from windows so a
  // re-anchor can't create a bogus jump. See DECISIONS topic: alltime-repull. (Nullable.)
  source: text("source"),
  capturedAt: timestamp("captured_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.snapshotDate, t.programId, t.creatorId] }),
  byCreatorDate: index("ix_snapshots_creator_date").on(t.creatorId, t.snapshotDate),
  byProgramDate: index("ix_snapshots_program_date").on(t.programId, t.snapshotDate),
}));

// ---------------------------------------------------------------------------
// 7. Creator aliases — secondary REAL Sideshift uid → the canonical creator row.
//    When ONE human ends up with two real uids (a repurposed handle reused across
//    campaigns by the same person), we merge the secondary into the canonical AND record
//    the alias here. `upsertCreator` (lib/ingest/sync.ts) consults this FIRST, so a future
//    sync that still sees the secondary uid in topCreators routes to the canonical row
//    instead of re-creating a duplicate — the merge stays permanent. See DECISIONS
//    topic: alltime-repull. (Synthetic backfill→real merges need no alias: the cron never
//    emits a `backfill:` id.)
// ---------------------------------------------------------------------------
export const creatorAliases = pgTable("creator_aliases", {
  source: text("source").notNull().default("sideshift"),
  aliasExternalId: text("alias_external_id").notNull(),  // a secondary real uid that routes away
  canonicalCreatorId: uuid("canonical_creator_id").notNull().references(() => creators.id),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.source, t.aliasExternalId] }),
  byCanonical: index("ix_aliases_canonical").on(t.canonicalCreatorId),
}));

// ---------------------------------------------------------------------------
// 8. Sync runs — observability. One row per pipeline execution.
// ---------------------------------------------------------------------------
export const syncRuns = pgTable("sync_runs", {
  id: uuid("id").defaultRandom().primaryKey(),
  source: text("source").notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }).defaultNow().notNull(),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
  status: text("status").notNull().default("running"), // running | ok | error
  programsSynced: integer("programs_synced").default(0),
  rowsWritten: integer("rows_written").default(0),
  warnings: jsonb("warnings"),   // e.g. accounts whose views decreased (data-quality flag)
  error: text("error"),
});

// Derivations (live in lib/queries, NOT here):
//   per-campaign board   = snapshots WHERE programId = X, window subtraction per creator
//   overall agency board = sum a creator's snapshots across all programs (auto-linked by stable userId)
//   "who used which handle on which campaign" = campaignAccounts grouped by creatorId
