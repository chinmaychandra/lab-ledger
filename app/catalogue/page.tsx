import React from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { equipment } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { ShieldAlert, Award, ArrowRight, CheckCircle2 } from "lucide-react";

export default async function CataloguePage() {
  const currentUser = await getCurrentUser();
  const allEquipment = await db.select().from(equipment);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-slate-900 border-2 border-slate-700 p-6 rounded-md shadow-[5px_5px_0px_0px_rgba(15,23,42,1)] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white uppercase font-mono">
            Equipment Catalogue
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Browse verified lab equipment, check safety requirements, and submit booking requests.
          </p>
        </div>
        <div className="bg-slate-950 border-2 border-slate-800 rounded px-3.5 py-2 text-xs font-mono text-slate-300">
          ACTIVE_SESSION: <span className="font-bold text-amber-400">{currentUser.fullName}</span> ({currentUser.role})
        </div>
      </div>

      {/* Equipment Grid (Retro OS Window Style) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allEquipment.map((item) => (
          <div
            key={item.id}
            className="bg-slate-900 border-2 border-slate-700 rounded-md shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] hover:shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] hover:border-slate-600 transition-all flex flex-col overflow-hidden"
          >
            {/* Retro Window Control Header */}
            <div className="bg-slate-800 border-b-2 border-slate-700 px-3 py-1.5 flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500 inline-block border border-slate-900"></span>
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500 inline-block border border-slate-900"></span>
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 inline-block border border-slate-900"></span>
                <span className="text-[10px] font-mono text-slate-400 ml-1 truncate max-w-[140px]">
                  {item.name.toLowerCase().replace(/\s+/g, "-")}.sys
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold text-indigo-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-700 uppercase">
                {item.category}
              </span>
            </div>

            {/* Image Banner */}
            <div className="h-44 bg-slate-950 border-b-2 border-slate-700 relative overflow-hidden">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover grayscale contrast-125 hover:grayscale-0 transition-all duration-300"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-600 font-mono text-xs">
                  [ GRAPHIC_UNAVAILABLE ]
                </div>
              )}
            </div>

            {/* Card Content Body */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <h3 className="text-base font-black text-white leading-snug font-mono uppercase">
                  {item.name}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2">{item.description}</p>
                <p className="text-xs text-slate-500 font-mono pt-1">📍 {item.location}</p>
              </div>

              {/* Safety Badges */}
              <div className="space-y-2 pt-3 border-t-2 border-slate-800/80 font-mono">
                {item.requiredCertCode ? (
                  <div className="flex items-center text-xs text-amber-400 gap-1.5 bg-amber-950/30 p-2 rounded border border-amber-900/50">
                    <Award className="h-4 w-4 shrink-0" />
                    <span>Req: <strong className="underline">{item.requiredCertCode}</strong></span>
                  </div>
                ) : (
                  <div className="flex items-center text-xs text-emerald-400 gap-1.5 bg-emerald-950/30 p-2 rounded border border-emerald-900/50">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>No Cert Required</span>
                  </div>
                )}

                {item.requiresSupervisorCosign && (
                  <div className="flex items-center text-xs text-rose-400 gap-1.5 bg-rose-950/30 p-2 rounded border border-rose-900/50">
                    <ShieldAlert className="h-4 w-4 shrink-0" />
                    <span>Requires Supervisor Co-sign</span>
                  </div>
                )}
              </div>

              {/* High-Contrast Brutalist Action Button */}
              <Link
                href={`/catalogue/${item.id}`}
                className="w-full mt-4 flex items-center justify-center space-x-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-mono font-black text-xs uppercase tracking-wider py-2.5 px-4 rounded-sm border-2 border-slate-950 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
              >
                <span>View & Book Equipment</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}