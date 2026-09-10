"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Stethoscope, 
  User, 
  ShieldCheck, 
  Activity, 
  Languages, 
  AlertTriangle,
  Monitor
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 h-[68px] bg-white/95 backdrop-blur-md border-b border-slate-200 z-50 flex items-center justify-between px-4 sm:px-8 shadow-xs">
      {/* Brand logo */}
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-teal-700 text-white flex items-center justify-center shadow-sm group-hover:bg-teal-800 transition-colors">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-slate-900">
                MediKiosk
              </span>
              <span className="text-[10px] uppercase font-extrabold tracking-widest px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                SIH 2026
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              AI Patient Intake & Document Digitization
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation role switcher */}
      <nav className="hidden md:flex items-center gap-1 p-1 bg-slate-100 rounded-2xl border border-slate-200">
        <Link
          href="/kiosk"
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            pathname.startsWith("/kiosk")
              ? "bg-white text-teal-900 shadow-xs border border-slate-200/80"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
          }`}
        >
          <User className="w-3.5 h-3.5 text-teal-700" />
          Patient Kiosk
        </Link>

        <Link
          href="/doctor"
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all relative ${
            pathname.startsWith("/doctor")
              ? "bg-white text-teal-900 shadow-xs border border-slate-200/80"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
          }`}
        >
          <Stethoscope className="w-3.5 h-3.5 text-teal-700" />
          Doctor Console
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
          </span>
        </Link>

        <Link
          href="/display"
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            pathname.startsWith("/display")
              ? "bg-white text-teal-900 shadow-xs border border-slate-200/80"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
          }`}
        >
          <Monitor className="w-3.5 h-3.5 text-slate-700" />
          Waiting Room TV
        </Link>

        <Link
          href="/admin"
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            pathname.startsWith("/admin")
              ? "bg-white text-teal-900 shadow-xs border border-slate-200/80"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-slate-700" />
          Hospital Admin
        </Link>
      </nav>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Triage Alert Badge */}
        <Link
          href="/doctor"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold hover:bg-red-100 transition-all shadow-xs"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
          <span>Priority Alert: 1 Active</span>
        </Link>

        {/* Engine status indicator */}
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-green-600"></span>
          <span className="hidden sm:inline">AI Engine Online</span>
        </div>

        {/* Multilingual Pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium">
          <Languages className="w-3.5 h-3.5 text-teal-700" />
          <span className="text-[11px] font-bold">EN / हिं / ಕನ್ನ</span>
        </div>
      </div>
    </header>
  );
}
