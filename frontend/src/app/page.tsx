"use client";

import Link from "next/link";
import { 
  Activity, 
  Stethoscope, 
  User, 
  ShieldCheck, 
  Clock, 
  TrendingUp, 
  FileText, 
  Languages, 
  ArrowRight, 
  Monitor, 
  CheckCircle2, 
  AlertTriangle,
  Sparkles,
  Zap,
  HeartHandshake,
  Shield,
  Layers,
  ChevronRight,
  Database
} from "lucide-react";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <div className="min-h-screen mesh-gradient-hero text-slate-900 flex flex-col font-sans selection:bg-teal-500/20 selection:text-teal-900">
      <Navbar />

      <main className="flex-1 pt-24 pb-24 px-4 sm:px-8 max-w-7xl mx-auto w-full flex flex-col gap-12">
        {/* Hospital Hero Showcase */}
        <section className="relative overflow-hidden rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200/80 p-8 sm:p-14 shadow-lg shadow-teal-950/5">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-teal-400/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 rounded-full bg-sky-400/10 blur-3xl pointer-events-none" />

          <div className="relative max-w-4xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse"></span>
              Smart India Hackathon 2026 • Problem Statement ID: 26047
            </div>

            <h1 className="text-3xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
              AI-Powered Patient Intake &{" "}
              <span className="bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 bg-clip-text text-transparent">
                Clinical Digitization
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 font-normal leading-relaxed max-w-3xl">
              Engineered for high-density Indian hospital OPDs. Enables elderly and vernacular patients to complete clinical history taking through natural voice or touch, digitizes handwritten prescriptions via OCR, and presents verified case summaries to physicians.
            </p>

            {/* Protocol badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-semibold text-slate-600">
              <span className="px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" /> SOCRATES Clinical Protocol
              </span>
              <span className="px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" /> AYUSH Dashavidha Pariksha
              </span>
              <span className="px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" /> ABHA / ABDM Milestone 1 & 2
              </span>
              <span className="px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" /> DPDP Act (2023) Compliant
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-3">
              <Link
                href="/kiosk"
                className="btn-kiosk-primary"
              >
                <User className="w-5 h-5" />
                Launch Patient Kiosk
                <ArrowRight className="w-5 h-5" />
              </Link>

              <Link
                href="/doctor"
                className="btn-kiosk-secondary"
              >
                <Stethoscope className="w-5 h-5 text-teal-700" />
                Open Doctor Console
                <span className="ml-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[11px] font-extrabold">
                  1 STAT Alert
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* 4 Core Clinical Metrics */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-6 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-teal-500/40 transition-all space-y-2 group">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Average Intake Time</span>
              <div className="p-2 rounded-xl bg-teal-50 text-teal-700 group-hover:bg-teal-100 transition-colors">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 font-mono">3.8 min</div>
            <p className="text-xs text-slate-500 leading-normal">Reduced from 12+ mins manual OPD paper queue</p>
          </div>

          <div className="p-6 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-teal-500/40 transition-all space-y-2 group">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Doctor Time Saved</span>
              <div className="p-2 rounded-xl bg-teal-50 text-teal-700 group-hover:bg-teal-100 transition-colors">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 font-mono">~62%</div>
            <p className="text-xs text-slate-500 leading-normal">Immediate verified summary ready before consultation</p>
          </div>

          <div className="p-6 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-teal-500/40 transition-all space-y-2 group">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Document OCR Speed</span>
              <div className="p-2 rounded-xl bg-teal-50 text-teal-700 group-hover:bg-teal-100 transition-colors">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 font-mono">&lt; 2.5s</div>
            <p className="text-xs text-slate-500 leading-normal">Auto medication & lab extraction from physical paper</p>
          </div>

          <div className="p-6 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-teal-500/40 transition-all space-y-2 group">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Vernacular Support</span>
              <div className="p-2 rounded-xl bg-teal-50 text-teal-700 group-hover:bg-teal-100 transition-colors">
                <Languages className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 font-mono">13 Langs</div>
            <p className="text-xs text-slate-500 leading-normal">Voice & touch across Indian regional languages</p>
          </div>
        </section>

        {/* 4 Dedicated Healthcare Portals */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Hospital Operations Portals
              </h2>
              <p className="text-sm text-slate-500">
                Four purpose-built environments designed for patients, physicians, waiting bays, and administrators.
              </p>
            </div>
            <span className="text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full self-start">
              All Engines Connected
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Portal 1: Patient Kiosk */}
            <Link
              href="/kiosk"
              className="p-7 bg-white/95 rounded-3xl border border-slate-200/80 hover:border-teal-600 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200 shadow-xs group-hover:scale-105 transition-transform">
                    <User className="w-6 h-6" />
                  </div>
                  <span className="badge-clean badge-clean-primary font-bold">Touch & Voice Kiosk</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                    Patient Self-Service Kiosk
                  </h3>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                    Elderly-friendly guided intake with large touch targets, natural conversational voice recognition, SOCRATES symptom exploration, and prescription scanning.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-teal-600" /> ABHA QR Login</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-teal-600" /> Voice Intake Waveform</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-teal-600" /> AYUSH 10-Fold Matrix</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-teal-600" /> Thermal Token Generation</span>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-sm font-bold text-teal-700">
                <span>Start patient intake flow</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </Link>

            {/* Portal 2: Doctor Workstation */}
            <Link
              href="/doctor"
              className="p-7 bg-[#0a0f1d] text-white rounded-3xl border border-white/10 hover:border-teal-500/50 shadow-md hover:shadow-2xl hover:shadow-teal-950/40 transition-all duration-300 group flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30 shadow-xs group-hover:scale-105 transition-transform">
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-black uppercase tracking-wider flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-400 animate-ping"></span>
                    Priority Triage
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-teal-300 transition-colors">
                    Physician OPD Console
                  </h3>
                  <p className="text-sm text-slate-300 mt-1 leading-relaxed">
                    Obsidian dark glassmorphic command center with focused tabbed diagnostic studio, live HTML5 ECG oscilloscope, OCR prescription verification, and chamber calling.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 text-xs text-slate-400 font-mono">
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-teal-400" /> Live Triage Queue</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-teal-400" /> HTML5 ECG Monitor</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-teal-400" /> OCR Entity Verification</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-teal-400" /> 1-Click Chamber Bell</span>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-sm font-bold text-teal-400">
                <span>Open physician diagnostic desk</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </Link>

            {/* Portal 3: Waiting Room TV */}
            <Link
              href="/display"
              className="p-7 bg-[#060a14] text-white rounded-3xl border border-white/10 hover:border-teal-500/50 shadow-md hover:shadow-2xl transition-all duration-300 group flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 text-teal-400 flex items-center justify-center border border-white/10 shadow-xs group-hover:scale-105 transition-transform">
                    <Monitor className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs font-semibold">
                    Airport Departure Style
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-teal-300 transition-colors">
                    OPD Waiting Room TV Board
                  </h3>
                  <p className="text-sm text-slate-300 mt-1 leading-relaxed">
                    Full-screen high-contrast departure board for OPD waiting areas with token call overlays, procedural chimes, and multilingual voice broadcasts.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 text-xs text-slate-400 font-mono">
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-teal-400" /> Full-Screen Departure Grid</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-teal-400" /> Animated Calling Flash</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-teal-400" /> Multilingual Announcements</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-teal-400" /> Code Blue Emergency Bar</span>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-sm font-bold text-teal-400">
                <span>Launch Waiting Room Display</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </Link>

            {/* Portal 4: Hospital Admin */}
            <Link
              href="/admin"
              className="p-7 bg-[#0a0f1d] text-white rounded-3xl border border-white/10 hover:border-teal-500/50 shadow-md hover:shadow-2xl transition-all duration-300 group flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 text-teal-400 flex items-center justify-center border border-white/10 shadow-xs group-hover:scale-105 transition-transform">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-bold">
                    DPDP Act & Rules Engine
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-teal-300 transition-colors">
                    Hospital Administration & Audit
                  </h3>
                  <p className="text-sm text-slate-300 mt-1 leading-relaxed">
                    Real-time clinical red-flag rules engine management, hospital event telemetry stream, and immutable DPDP Act (2023) compliance audit log export.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 text-xs text-slate-400 font-mono">
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-teal-400" /> Triage Rules Config</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-teal-400" /> Live Audit Log Table</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-teal-400" /> JSON Event Inspector</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-teal-400" /> SIH Evaluator Simulation</span>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-sm font-bold text-teal-400">
                <span>Open Governance Console</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </Link>
          </div>
        </section>

        {/* Clinical Pipeline Walkthrough */}
        <section className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/80 p-8 sm:p-10 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                End-to-End Hospital Intake Pipeline
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                From self-intake in vernacular language to physician verification in under 4 minutes.
              </p>
            </div>
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              Deterministic & Traceable
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <span className="text-xs font-mono font-bold text-teal-700">01. PATIENT INTAKE</span>
              <h4 className="font-bold text-slate-900 text-sm">Multilingual Voice / Touch</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Speech recognition across 13 Indian languages with fallback touch tiles and ABHA OTP login.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <span className="text-xs font-mono font-bold text-teal-700">02. CLINICAL PROTOCOL</span>
              <h4 className="font-bold text-slate-900 text-sm">SOCRATES & AYUSH</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Structured pain mapping (Site, Onset, Character, Radiation) and 10-fold Dashavidha Prakriti matrix.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <span className="text-xs font-mono font-bold text-teal-700">03. PRESCRIPTION OCR</span>
              <h4 className="font-bold text-slate-900 text-sm">Document Digitization</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Sub-2.5s laser vision extraction of past prescriptions, dosages, and historical lab reports.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <span className="text-xs font-mono font-bold text-teal-700">04. PHYSICIAN APPROVAL</span>
              <h4 className="font-bold text-slate-900 text-sm">Verifiable OPD Console</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Physician verifies and modifies AI findings with full source bounding box audit traceability.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
