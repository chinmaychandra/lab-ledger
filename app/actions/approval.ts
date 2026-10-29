"use server";

import { db } from "@/lib/db";
import { bookings, auditLogs } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { eq, desc } from "drizzle-orm";
import crypto from "crypto";

export async function approveBookingAction(formData: FormData): Promise<void> {
  const currentUser = await getCurrentUser();
  const bookingId = formData.get("bookingId") as string;
  const actionType = formData.get("actionType") as "OWNER_APPROVE" | "SUPERVISOR_COSIGN" | "REJECT";

  if (!bookingId || !actionType) {
    throw new Error("Invalid request parameters.");
  }

  const [existingBooking] = await db
    .select()
    .from(bookings)
    .where(eq(bookings.id, bookingId));

  if (!existingBooking) {
    throw new Error("Booking request not found.");
  }

  let updatedStatus = existingBooking.status;
  let approvedByOwner = existingBooking.approvedByOwner;
  let supervisorCosignedBy = existingBooking.supervisorCosignedBy;
  let supervisorCosignedAt = existingBooking.supervisorCosignedAt;

  if (actionType === "REJECT") {
    updatedStatus = "REJECTED";
  } else if (actionType === "OWNER_APPROVE") {
    approvedByOwner = true;
    updatedStatus = "APPROVED";
  } else if (actionType === "SUPERVISOR_COSIGN") {
    supervisorCosignedBy = currentUser.id;
    supervisorCosignedAt = new Date();
  }

  // Update Booking Status in Database
  await db
    .update(bookings)
    .set({
      status: updatedStatus,
      approvedByOwner,
      supervisorCosignedBy,
      supervisorCosignedAt,
    })
    .where(eq(bookings.id, bookingId));

  // Append Approval to Hash-Chained Audit Log
  const [lastAudit] = await db
    .select()
    .from(auditLogs)
    .orderBy(desc(auditLogs.sequenceNumber))
    .limit(1);

  const sequenceNumber = lastAudit ? lastAudit.sequenceNumber + 1 : 1;
  const previousHash = lastAudit ? lastAudit.currentHash : "GENESIS_HASH_00000000000000000000000000000000";

  const payload = {
    bookingId,
    actionType,
    approvedByRole: currentUser.role,
    actorId: currentUser.id,
    newStatus: updatedStatus,
  };

  const currentHash = crypto
    .createHash("sha256")
    .update(`${sequenceNumber}|BOOKING_${actionType}|${currentUser.id}|${previousHash}|${JSON.stringify(payload)}`)
    .digest("hex");

  await db.insert(auditLogs).values({
    sequenceNumber,
    action: `BOOKING_${actionType}`,
    actorId: currentUser.id,
    entityType: "BOOKING",
    entityId: bookingId,
    payload,
    previousHash,
    currentHash,
  });

  revalidatePath("/bookings");
}