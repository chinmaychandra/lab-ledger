import React from "react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { equipment, profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { checkEligibility } from "@/lib/eligibility";
import { createBookingAction } from "@/app/actions/booking";
import { AiAdvisor } from "@/components/AiAdvisor";
import { ShieldCheck, ShieldAlert, Calendar, ArrowLeft, Clock } from "lucide-react";
import Link from "next/link";

export default async function EquipmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const currentUser = await getCurrentUser();
  const [item] = await db.select().from(equipment).where(eq(equipment.id, id));

  if (!item) {
    notFound();
  }

  const [ownerProfile] = await db.select().from(profiles).where(eq(profiles.id, item.ownerId));
  const eligibility = await checkEligibility(currentUser.id, item.id, 2);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Link */}
      <Link
        href="/catalogue"
        className="inline-flex items-center space-x-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Catalogue</span>
      </Link>

      {/* Main Specification Window */}
      <div className="bg-slate-900 border-2 border-slate-700 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] rounded-md overflow-hidden">
        <div className="bg-slate-800 border-b-2 border-slate-700 px-4 py-2.5 flex items-center justify-between font-mono">
          <div className="flex items-center space-x-2">
            <span className="h-3 w-3 rounded-full bg-rose-500 inline-block border border-slate-900"></span>
            <span className="h-3 w-3 rounded-full bg-amber-500 inline-block border border-slate-900"></span>
            <span className="h-3 w-3 rounded-full bg-emerald-500 inline-block border border-slate-900"></span>
            <span className="text-xs font-bold text-slate-300 ml-2">
              EQUIPMENT_SPECIFICATION // {item.id.slice(0, 8)}.sys
            </span>
          </div>
          <span className="text-xs font-bold text-indigo-400 bg-slate-950 px-2.5 py-0.5 rounded border border-slate-700 uppercase">
            {item.category}
          </span>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6 font-mono">
            <div className="h-56 bg-slate-950 border-2 border-slate-800 rounded overflow-hidden relative">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-600 text-xs">
                  [ GRAPHIC_UNAVAILABLE ]
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h1 className="text-2xl font-black text-white uppercase tracking-tight">{item.name}</h1>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">{item.description}</p>
              
              <div className="bg-slate-950 border-2 border-slate-800 rounded p-3 text-xs space-y-1.5">
                <p className="text-slate-300">📍 Location: <span className="text-white font-bold">{item.location}</span></p>
                <p className="text-slate-300">👤 Owner: <span className="text-white font-bold">{ownerProfile?.fullName || "Lab Manager"}</span></p>
                <p className="text-slate-300">⏱️ Max Limit: <span className="text-amber-400 font-bold">{item.maxWeeklyHoursPerUser} Hours / Week</span></p>
              </div>

              {eligibility.quotaInfo && (
                <div className="bg-slate-950 border-2 border-slate-800 rounded p-3 text-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-300 font-bold">
                    <span className="flex items-center space-x-1.5">
                      <Clock className="h-4 w-4 text-amber-400" />
                      <span>Weekly Quota Tracker:</span>
                    </span>
                    <span className="text-amber-400">
                      {eligibility.quotaInfo.hoursUsedThisWeek} / {eligibility.quotaInfo.maxWeeklyHours} Hours
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 border border-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-400 h-full transition-all"
                      style={{
                        width: `${Math.min(
                          100,
                          (eligibility.quotaInfo.hoursUsedThisWeek / eligibility.quotaInfo.maxWeeklyHours) * 100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6 flex flex-col justify-between">
            <div
              className={`p-4 border-2 rounded ${
                eligibility.isEligible
                  ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-300"
                  : "bg-rose-950/40 border-rose-500/50 text-rose-300"
              }`}
            >
              <div className="flex items-center space-x-2 font-bold text-sm uppercase tracking-wide font-mono">
                {eligibility.isEligible ? (
                  <>
                    <ShieldCheck className="h-5 w-5 text-emerald-400" />
                    <span>Eligible to Request</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="h-5 w-5 text-rose-400" />
                    <span>Eligibility Restriction</span>
                  </>
                )}
              </div>

              <ul className="mt-2 text-xs space-y-1 list-disc list-inside font-mono">
                {eligibility.requiredCertCode ? (
                  <li>Required Cert: <strong>{eligibility.requiredCertCode}</strong> ({eligibility.userHasCert ? "Verified ✅" : "Missing ❌"})</li>
                ) : (
                  <li>No safety cert required</li>
                )}
                {eligibility.requiresSupervisorCosign && (
                  <li>Requires Supervisor Co-sign before usage</li>
                )}
                {eligibility.reasons.map((reason, idx) => (
                  <li key={idx} className="text-rose-400 font-bold">{reason}</li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-950 border-2 border-slate-800 p-5 rounded space-y-4">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-amber-400" />
                <span>Submit Reservation Request</span>
              </h3>

              <form action={createBookingAction} className="space-y-4">
                <input type="hidden" name="equipmentId" value={item.id} />

                <div className="space-y-1 font-mono">
                  <label className="text-[10px] text-slate-400 uppercase">Start Date & Time</label>
                  <input
                    type="datetime-local"
                    name="startTime"
                    required
                    className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded p-2 focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div className="space-y-1 font-mono">
                  <label className="text-[10px] text-slate-400 uppercase">End Date & Time</label>
                  <input
                    type="datetime-local"
                    name="endTime"
                    required
                    className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded p-2 focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div className="space-y-1 font-mono">
                  <label className="text-[10px] text-slate-400 uppercase">Research Purpose / Experiment</label>
                  <textarea
                    name="purpose"
                    rows={3}
                    required
                    placeholder="Describe your planned research protocol..."
                    className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded p-2 focus:border-amber-400 focus:outline-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={!eligibility.isEligible}
                  className={`w-full py-3 px-4 rounded-sm font-mono font-black text-xs uppercase tracking-wider transition-all border-2 ${
                    eligibility.isEligible
                      ? "bg-amber-400 hover:bg-amber-300 border-slate-950 text-slate-950 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                      : "bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed"
                  }`}
                >
                  {eligibility.isEligible ? "Submit Booking Request" : "Ineligible to Book"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded AI Advisor Component */}
      <AiAdvisor equipmentName={item.name} />
    </div>
  );
}