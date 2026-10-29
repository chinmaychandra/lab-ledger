import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase environment variables in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function resetDemoData() {
  console.log("🧹 Wiping test bookings and audit logs over Supabase HTTP API...");

  try {
    const { error: bookingError } = await supabase
      .from("bookings")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    if (bookingError) throw bookingError;
    console.log("✅ Cleared all booking records.");

    const { error: auditError } = await supabase
      .from("audit_logs")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    if (auditError) throw auditError;
    console.log("✅ Cleared all audit log entries.");


    const { data: userProfiles, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .limit(1);

    if (profileError || !userProfiles || userProfiles.length === 0) {
      throw new Error("No user profiles found in database to attach genesis audit log.");
    }

    const validActorId = userProfiles[0].id;

    const genesisPayload = { message: "LabLedger Genesis Audit Block Initialized" };
    const genesisHash = crypto
      .createHash("sha256")
      .update(`1|GENESIS_INIT|${validActorId}|GENESIS_HASH_00000000000000000000000000000000|${JSON.stringify(genesisPayload)}`)
      .digest("hex");

    const { error: genesisError } = await supabase.from("audit_logs").insert({
      sequence_number: 1,
      action: "SYSTEM_GENESIS",
      actor_id: validActorId,
      entity_type: "SYSTEM",
      entity_id: validActorId,
      payload: genesisPayload,
      previous_hash: "GENESIS_HASH_00000000000000000000000000000000",
      current_hash: genesisHash,
    });

    if (genesisError) throw genesisError;

    console.log("✅ Initialized clean Genesis Audit Block.");
    console.log("🎉 SUCCESS! Demo environment reset. All quotas are now 0 / 12 Hours!");
  } catch (error: any) {
    console.error("❌ Reset failed:", error.message || error);
  }

  process.exit(0);
}

resetDemoData();