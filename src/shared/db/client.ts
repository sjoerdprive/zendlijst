import "server-only";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { getEnv } from "@/shared/config/env";
import * as schema from "./schema";

export type Database = NodePgDatabase<typeof schema>;

// Reuse one pool across hot reloads in development.
const globalForDb = globalThis as unknown as { nieuwsbriefDb?: Database };

const createDb = (): Database =>
  drizzle(new Pool({ connectionString: getEnv().DATABASE_URL }), { schema });

export const getDb = (): Database => {
  if (!globalForDb.nieuwsbriefDb) {
    globalForDb.nieuwsbriefDb = createDb();
  }
  return globalForDb.nieuwsbriefDb;
};
