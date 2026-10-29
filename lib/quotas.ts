import { db } from "@/lib/db";
import { bookings, equipment } from "@/db/schema";
import { eq, and, ne, gte, lte } from "drizzle-orm";

export interface QuotaCheckResult {
  hasExceededQuota: boolean;
  hoursUsedThisWeek: number;
  maxWeeklyHours: number;
  remainingHours: number;
}


export async function checkWeeklyQuota(
  userId: string,
  equipmentId: string,
  requestedHours: number
): Promise<QuotaCheckResult> {
  const [targetEquipment] = await db
    .select()
    .from(equipment)
    .where(eq(equipment.id, equipmentId));

  const maxWeeklyHours = targetEquipment?.maxWeeklyHoursPerUser || 20;
  const now = new Date();
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 7);

  // Fetch all non-rejected bookings for this user & equipment this week
  const userBookings = await db
    .select()
    .from(bookings)
    .where(
      and(
        eq(bookings.borrowerId, userId),
        eq(bookings.equipmentId, equipmentId),
        ne(bookings.status, "REJECTED"),
        gte(bookings.startTime, startOfWeek),
        lte(bookings.endTime, endOfWeek)
      )
    );

  // Calculate total hours already booked
  let hoursUsedThisWeek = 0;
  for (const b of userBookings) {
    const durationMs = new Date(b.endTime).getTime() - new Date(b.startTime).getTime();
    hoursUsedThisWeek += durationMs / (1000 * 60 * 60);
  }

  const remainingHours = Math.max(0, maxWeeklyHours - hoursUsedThisWeek);
  const hasExceededQuota = hoursUsedThisWeek + requestedHours > maxWeeklyHours;

  return {
    hasExceededQuota,
    hoursUsedThisWeek: Math.round(hoursUsedThisWeek * 10) / 10,
    maxWeeklyHours,
    remainingHours: Math.round(remainingHours * 10) / 10,
  };
}