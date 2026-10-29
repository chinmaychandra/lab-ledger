import React from "react";
import Link from "next/link";
import { supabase } from "@/lib/db";
import { AiAdvisor } from "@/components/AiAdvisor";
import { ArrowLeft, MapPin, User, Clock, Calendar, AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function EquipmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  let item: any = null;

  try {
    const { data } = await supabase.from("equipment").select("*").eq("id", resolvedParams.id).single();
    if (data) {
      item = {
        ...data,
        maxWeeklyHours: data.max_weekly_hours ?? 12,
        requiredCertificationCode: data.required_certification_code ?? "BASIC_SAFETY",
        imageUrl: data.image_url,
      };
    }
  } catch (err) {
    console.error("Error fetching detail:", err);
  }

  if (!item) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center bg-slate-900 border-2 border-slate-700 rounded-md font-mono text-white space-y-4">
        <AlertCircle className="h-10 w-10 text-amber-400 mx-auto" />
        <h2 className="text-xl font-bold uppercase">System Record Not Found</h2>
        <Link href="/catalogue" className="inline-block bg-amber-400 text-slate-950 px-4 py-2 font-bold uppercase rounded text-xs">
          Return to Catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-mono text-white">
      <Link href="/catalogue" className="inline-flex items-center space-x-2 text-xs font-bold text-slate-400 hover:text-white uppercase">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Catalogue</span>
      </Link>

      <div className="bg-slate-900 border-2 border-slate-700 rounded-md p-6 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <img src={item.imageUrl || "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800"} alt={item.name} className="w-full h-56 object-cover rounded border-2 border-slate-800" />
          <h1 className="text-2xl font-black uppercase">{item.name}</h1>
          <p className="text-xs text-slate-400">{item.description}</p>
          <div className="space-y-2 text-xs border-t border-slate-800 pt-3">
            <div className="flex items-center space-x-2"><MapPin className="h-4 w-4 text-amber-400" /><span>Location: {item.location}</span></div>
            <div className="flex items-center space-x-2"><Clock className="h-4 w-4 text-sky-400" /><span>Weekly Quota Limit: {item.maxWeeklyHours} Hours</span></div>
          </div>
        </div>

        <div className="bg-slate-950 border-2 border-slate-800 p-5 rounded-md space-y-4">
          <h2 className="text-sm font-black uppercase text-amber-400 flex items-center gap-2">
            <Calendar className="h-4 w-4" /> Submit Reservation Request
          </h2>
          <form action="/api/bookings/create" method="POST" className="space-y-3 text-xs">
            <input type="hidden" name="equipmentId" value={item.id} />
            <div>
              <label className="block text-slate-400 mb-1">Start Date & Time</label>
              <input type="datetime-local" name="startTime" required className="w-full bg-slate-900 border border-slate-700 p-2 rounded text-white" />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">End Date & Time</label>
              <input type="datetime-local" name="endTime" required className="w-full bg-slate-900 border border-slate-700 p-2 rounded text-white" />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Research Purpose</label>
              <textarea name="purpose" rows={3} required placeholder="Describe research protocol..." className="w-full bg-slate-900 border border-slate-700 p-2 rounded text-white" />
            </div>
            <button type="submit" className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black p-2.5 rounded border-2 border-slate-950 uppercase">
              Submit Reservation
            </button>
          </form>
        </div>
      </div>

      <AiAdvisor equipmentName={item.name} />
    </div>
  );
}