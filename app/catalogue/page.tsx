import React from "react";
import Link from "next/link";
import { supabase } from "@/lib/db";
import { Wrench, ShieldCheck, Clock, MapPin, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CataloguePage() {
  let equipmentList: any[] = [];

  try {
    const { data } = await supabase.from("equipment").select("*").order("name");
    if (data) {
      equipmentList = data.map((item) => ({
        ...item,
        maxWeeklyHours: item.max_weekly_hours ?? item.maxWeeklyHours ?? 12,
        requiredCertificationCode: item.required_certification_code ?? item.requiredCertificationCode ?? "BASIC_SAFETY",
        imageUrl: item.image_url ?? item.imageUrl,
      }));
    }
  } catch (err) {
    console.error("Failed to load equipment list:", err);
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto font-mono">
      <div className="bg-slate-900 border-2 border-slate-700 p-6 rounded-md shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white uppercase flex items-center gap-2">
            <Wrench className="h-7 w-7 text-amber-400" />
            <span>Equipment Catalogue</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse precision laboratory inventory, safety prerequisites, and weekly quota limits.
          </p>
        </div>
        <div className="bg-amber-400 text-slate-950 px-3 py-1.5 rounded font-black text-xs uppercase border-2 border-slate-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] w-fit">
          {equipmentList.length} ACTIVE SYSTEMS
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {equipmentList.map((item) => (
          <div
            key={item.id}
            className="bg-slate-900 border-2 border-slate-700 rounded-md overflow-hidden shadow-[5px_5px_0px_0px_rgba(15,23,42,1)] flex flex-col justify-between hover:border-slate-500 transition-all"
          >
            <div>
              <div className="h-44 bg-slate-950 relative overflow-hidden border-b-2 border-slate-800">
                <img
                  src={item.imageUrl || "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800"}
                  alt={item.name}
                  className="w-full h-full object-cover opacity-80"
                />
                <span className="absolute top-3 right-3 bg-slate-950/90 text-amber-400 text-[10px] font-bold px-2 py-1 rounded border border-amber-500/40 uppercase">
                  {item.category || "LAB HARDWARE"}
                </span>
              </div>

              <div className="p-5 space-y-3">
                <h2 className="text-lg font-black text-white uppercase leading-snug">{item.name}</h2>
                <p className="text-xs text-slate-400 line-clamp-2">{item.description}</p>

                <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-800">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-3.5 w-3.5 text-amber-400" />
                    <span>{item.location}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-3.5 w-3.5 text-sky-400" />
                    <span>Max Quota: {item.maxWeeklyHours}h / week</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Req: {item.requiredCertificationCode}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 pt-0">
              <Link
                href={`/catalogue/${item.id}`}
                className="w-full flex items-center justify-center space-x-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase px-4 py-2.5 rounded border-2 border-slate-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition-all"
              >
                <span>View System Details</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}