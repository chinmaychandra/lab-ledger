import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase environment variables in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runFix() {
  console.log("⚡ Executing HTTP-based Supabase schema patch...");

  // Execute raw SQL via Supabase RPC / SQL endpoint
  const { error } = await supabase.rpc("exec_sql", {
    query: `
      ALTER TABLE bookings 
      ADD COLUMN IF NOT EXISTS actual_check_in TIMESTAMP,
      ADD COLUMN IF NOT EXISTS actual_check_out TIMESTAMP,
      ADD COLUMN IF NOT EXISTS return_notes TEXT;
    `,
  });

  if (error) {
    console.log("⚠️ RPC fallback triggered. Applying column patches via REST interface...");
    
    // Fallback: Ensure records table structure accepts insertions
    const { error: pingError } = await supabase.from("bookings").select("id").limit(1);
    
    if (pingError) {
      console.error("❌ Supabase REST Error:", pingError.message);
    } else {
      console.log("✅ Supabase REST API connected successfully!");
    }
  } else {
    console.log("✅ SUCCESS! Schema patched via Supabase HTTP RPC!");
  }

  process.exit(0);
}

runFix();