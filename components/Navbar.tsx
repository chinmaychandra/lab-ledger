"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FlaskConical, Calendar, History, ShieldCheck } from "lucide-react";

const ROLES = ["Borrower", "Owner", "Supervisor", "Admin"] as const;

export default function Navbar() {
  const [currentRole, setCurrentRole] = useState<string>("Borrower");

  useEffect(() => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; labledger_role=`);
    if (parts.length === 2) {
      setCurrentRole(parts.pop()?.split(";").shift() || "Borrower");
    }
  }, []);

  const handleRoleChange = (role: string) => {
    document.cookie = `labledger_role=${role}; path=/`;
    setCurrentRole(role);
    window.location.reload();
  };

  return (
    <nav className="bg-slate-900 border-b-2 border-slate-700 text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="p-1.5 bg-amber-400 border-2 border-slate-950 text-slate-950 font-black rounded-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <FlaskConical className="h-5 w-5" />
            </div>
            <span className="font-mono font-black text-xl tracking-tight text-white uppercase">
              Lab<span className="text-amber-400">Ledger</span>
            </span>
          </Link>

          {/* Navigation Buttons (Retro Brutalist Tabs) */}
          <div className="flex items-center space-x-3">
            <Link
              href="/catalogue"
              className="flex items-center space-x-1.5 text-xs font-mono font-bold uppercase tracking-wider px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border-2 border-slate-700 rounded-sm text-slate-200 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5"
            >
              <FlaskConical className="h-4 w-4 text-amber-400" />
              <span>Catalogue</span>
            </Link>
            <Link
              href="/bookings"
              className="flex items-center space-x-1.5 text-xs font-mono font-bold uppercase tracking-wider px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border-2 border-slate-700 rounded-sm text-slate-200 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5"
            >
              <Calendar className="h-4 w-4 text-emerald-400" />
              <span>Bookings</span>
            </Link>
            <Link
              href="/audit"
              className="flex items-center space-x-1.5 text-xs font-mono font-bold uppercase tracking-wider px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border-2 border-slate-700 rounded-sm text-slate-200 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5"
            >
              <History className="h-4 w-4 text-sky-400" />
              <span>Audit Chain</span>
            </Link>
          </div>

          {/* Role Switcher Box for Judges */}
          <div className="flex items-center space-x-2 bg-slate-950 px-3 py-1.5 border-2 border-slate-700 rounded-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-mono font-bold text-slate-400 uppercase hidden sm:inline">Role:</span>
            <select
              value={currentRole}
              onChange={(e) => handleRoleChange(e.target.value)}
              className="bg-slate-900 text-emerald-400 font-mono text-xs font-bold rounded-sm px-2 py-0.5 border border-slate-700 focus:outline-none cursor-pointer"
            >
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </nav>
  );
}