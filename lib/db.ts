import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";

const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  "postgres://postgres:postgres@localhost:5432/postgres";

// Max 1 connection for serverless/Vercel functions
const client = postgres(connectionString, { max: 1, prepare: false });

export const db = drizzle(client, { schema });