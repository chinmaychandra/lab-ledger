"use server";

import { db } from "@/lib/db";
import { bookings, equipment, auditLogs } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { eq, desc } from "drizzle-orm";
import crypto from "crypto";

export async function checkInAction(formData: FormData): Promise<void> {
  const currentUser = await getCurrentUser();
  const bookingId = formData.get("bookingId") as string;

  if (!bookingId) {
    throw new Error("Missing booking ID.");
  }

  // Record Check-In timestamp
  await db
    .update(bookings)
    .set({
      actualCheckIn: new Date(),
    })
    .where(eq(bookings.id, bookingId));

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
  } catch (e) {
    console.warn("Audit chain fallback initialized.", e);
  }

  const payload = {
    bookingId,
    actorId: currentUser.id,
    checkInTime: new Date().toISOString(),
  };

  const currentHash = crypto
    .createHash("sha256")
    .update(`${sequenceNumber}|EQUIPMENT_CHECK_IN|${currentUser.id}|${previousHash}|${JSON.stringify(payload)}`)
    .digest("hex");

  await db.insert(auditLogs).values({
    sequenceNumber,
    action: "EQUIPMENT_CHECK_IN",
    actorId: currentUser.id,
    entityType: "BOOKING",
    entityId: bookingId,
    payload,
    previousHash,
    currentHash,
  });

  revalidatePath("/bookings");
}

export async function returnEquipmentAction(formData: FormData): Promise<void> {
  const currentUser = await getCurrentUser();
  const bookingId = formData.get("bookingId") as string;
  const conditionNotes = formData.get("conditionNotes") as string;
  const isDamaged = formData.get("isDamaged") === "true";

  if (!bookingId) {
    throw new Error("Missing booking ID.");
  }

  const [existingBooking] = await db
    .select()
    .from(bookings)
    .where(eq(bookings.id, bookingId));

  await db
    .update(bookings)
    .set({
      actualCheckOut: new Date(),
      returnNotes: conditionNotes,
    })
    .where(eq(bookings.id, bookingId));

  if (isDamaged && existingBooking) {
    await db
      .update(equipment)
      .set({ isAvailable: false })
      .where(eq(equipment.id, existingBooking.equipmentId));
  }

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
  } catch (e) {
    console.warn("Audit chain fallback initialized.", e);
  }

  const payload = {
    bookingId,
    equipmentId: existingBooking?.equipmentId,
    actorId: currentUser.id,
    checkOutTime: new Date().toISOString(),
    conditionNotes,
    isDamaged,
  };

  const actionName = isDamaged ? "EQUIPMENT_RETURNED_DAMAGED" : "EQUIPMENT_RETURNED_NORMAL";

  const currentHash = crypto
    .createHash("sha256")
    .update(`${sequenceNumber}|${actionName}|${currentUser.id}|${previousHash}|${JSON.stringify(payload)}`)
    .digest("hex");

  await db.insert(auditLogs).values({
    sequenceNumber,
    action: actionName,
    actorId: currentUser.id,
    entityType: "BOOKING",
    entityId: bookingId,
    payload,
    previousHash,
    currentHash,
  });

  revalidatePath("/bookings");
  revalidatePath("/catalogue");
}