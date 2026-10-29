import { pgTable, text, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";

// 1. Profiles Table
export const profiles = pgTable("profiles", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default("Borrower"), // Borrower, Owner, Supervisor, Admin
  department: text("department").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 2. Safety Certifications Table
export const certifications = pgTable("certifications", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  code: text("code").notNull(), // e.g., LASER_SAFETY_L2, CRYO_SAFETY_L1
  title: text("title").notNull(),
  issuedAt: timestamp("issued_at").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  verified: boolean("verified").default(true).notNull(),
});

// 3. Equipment Table
export const equipment = pgTable("equipment", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  ownerId: text("owner_id").notNull().references(() => profiles.id),
  requiredCertCode: text("required_cert_code"),
  requiresSupervisorCosign: boolean("requires_supervisor_cosign").default(false).notNull(),
  maxWeeklyHoursPerUser: integer("max_weekly_hours_per_user").default(10).notNull(),
  isAvailable: boolean("is_available").default(true).notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 4. Bookings Table
export const bookings = pgTable("bookings", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  equipmentId: text("equipment_id").notNull().references(() => equipment.id, { onDelete: "cascade" }),
  borrowerId: text("borrower_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  purpose: text("purpose").notNull(),
  status: text("status").notNull().default("PENDING"), // PENDING, APPROVED, REJECTED, CHECKED_IN, COMPLETED
  approvedByOwner: boolean("approved_by_owner").default(false).notNull(),
  supervisorCosignedBy: text("supervisor_cosigned_by").references(() => profiles.id),
  supervisorCosignedAt: timestamp("supervisor_cosigned_at"),
  actualCheckIn: timestamp("actual_check_in"),
  actualCheckOut: timestamp("actual_check_out"),
  returnNotes: text("return_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 5. Audit Chain Table (SHA-256 Tamper-Evident Ledger)
export const auditLogs = pgTable("audit_logs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  sequenceNumber: integer("sequence_number").notNull().unique(),
  action: text("action").notNull(),
  actorId: text("actor_id").notNull().references(() => profiles.id),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  payload: jsonb("payload").notNull(),
  previousHash: text("previous_hash").notNull(),
  currentHash: text("current_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});