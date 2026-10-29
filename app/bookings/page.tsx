import React from "react";
import { db } from "@/lib/db";
import { bookings, equipment, profiles } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { approveBookingAction } from "@/app/actions/approval";
import { checkInAction, returnEquipmentAction } from "@/app/actions/usage";
import { Calendar, CheckCircle, XCircle, Clock, ShieldCheck, UserCheck, Play, LogOut, AlertTriangle } from "lucide-react";
import { eq, desc } from "drizzle-orm";

export default async function BookingsPage() {
  const currentUser = await getCurrentUser();

  const allBookings = await db
    .select({
      booking: bookings,
      item: equipment,
      borrower: profiles,
    })
    .from(bookings)
    .innerJoin(equipment, eq(bookings.equipmentId, equipment.id))
    .innerJoin(profiles, eq(bookings.borrowerId, profiles.id))
    .orderBy(desc(bookings.createdAt));

  return (
    <div className="space-y-8 max-w-5xl mx-auto font-mono">
      {/* Header Banner */}
      <div className="bg-slate-900 border-2 border-slate-700 p-6 rounded-md shadow-[5px_5px_0px_0px_rgba(15,23,42,1)] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white uppercase">
            Booking & Active Usage Hub
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage approvals, active session check-ins, and return condition reports.
          </p>
        </div>
        <div className="bg-slate-950 border-2 border-slate-800 rounded px-3.5 py-2 text-xs text-slate-300">
          ROLE: <span className="font-bold text-amber-400">{currentUser.role}</span> ({currentUser.fullName})
        </div>
      </div>

      {/* Bookings Queue */}
      <div className="space-y-4">
        {allBookings.length === 0 ? (
          <div className="bg-slate-900 border-2 border-slate-700 p-12 text-center rounded-md text-slate-500 text-xs">
            [ NO BOOKING REQUESTS RECORDED IN DATABASE ]
          </div>
        ) : (
          allBookings.map(({ booking, item, borrower }) => {
            const isCheckedIn = !!booking.actualCheckIn && !booking.actualCheckOut;
            const isCompleted = !!booking.actualCheckOut;

            return (
              <div
                key={booking.id}
                className="bg-slate-900 border-2 border-slate-700 rounded-md shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] overflow-hidden"
              >
                {/* Retro Header */}
                <div className="bg-slate-800 border-b-2 border-slate-700 px-4 py-2 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500 inline-block border border-slate-900"></span>
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500 inline-block border border-slate-900"></span>
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 inline-block border border-slate-900"></span>
                    <span className="text-slate-300 font-bold ml-1">
                      BOOKING_ID // {booking.id.slice(0, 8)}
                    </span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded border font-bold uppercase text-[10px] ${
                      isCompleted
                        ? "bg-indigo-950 text-indigo-300 border-indigo-800"
                        : isCheckedIn
                        ? "bg-sky-950 text-sky-400 border-sky-800 animate-pulse"
                        : booking.status === "APPROVED"
                        ? "bg-emerald-950 text-emerald-400 border-emerald-800"
                        : booking.status === "REJECTED"
                        ? "bg-rose-950 text-rose-400 border-rose-800"
                        : "bg-amber-950 text-amber-400 border-amber-800"
                    }`}
                  >
                    {isCompleted ? "RETURNED" : isCheckedIn ? "IN SESSION" : booking.status}
                  </span>
                </div>

                {/* Body Content */}
                <div className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="space-y-2 text-xs">
                    <h3 className="text-base font-black text-white uppercase">{item.name}</h3>
                    <p className="text-slate-300">
                      👤 Borrower: <span className="text-indigo-400 font-bold">{borrower.fullName}</span> ({borrower.department})
                    </p>
                    <p className="text-slate-400">
                      🕒 Slot: <span className="text-white">{new Date(booking.startTime).toLocaleString()}</span> → <span className="text-white">{new Date(booking.endTime).toLocaleString()}</span>
                    </p>
                    <p className="text-slate-400">
                      📝 Purpose: <span className="text-slate-200 italic">"{booking.purpose}"</span>
                    </p>

                    {booking.returnNotes && (
                      <p className="text-amber-400 pt-1">
                        📋 Return Log: <span className="text-slate-300">"{booking.returnNotes}"</span>
                      </p>
                    )}
                  </div>

                  {/* Actions Section */}
                  <div className="flex flex-col gap-2 w-full md:w-auto">
                    {/* Borrower Check-In Button */}
                    {booking.status === "APPROVED" && 
 !booking.actualCheckIn && 
 (currentUser.id === borrower.id || currentUser.role === "Admin") && (
  <form action={checkInAction}>
    <input type="hidden" name="bookingId" value={booking.id} />
    <button
      type="submit"
      className="w-full flex items-center justify-center space-x-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs uppercase px-4 py-2 rounded-sm border-2 border-slate-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5"
    >
      <Play className="h-4 w-4" />
      <span>Start Lab Session (Check In)</span>
    </button>
  </form>
)}

                    {/* Borrower Return Form */}
                    {isCheckedIn && (
                      <form action={returnEquipmentAction} className="bg-slate-950 border-2 border-slate-800 p-3 rounded space-y-2.5">
                        <input type="hidden" name="bookingId" value={booking.id} />
                        
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 uppercase">Equipment Condition Notes</label>
                          <input
                            type="text"
                            name="conditionNotes"
                            required
                            placeholder="e.g. Session normal, cleaned optics..."
                            className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded p-1.5 focus:outline-none"
                          />
                        </div>

                        <div className="flex items-center space-x-2 text-xs text-rose-400 font-bold">
                          <input type="checkbox" name="isDamaged" value="true" id={`damage-${booking.id}`} className="rounded border-slate-700" />
                          <label htmlFor={`damage-${booking.id}`} className="cursor-pointer flex items-center gap-1">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            <span>Flag Damage / Maintenance Issue</span>
                          </label>
                        </div>

                        <button
                          type="submit"
                          className="w-full flex items-center justify-center space-x-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase px-4 py-2 rounded-sm border-2 border-slate-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Complete Session & Return</span>
                        </button>
                      </form>
                    )}

                    {/* Owner Approval & Supervisor Co-Sign Buttons */}
                    {(currentUser.role === "Owner" || currentUser.role === "Admin") &&
                      booking.status === "PENDING" && (
                        <form action={approveBookingAction}>
                          <input type="hidden" name="bookingId" value={booking.id} />
                          <input type="hidden" name="actionType" value="OWNER_APPROVE" />
                          <button
                            type="submit"
                            className="w-full flex items-center justify-center space-x-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase px-4 py-2 rounded-sm border-2 border-slate-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5"
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span>Approve Request</span>
                          </button>
                        </form>
                      )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}