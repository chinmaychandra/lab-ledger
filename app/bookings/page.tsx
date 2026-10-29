import React from "react";
import { supabase } from "@/lib/db";
import { Calendar, CheckCircle2, XCircle, Clock, Play, RotateCcw, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BookingsPage() {
  let bookingsList: any[] = [];

  try {
    const { data } = await supabase
      .from("bookings")
      .select("*, equipment:equipment_id(*), profile:borrower_id(*)")
      .order("created_at", { ascending: false });

    if (data) {
      bookingsList = data;
    }
  } catch (err) {
    console.error("Failed to load bookings:", err);
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto font-mono text-white">
      {/* Header */}
      <div className="bg-slate-900 border-2 border-slate-700 p-6 rounded-md shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight uppercase flex items-center gap-2">
            <Calendar className="h-7 w-7 text-amber-400" />
            <span>Bookings & Access Hub</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage lab equipment reservations, approvals, active sessions, and check-out logs.
          </p>
        </div>
        <div className="bg-sky-400 text-slate-950 px-3 py-1.5 rounded font-black text-xs uppercase border-2 border-slate-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] w-fit">
          {bookingsList.length} TOTAL RESERVATIONS
        </div>
      </div>

      {/* Bookings Feed */}
      {bookingsList.length === 0 ? (
        <div className="bg-slate-900 border-2 border-slate-700 p-12 text-center rounded-md text-slate-500 text-xs">
          [ NO RESERVATION RECORDS FOUND IN DATABASE ]
        </div>
      ) : (
        <div className="space-y-4">
          {bookingsList.map((booking) => {
            const equipment = booking.equipment || {};
            const borrower = booking.profile || {};

            return (
              <div
                key={booking.id}
                className="bg-slate-900 border-2 border-slate-700 rounded-md p-5 shadow-[5px_5px_0px_0px_rgba(15,23,42,1)] space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-3 gap-2">
                  <div>
                    <h3 className="text-base font-black uppercase text-amber-400">{equipment.name || "Equipment Item"}</h3>
                    <p className="text-xs text-slate-400">
                      Reserved by: <span className="text-white font-bold">{borrower.full_name || borrower.email || "Alex Chen"}</span>
                    </p>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded border uppercase w-fit ${
                      booking.status === "APPROVED"
                        ? "bg-emerald-950/80 border-emerald-500 text-emerald-400"
                        : booking.status === "REJECTED"
                        ? "bg-rose-950/80 border-rose-500 text-rose-400"
                        : "bg-amber-950/80 border-amber-500 text-amber-400"
                    }`}
                  >
                    STATUS: {booking.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-950 border border-slate-800 p-3 rounded">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Start Window</span>
                    <span className="font-mono text-slate-200">{new Date(booking.start_time).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">End Window</span>
                    <span className="font-mono text-slate-200">{new Date(booking.end_time).toLocaleString()}</span>
                  </div>
                  <div className="md:col-span-2 border-t border-slate-800/80 pt-2 mt-1">
                    <span className="text-slate-500 block text-[10px] uppercase">Research Purpose</span>
                    <p className="text-slate-300 italic">{booking.purpose || "No description provided."}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}