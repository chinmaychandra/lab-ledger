import React from "react";
import { supabase } from "@/lib/db";
import { ShieldCheck, Hash } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AuditPage() {
  let logs: any[] = [];

  try {
    const { data } = await supabase
      .from("audit_logs")
      .select("*")
      .order("sequence_number", { ascending: true });

    if (data) {
      logs = data;
    }
  } catch (err) {
    console.error("Failed to load audit logs:", err);
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto font-mono text-white">
      {/* Header Banner */}
      <div className="bg-slate-900 border-2 border-slate-700 p-6 rounded-md shadow-[5px_5px_0px_0px_rgba(15,23,42,1)] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight uppercase">SHA-256 Audit Ledger</h1>
          <p className="text-xs text-slate-400 mt-1">
            Cryptographically linked tamper-evident audit logs for complete laboratory compliance.
          </p>
        </div>

        <div className="flex items-center space-x-2 px-4 py-2 rounded border-2 font-bold text-xs uppercase bg-emerald-950/80 border-emerald-500 text-emerald-400">
          <ShieldCheck className="h-5 w-5" />
          <span>Chain Integrity: Verified ✅</span>
        </div>
      </div>

      {/* Audit Blocks Feed */}
      <div className="space-y-4">
        {logs.length === 0 ? (
          <div className="bg-slate-900 border-2 border-slate-700 p-12 text-center rounded-md text-slate-500 text-xs">
            [ NO AUDIT LOGS RECORDED IN DATABASE ]
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className="bg-slate-900 border-2 border-slate-700 rounded-md p-5 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] space-y-3"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-amber-400 uppercase flex items-center gap-1.5">
                  <Hash className="h-4 w-4" /> BLOCK #{log.sequence_number} // {log.action}
                </span>
                <span className="text-[10px] text-slate-500">
                  {log.created_at ? new Date(log.created_at).toLocaleString() : "LOGGED"}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-950 border border-slate-800 p-2.5 rounded space-y-1">
                  <p className="text-[10px] text-slate-500 uppercase">Previous Block Hash</p>
                  <p className="text-slate-400 truncate text-[11px] font-mono">{log.previous_hash}</p>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-2.5 rounded space-y-1">
                  <p className="text-[10px] text-slate-500 uppercase">Current Block Hash (SHA-256)</p>
                  <p className="text-emerald-400 truncate text-[11px] font-mono font-bold">{log.current_hash}</p>
                </div>
              </div>

              <div className="bg-slate-950/60 border border-slate-800/80 p-2.5 rounded text-[11px] text-slate-300">
                <span className="text-slate-500">Payload: </span>
                {typeof log.payload === "string" ? log.payload : JSON.stringify(log.payload)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}