import React from "react";
import { db } from "@/lib/db";
import { auditLogs, profiles } from "@/db/schema";
import { verifyAuditChain } from "@/lib/audit";
import { ShieldCheck, ShieldAlert, Link as LinkIcon, Database, Terminal } from "lucide-react";
import { desc, eq } from "drizzle-orm";

export default async function AuditPage() {
  const verification = await verifyAuditChain();
  const logs = await db.select().from(auditLogs).orderBy(desc(auditLogs.sequenceNumber));
  const allProfiles = await db.select().from(profiles);
  const profileMap = new Map(allProfiles.map((p) => [p.id, p.fullName]));

  return (
    <div className="space-y-8 max-w-5xl mx-auto font-mono">
      {/* Header Banner */}
      <div className="bg-slate-900 border-2 border-slate-700 p-6 rounded-md shadow-[5px_5px_0px_0px_rgba(15,23,42,1)] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white uppercase flex items-center space-x-3">
            <span>Cryptographic Audit Ledger</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Tamper-evident SHA-256 hash-chained log tracking all lab reservations, approvals, check-ins, and returns.
          </p>
        </div>

        {/* Verification Status Badge */}
        <div
          className={`p-3 rounded border-2 flex items-center space-x-2.5 text-xs font-bold ${
            verification.isValid
              ? "bg-emerald-950/60 border-emerald-500/80 text-emerald-400"
              : "bg-rose-950/60 border-rose-500/80 text-rose-400"
          }`}
        >
          {verification.isValid ? (
            <>
              <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0" />
              <div>
                <p className="uppercase">CHAIN INTEGRITY: VERIFIED ✅</p>
                <p className="text-[10px] text-emerald-300 font-normal">
                  {verification.totalBlocks} Blocks Verified • 0 Tamper Events
                </p>
              </div>
            </>
          ) : (
            <>
              <ShieldAlert className="h-5 w-5 text-rose-400 shrink-0" />
              <div>
                <p className="uppercase">TAMPERING DETECTED ❌</p>
                <p className="text-[10px] text-rose-300 font-normal">{verification.reason}</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Audit Blocks Feed */}
      <div className="space-y-4">
        {logs.length === 0 ? (
          <div className="bg-slate-900 border-2 border-slate-700 p-12 text-center rounded-md text-slate-500 text-xs">
            [ NO AUDIT BLOCKS GENERATED YET. SUBMIT A BOOKING TO START THE CHAIN ]
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className="bg-slate-900 border-2 border-slate-700 rounded-md shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] overflow-hidden"
            >
              {/* Retro Control Header */}
              <div className="bg-slate-800 border-b-2 border-slate-700 px-4 py-2 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500 inline-block border border-slate-900"></span>
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500 inline-block border border-slate-900"></span>
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 inline-block border border-slate-900"></span>
                  <span className="text-amber-400 font-bold ml-1">
                    BLOCK_#00{log.sequenceNumber}
                  </span>
                </div>
                <span className="text-[10px] text-indigo-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-700 font-bold uppercase">
                  {log.action}
                </span>
              </div>

              {/* Block Content */}
              <div className="p-5 space-y-3 text-xs">
                <div className="flex flex-wrap items-center justify-between text-slate-400 gap-2">
                  <span className="text-slate-300">
                    👤 Actor: <strong className="text-white">{profileMap.get(log.actorId) || log.actorId}</strong>
                  </span>
                  <span>🕒 Timestamp: {new Date(log.createdAt).toLocaleString()}</span>
                </div>

                {/* Hashes Display */}
                <div className="bg-slate-950 border border-slate-800 rounded p-3 text-[11px] space-y-1.5 font-mono">
                  <p className="text-slate-400 truncate">
                    <span className="text-slate-500">PREV_HASH:</span> {log.previousHash}
                  </p>
                  <p className="text-emerald-400 font-bold truncate">
                    <span className="text-slate-500">HASH_CURR:</span> {log.currentHash}
                  </p>
                </div>

                {/* JSON Payload Inspector */}
                <details className="group border border-slate-800 rounded bg-slate-950/60 p-2 text-[11px]">
                  <summary className="cursor-pointer font-bold text-slate-400 group-open:text-amber-400 flex items-center space-x-1">
                    <Terminal className="h-3.5 w-3.5" />
                    <span>Inspect Payload Data</span>
                  </summary>
                  <pre className="mt-2 p-2 bg-slate-950 rounded border border-slate-800 text-slate-300 overflow-x-auto text-[10px]">
                    {JSON.stringify(log.payload, null, 2)}
                  </pre>
                </details>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}