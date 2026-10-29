import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseKey);

// Fallback compatibility wrapper for raw queries across server routes
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";

const dbUrl = process.env.DATABASE_URL || "";
const queryClient = postgres(dbUrl, { max: 1, idle_timeout: 20, connect_timeout: 10, prepare: false });
export const db = drizzle(queryClient, { schema });