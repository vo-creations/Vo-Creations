// Drizzle client — the single DB handle for the whole app.
// Every product reads/writes through this; never instantiate postgres() elsewhere.
//
// Connection comes from the Vercel→Supabase integration, which injects POSTGRES_*.
// At runtime we use the *pooled* string (POSTGRES_URL — port 6543, "Transaction"
// pooler) so serverless lambdas don't exhaust Postgres connections. Migrations
// (drizzle-kit) use the direct/non-pooling URL instead — see drizzle.config.ts.
// DATABASE_URL is honoured as an override if ever set manually.

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!connectionString) {
  throw new Error(
    "No DB connection string — set POSTGRES_URL (via `vercel env pull`) or DATABASE_URL."
  );
}

// `prepare: false` is required by Supabase's transaction-mode pooler (pgbouncer),
// which does not support prepared statements. Single shared client across the
// serverless lambda's lifetime.
const queryClient = postgres(connectionString, { prepare: false });

export const db = drizzle(queryClient, { schema });
export { schema };
