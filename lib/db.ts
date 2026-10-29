import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseKey);

// Drizzle compatibility fallback
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";

const dbUrl = process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/postgres";
const client = postgres(dbUrl, { max: 1, prepare: false, connect_timeout: 5 });
export const db = drizzle(client, { schema });