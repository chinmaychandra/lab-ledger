import { db } from "@/lib/db";
import { certifications, equipment } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { checkWeeklyQuota, QuotaCheckResult } from "@/lib/quotas";

export interface EligibilityResult {
  isEligible: boolean;
  reasons: string[];
  requiredCertCode?: string | null;
  userHasCert: boolean;
  certExpired: boolean;
  requiresSupervisorCosign: boolean;
  quotaInfo?: QuotaCheckResult;
}

export async function checkEligibility(
  userId: string,
  equipmentId: string,
  requestedHours: number = 2
): Promise<EligibilityResult> {
  const reasons: string[] = [];
  
  const [targetEquipment] = await db
    .select()
    .from(equipment)
    .where(eq(equipment.id, equipmentId));

  if (!targetEquipment) {
    return {
      isEligible: false,
      reasons: ["Equipment not found in database."],
      userHasCert: false,
      certExpired: false,
      requiresSupervisorCosign: false,
    };
  }

  if (!targetEquipment.isAvailable) {
    reasons.push("Equipment is currently undergoing maintenance or decommissioned.");
  }

  let userHasCert = true;
  let certExpired = false;

  if (targetEquipment.requiredCertCode) {
    const userCerts = await db
      .select()
      .from(certifications)
      .where(
        and(
          eq(certifications.userId, userId),
          eq(certifications.code, targetEquipment.requiredCertCode)
        )
      );

    userHasCert = userCerts.length > 0;

    if (!userHasCert) {
      reasons.push(`Missing required safety certification: [${targetEquipment.requiredCertCode}]`);
    } else {
      const validCert = userCerts.find(
        (cert) => cert.verified && new Date(cert.expiresAt) > new Date()
      );

      if (!validCert) {
        certExpired = true;
        reasons.push(`Certification [${targetEquipment.requiredCertCode}] has expired or is unverified.`);
      }
    }
  }

  const quotaInfo = await checkWeeklyQuota(userId, equipmentId, requestedHours);
  if (quotaInfo.hasExceededQuota) {
    reasons.push(
      `Weekly quota limit reached! Used: ${quotaInfo.hoursUsedThisWeek}h / Max: ${quotaInfo.maxWeeklyHours}h per week.`
    );
  }

  const isEligible = targetEquipment.isAvailable && userHasCert && !certExpired && !quotaInfo.hasExceededQuota;

  return {
    isEligible,
    reasons,
    requiredCertCode: targetEquipment.requiredCertCode,
    userHasCert,
    certExpired,
    requiresSupervisorCosign: targetEquipment.requiresSupervisorCosign,
    quotaInfo,
  };
}