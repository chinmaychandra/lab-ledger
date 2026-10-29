import { db } from "@/lib/db";
import { auditLogs } from "@/db/schema";
import { asc } from "drizzle-orm";
import crypto from "crypto";

export interface AuditVerificationResult {
  isValid: boolean;
  totalBlocks: number;
  tamperedBlockSequence?: number;
  reason?: string;
}

export async function verifyAuditChain(): Promise<AuditVerificationResult> {
  const logs = await db.select().from(auditLogs).orderBy(asc(auditLogs.sequenceNumber));

  if (logs.length === 0) {
    return { isValid: true, totalBlocks: 0 };
  }

  let expectedPreviousHash = "GENESIS_HASH_00000000000000000000000000000000";

  for (const log of logs) {
    if (log.previousHash !== expectedPreviousHash) {
      return {
        isValid: false,
        totalBlocks: logs.length,
        tamperedBlockSequence: log.sequenceNumber,
        reason: `Hash mismatch at sequence #${log.sequenceNumber}: previousHash link broken.`,
      };
    }

    const computedHash = crypto
      .createHash("sha256")
      .update(
        `${log.sequenceNumber}|${log.action}|${log.actorId}|${log.previousHash}|${JSON.stringify(
          log.payload
        )}`
      )
      .digest("hex");

    if (computedHash !== log.currentHash) {
      return {
        isValid: false,
        totalBlocks: logs.length,
        tamperedBlockSequence: log.sequenceNumber,
        reason: `Data tampering detected at block #${log.sequenceNumber}! Computed hash does not match stored hash.`,
      };
    }

    expectedPreviousHash = log.currentHash;
  }

  return {
    isValid: true,
    totalBlocks: logs.length,
  };
}