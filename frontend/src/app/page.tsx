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
  AlertTriangle
} from "lucide-react";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pt-24 pb-16 px-4 sm:px-8 max-w-6xl mx-auto w-full flex flex-col gap-12">
        {/* Hospital Hero Section */}
        <section className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-14 shadow-xs">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold">
              Smart India Hackathon 2026 • Problem Statement ID: 26047
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              AI-Powered Patient Intake & Medical Document Digitization
            </h1>

            <p className="text-lg text-slate-600 font-medium leading-relaxed">
              Designed for high-volume Indian hospital OPDs. Enables elderly and vernacular patients to complete clinical history taking through natural voice or touch, digitizes physical prescriptions via OCR, and presents verified case summaries to physicians.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
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
              </Link>
            </div>
          </div>
        </section>

        {/* 4 Core Clinical Metrics */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Average Intake Time</span>
              <Clock className="w-4 h-4 text-teal-700" />
            </div>
            <div className="text-3xl font-black text-slate-900 font-mono">3.8 min</div>
            <p className="text-xs text-slate-500">Down from 12 mins manual paper intake</p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Doctor Time Saved</span>
              <TrendingUp className="w-4 h-4 text-teal-700" />
            </div>
            <div className="text-3xl font-black text-slate-900 font-mono">~62%</div>
            <p className="text-xs text-slate-500">More time for clinical examination</p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Document OCR Speed</span>
              <FileText className="w-4 h-4 text-teal-700" />
            </div>
            <div className="text-3xl font-black text-slate-900 font-mono">&lt; 2.5s</div>
            <p className="text-xs text-slate-500">Automated medication extraction</p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Vernacular Support</span>
              <Languages className="w-4 h-4 text-teal-700" />
            </div>
            <div className="text-3xl font-black text-slate-900 font-mono">13 Langs</div>
            <p className="text-xs text-slate-500">Voice & touch across Indian languages</p>
          </div>
        </section>

        {/* 4 Dedicated Healthcare Portals */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            MediKiosk Hospital Portals
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Portal 1: Patient Kiosk */}
            <Link
              href="/kiosk"
              className="p-6 bg-white rounded-2xl border border-slate-200 hover:border-teal-600 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200">
                    <User className="w-5 h-5" />
                  </div>
                  <span className="badge-clean badge-clean-primary">Touch / Voice Kiosk</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-800 transition-colors">
                  Patient Self-Service Kiosk
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Elderly-friendly guided intake with large touch targets, natural conversational voice recognition, SOCRATES symptom exploration, and prescription scanning.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-teal-700">
                <span>Start patient intake flow</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Portal 2: Doctor Workstation */}
            <Link
              href="/doctor"
              className="p-6 bg-white rounded-2xl border border-slate-200 hover:border-teal-600 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <span className="badge-clean badge-clean-danger">Priority Triage</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-800 transition-colors">
                  Physician OPD Console
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Information-dense clinical workstation with priority triage queue, verifiable AI structured history, traceable source evidence, and chamber calling.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-teal-700">
                <span>Open doctor examination desk</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Portal 3: Waiting Room TV */}
            <Link
              href="/display"
              className="p-6 bg-white rounded-2xl border border-slate-200 hover:border-teal-600 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
                    <Monitor className="w-5 h-5" />
                  </div>
                  <span className="badge-clean badge-clean-neutral">Public Display</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-800 transition-colors">
                  OPD Waiting Room TV Board
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  High-visibility public display for token calling with realistic procedural hospital chimes and bilingual voice announcements.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700">
                <span>View TV board</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Portal 4: Hospital Admin */}
            <Link
              href="/admin"
              className="p-6 bg-white rounded-2xl border border-slate-200 hover:border-teal-600 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className="badge-clean badge-clean-neutral">DPDP & Governance</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-800 transition-colors">
                  Hospital Administration & Audit
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Clinical red-flag rules engine management, hospital event telemetry, and immutable DPDP Act (2023) compliance audit log export.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Open admin console</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
