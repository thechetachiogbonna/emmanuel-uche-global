import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Copy .env.example to .env and point it at your Postgres instance."
  );
}

// One connection pool per server process. In dev with hot-reload this can
// spawn extra clients on each edit — stash it on globalThis so Next.js's
// module reloading reuses the same pool instead of leaking connections.
const globalForDb = globalThis as unknown as {
  client: postgres.Sql | undefined;
};

const client =
  globalForDb.client ??
  postgres(process.env.DATABASE_URL, {
    max: process.env.NODE_ENV === "production" ? 10 : 1,
  });

if (process.env.NODE_ENV !== "production") globalForDb.client = client;

export const db = drizzle(client, { schema });
