"use server";

import { db } from "@/lib/db";
import { bookings, auditLogs } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { checkEligibility } from "@/lib/eligibility";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { desc } from "drizzle-orm";
import crypto from "crypto";

export async function createBookingAction(formData: FormData): Promise<void> {
  const currentUser = await getCurrentUser();
  const equipmentId = formData.get("equipmentId") as string;
  const startTimeStr = formData.get("startTime") as string;
  const endTimeStr = formData.get("endTime") as string;
  const purpose = formData.get("purpose") as string;

  if (!equipmentId || !startTimeStr || !endTimeStr || !purpose) {
    throw new Error("All booking fields are required.");
  }

  const startTime = new Date(startTimeStr);
  const endTime = new Date(endTimeStr);

  if (endTime <= startTime) {
    throw new Error("End time must be after start time.");
  }

  // 1. Perform server-side eligibility check
  const eligibility = await checkEligibility(currentUser.id, equipmentId);
  if (!eligibility.isEligible) {
    throw new Error(`Eligibility failed: ${eligibility.reasons.join(" ")}`);
  }

  // 2. Insert booking record into Database
  const [newBooking] = await db
    .insert(bookings)
    .values({
      equipmentId,
      borrowerId: currentUser.id,
      startTime,
      endTime,
      purpose,
      status: "PENDING",
      approvedByOwner: false,
    })
    .returning();

  // 3. Append to Audit Chain (Genesis-safe hash link)
  let sequenceNumber = 1;
  let previousHash = "GENESIS_HASH_00000000000000000000000000000000";

  try {
    const [lastAudit] = await db
      .select({
        sequenceNumber: auditLogs.sequenceNumber,
        currentHash: auditLogs.currentHash,
      })
      .from(auditLogs)
      .orderBy(desc(auditLogs.sequenceNumber))
      .limit(1);

    if (lastAudit) {
      sequenceNumber = lastAudit.sequenceNumber + 1;
      previousHash = lastAudit.currentHash;
    }
  } catch (err) {
    console.warn("Audit chain initialized from genesis block.", err);
  }

  const payload = {
    bookingId: newBooking.id,
    equipmentId,
    borrowerId: currentUser.id,
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    purpose,
  };

  const currentHash = crypto
    .createHash("sha256")
    .update(`${sequenceNumber}|BOOKING_CREATED|${currentUser.id}|${previousHash}|${JSON.stringify(payload)}`)
    .digest("hex");

  await db.insert(auditLogs).values({
    sequenceNumber,
    action: "BOOKING_CREATED",
    actorId: currentUser.id,
    entityType: "BOOKING",
    entityId: newBooking.id,
    payload,
    previousHash,
    currentHash,
  });

  revalidatePath("/bookings");
  revalidatePath("/catalogue");

  // Automatically redirect user to their bookings page after successful submission
  redirect("/bookings");
}