import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";

const connectionString = process.env.DATABASE_URL || "";

// Configure postgres.js client with max 1 connection for seed/serverless stability
const client = postgres(connectionString, {
  prepare: false,
  ssl: "require",
  max: 1,
});

export const db = drizzle(client, { schema });