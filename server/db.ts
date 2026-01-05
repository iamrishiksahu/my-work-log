import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

// We are using file storage as requested, but we keep the db connection boilerplate
// just in case we need to switch or if the environment expects it.
// However, since the user explicitly said "I would not have any database",
// we will make this resilient if DATABASE_URL is missing.

export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/postgres" 
});

// We won't use this export if we stick to file storage
export const db = drizzle(pool, { schema });
