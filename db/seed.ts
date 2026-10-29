import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseUrl || !serviceKey) {
  console.error("❌ Missing Supabase URL or Service Role Key in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

const BORROWER_ID = "11111111-1111-4111-a111-111111111111";
const OWNER_ID = "22222222-2222-4222-a222-222222222222";
const SUPERVISOR_ID = "33333333-3333-4333-a333-333333333333";
const ADMIN_ID = "44444444-4444-4444-a444-444444444444";

async function main() {
  console.log("🌱 Seeding LabLedger database via Supabase HTTP Client...");

  // 1. Profiles
  const { error: profileErr } = await supabase.from("profiles").upsert([
    {
      id: BORROWER_ID,
      email: "borrower@lab.edu",
      full_name: "Alex Chen (Borrower)",
      role: "Borrower",
      department: "Biomedical Engineering",
    },
    {
      id: OWNER_ID,
      email: "owner@lab.edu",
      full_name: "Dr. Sarah Jenkins (Equipment Owner)",
      role: "Owner",
      department: "Physics & Photonics",
    },
    {
      id: SUPERVISOR_ID,
      email: "supervisor@lab.edu",
      full_name: "Prof. Robert Vance (Lab Supervisor)",
      role: "Supervisor",
      department: "Safety & Compliance",
    },
    {
      id: ADMIN_ID,
      email: "admin@lab.edu",
      full_name: "System Administrator",
      role: "Admin",
      department: "Central Research Facility",
    },
  ]);

  if (profileErr) throw profileErr;

  // 2. Certifications
  const now = new Date();
  const nextYear = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());

  const { error: certErr } = await supabase.from("certifications").upsert([
    {
      user_id: BORROWER_ID,
      code: "LASER_SAFETY_L2",
      title: "Class 4 Laser Operations Safety",
      issued_at: now.toISOString(),
      expires_at: nextYear.toISOString(),
      verified: true,
    },
    {
      user_id: BORROWER_ID,
      code: "CRYO_SAFETY_L1",
      title: "Cryogenic Liquids & Pressure Vessels",
      issued_at: now.toISOString(),
      expires_at: nextYear.toISOString(),
      verified: true,
    },
  ]);

  if (certErr) throw certErr;

  // 3. Equipment
  const { error: eqErr } = await supabase.from("equipment").upsert([
    {
      name: "High-Power Ti:Sapphire Femtosecond Laser",
      category: "Photonics & Optics",
      description: "Ultra-fast pulsed laser system for spectroscopy and precise micromachining.",
      location: "Optics Building Room 304",
      owner_id: OWNER_ID,
      required_cert_code: "LASER_SAFETY_L2",
      requires_supervisor_cosign: true,
      max_weekly_hours_per_user: 12,
      is_available: true,
      image_url: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Cryogenic Scanning Electron Microscope (Cryo-SEM)",
      category: "Imaging & Analysis",
      description: "Sub-nanometer resolution structural analysis of hydrated samples.",
      location: "Nano-Imaging Center B-12",
      owner_id: OWNER_ID,
      required_cert_code: "CRYO_SAFETY_L1",
      requires_supervisor_cosign: false,
      max_weekly_hours_per_user: 8,
      is_available: true,
      image_url: "https://images.unsplash.com/photo-1581093588401-fbb62a02f120?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Standard Desktop 3D Resin Printer",
      category: "Prototyping",
      description: "High-precision SLA printer for rapid microfluidic chip fabrication.",
      location: "Maker Space Hub Room 101",
      owner_id: OWNER_ID,
      required_cert_code: null,
      requires_supervisor_cosign: false,
      max_weekly_hours_per_user: 20,
      is_available: true,
      image_url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
    },
  ]);

  if (eqErr) throw eqErr;

  console.log("✅ Seeding complete! Mock users, certs, and equipment inserted.");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});