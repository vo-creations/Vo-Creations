// The swappable ingest seam.
//
// Every data source (Sideshift today; Phyllo/Shortimize/etc. later) implements
// IngestAdapter. The pipeline (lib/ingest/sync.ts) only ever talks to this
// interface — it never imports a vendor SDK. Add a source = add an adapter that
// returns these normalized shapes; nothing downstream changes. That is the
// "prove the seam" promise of Phase 6.
//
// These types are derived from the canonical schema (lib/db/schema.ts), NOT from
// any vendor's wire format. A vendor's raw payload is normalized INTO these.

/** A campaign as the source sees it. Upserts into `programs`. */
export interface NormalizedProgram {
  externalId: string;            // the source's program id
  name: string;
  companyId?: string | null;
  companyName?: string | null;   // the brand
  status?: "active" | "ended";
  startsAt?: Date | null;
  endsAt?: Date | null;
}

/** One social handle a creator used on a campaign. Upserts into `campaign_accounts`. */
export interface NormalizedAccount {
  platform: string;              // tiktok | instagram | youtube | ...
  handle: string;
  profileImageUrl?: string | null;
}

/**
 * One creator's aggregated standing on ONE campaign — the natural snapshot grain.
 * externalId is the STABLE source userId that auto-links all of a creator's
 * accounts to one human (creators.external_id). lifetimeViews/Posts are the
 * immutable lifetime totals captured for today's snapshot.
 */
export interface NormalizedCreatorOnProgram {
  externalId: string;            // stable source userId — the auto-link key
  name: string;
  profileImageUrl?: string | null;
  lifetimeViews: number;
  lifetimePosts: number;
  accounts: NormalizedAccount[]; // the handles this creator used on THIS campaign
}

/** Everything one source knows about one campaign, plus the raw payload to land. */
export interface NormalizedProgramData {
  program: NormalizedProgram;
  creators: NormalizedCreatorOnProgram[];
  /** The verbatim source response(s), written immutably to raw_ingest. */
  raw: { endpoint: string; payload: unknown }[];
}

export interface IngestAdapter {
  /** Stable source key, e.g. "sideshift". Written to every row's `source`. */
  readonly source: string;

  /** List the active campaigns to sync this run. */
  listActivePrograms(): Promise<NormalizedProgram[]>;

  /**
   * Fetch + normalize ONE campaign's creator standings. Throws on transport/
   * parse failure — the pipeline isolates per-program so one bad campaign does
   * not fail the batch.
   */
  fetchProgramData(program: NormalizedProgram): Promise<NormalizedProgramData>;
}
