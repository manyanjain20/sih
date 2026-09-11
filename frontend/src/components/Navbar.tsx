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
  Monitor,
  Sparkles,
  Radio
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const isDark = pathname.startsWith("/doctor") || pathname.startsWith("/display") || pathname.startsWith("/admin");

  return (
    <header className={`fixed top-0 left-0 right-0 h-[68px] z-50 flex items-center justify-between px-4 sm:px-8 transition-colors duration-200 ${
      isDark
        ? "bg-[#030712]/80 backdrop-blur-xl border-b border-white/10 text-white"
        : "bg-white/80 backdrop-blur-xl border-b border-slate-200/80 text-slate-900 shadow-xs"
    }`}>
      {/* Brand logo */}
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-3 group">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm transition-all duration-300 ${
            isDark 
              ? "bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-teal-500/20 shadow-lg group-hover:scale-105" 
              : "bg-teal-700 text-white group-hover:bg-teal-800"
          }`}>
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-xl font-extrabold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                MediKiosk
              </span>
              <span className={`text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded-full border ${
                isDark
                  ? "bg-teal-500/10 text-teal-400 border-teal-500/30"
                  : "bg-teal-50 text-teal-800 border-teal-200"
              }`}>
                SIH 2026
              </span>
            </div>
            <p className={`text-[11px] font-medium hidden sm:block ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              AI Patient Intake & Clinical Verification
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation role switcher */}
      <nav className={`hidden md:flex items-center gap-1 p-1 rounded-2xl border transition-all ${
        isDark
          ? "bg-slate-900/90 border-white/10"
          : "bg-slate-100/90 border-slate-200"
      }`}>
        <Link
          href="/kiosk"
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            pathname.startsWith("/kiosk")
              ? isDark 
                ? "bg-teal-600 text-white shadow-sm" 
                : "bg-white text-teal-900 shadow-xs border border-slate-200/80"
              : isDark
                ? "text-slate-300 hover:text-white hover:bg-white/5"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
          }`}
        >
          <User className="w-3.5 h-3.5 text-teal-500" />
          Patient Kiosk
        </Link>

        <Link
          href="/doctor"
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all relative ${
            pathname.startsWith("/doctor")
              ? isDark
                ? "bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm"
                : "bg-white text-teal-900 shadow-xs border border-slate-200/80"
              : isDark
                ? "text-slate-300 hover:text-white hover:bg-white/5"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
          }`}
        >
          <Stethoscope className="w-3.5 h-3.5 text-teal-400" />
          Doctor Console
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
        </Link>

        <Link
          href="/display"
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            pathname.startsWith("/display")
              ? isDark
                ? "bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm"
                : "bg-white text-teal-900 shadow-xs border border-slate-200/80"
              : isDark
                ? "text-slate-300 hover:text-white hover:bg-white/5"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
          }`}
        >
          <Monitor className="w-3.5 h-3.5 text-slate-400" />
          Waiting Room TV
        </Link>

        <Link
          href="/admin"
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            pathname.startsWith("/admin")
              ? isDark
                ? "bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm"
                : "bg-white text-teal-900 shadow-xs border border-slate-200/80"
              : isDark
                ? "text-slate-300 hover:text-white hover:bg-white/5"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
          Hospital Admin
        </Link>
      </nav>

      {/* Right controls */}
      <div className="flex items-center gap-2.5">
        {/* Triage Alert Badge */}
        <Link
          href="/doctor"
          className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            isDark
              ? "bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25"
              : "bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 shadow-xs"
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-red-500 animate-pulse" />
          <span>STAT Alert: 1 Active</span>
        </Link>

        {/* Engine status indicator */}
        <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-semibold border ${
          isDark
            ? "bg-slate-900/80 border-white/10 text-slate-300"
            : "bg-slate-50 border-slate-200 text-slate-700"
        }`}>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="hidden lg:inline text-[11px]">AI Engine Online</span>
        </div>

        {/* Multilingual Pill */}
        <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border ${
          isDark
            ? "bg-slate-900/80 border-white/10 text-slate-300"
            : "bg-slate-50 border-slate-200 text-slate-700"
        }`}>
          <Languages className="w-3.5 h-3.5 text-teal-500" />
          <span className="text-[11px] font-bold">13 Langs</span>
        </div>
      </div>
    </header>
  );
}
