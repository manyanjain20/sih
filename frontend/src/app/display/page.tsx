"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Activity, 
  BellRing, 
  Clock, 
  Users, 
  AlertTriangle, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  ArrowLeft,
  CheckCircle2,
  Stethoscope,
  Sparkles,
  ShieldCheck,
  Flame,
  Radio
} from "lucide-react";
import { hospitalEventBus, HospitalEvent } from "@/lib/events";
import { fetchDoctorQueue } from "@/lib/api";
import { IntakeSession } from "@/lib/types";

export default function PublicDisplayPage() {
  const [callingToken, setCallingToken] = useState<{
    token: string;
    patient_name: string;
    room: string;
    doctor: string;
    time: string;
  }>({
    token: "OPD-042",
    patient_name: "Ramesh Sharma",
    room: "Consultation Chamber 4",
    doctor: "Dr. Priya Deshmukh, MD",
    time: "Just Now",
  });

  const [queue, setQueue] = useState<IntakeSession[]>([]);
  const [isCallingFlash, setIsCallingFlash] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>("");
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    // Clock tick
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    }, 1000);

    // Initial queue load
    fetchDoctorQueue().then((data) => setQueue(data));

    // Listen for DOCTOR_CALLED_PATIENT
    const unsubCall = hospitalEventBus.on("DOCTOR_CALLED_PATIENT", (evt) => {
      if (evt.payload) {
        setCallingToken({
          token: evt.payload.token || "OPD-042",
          patient_name: evt.payload.patient_name || "Patient",
          room: evt.payload.room || "Chamber 4",
          doctor: evt.payload.doctor || "Consulting Physician",
          time: new Date().toLocaleTimeString(),
        });

        setIsCallingFlash(true);
        setTimeout(() => setIsCallingFlash(false), 7000);
      }
    });

    // Listen for new patient intake to update queue reactively
    const unsubIntake = hospitalEventBus.on("INTAKE_COMPLETED", () => {
      fetchDoctorQueue().then((data) => setQueue(data));
    });

    return () => {
      clearInterval(timer);
      unsubCall();
      unsubIntake();
    };
  }, []);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const playChimeManually = () => {
    hospitalEventBus.playHospitalChime();
    hospitalEventBus.speakAnnouncement(`Attention please. Token ${callingToken.token}, ${callingToken.patient_name}, please proceed to Consultation Chamber 4.`);
  };

  return (
    <div className="min-h-screen bg-[#020611] text-slate-100 flex flex-col p-4 sm:p-8 font-sans selection:bg-teal-500/30 overflow-x-hidden">
      {/* Top TV Header Bar (High-Contrast Departure Style) */}
      <header className="flex items-center justify-between p-4 sm:p-6 rounded-3xl bg-[#090f1e]/90 border border-white/10 shadow-2xl backdrop-blur-xl mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all border border-white/10"
            title="Back to Portals"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-teal-500/20">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  OPD Outpatient Departure Board
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-black uppercase tracking-widest border border-teal-500/40">
                  LIVE DEPARTURES
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 font-medium">
                Wing A • General Medicine, Cardiology & Ayush Integrated Care
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-8">
          <div className="text-right">
            <div className="text-2xl sm:text-4xl font-black font-mono text-teal-300 tracking-wider">
              {currentTime || "10:30:00 AM"}
            </div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block font-mono">
              Hospital Standard Time
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={playChimeManually}
              className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-teal-400 border border-white/10 shadow-md transition-all hover:scale-105"
              title="Repeat Announcement Chime"
            >
              <Volume2 className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={toggleFullScreen}
              className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 shadow-md transition-all hover:scale-105"
              title="Toggle Fullscreen TV Mode"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* CALLING PATIENT TAKEOVER BANNER (Loud Visual Flash on Call) */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border-2 transition-all duration-500 mb-6 shadow-2xl relative overflow-hidden ${
          isCallingFlash
            ? "bg-gradient-to-r from-teal-950 via-emerald-950 to-[#041a1c] border-teal-400 shadow-teal-500/30 scale-[1.01] animate-pulse"
            : "bg-[#0a1224]/80 border-teal-500/30 shadow-teal-950/20"
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-3xl bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0 border border-teal-500/40 relative">
              <BellRing className="w-10 h-10 animate-bounce" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 animate-ping"></span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full bg-teal-500/30 text-teal-300 border border-teal-400/40 animate-pulse">
                  NOW CALLING / अब परामर्श
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Announced at {callingToken.time}
                </span>
              </div>

              <div className="flex items-baseline gap-4 mt-2">
                <span className="text-5xl sm:text-7xl font-black font-mono text-white tracking-tight drop-shadow-md">
                  {callingToken.token}
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-teal-200">
                  {callingToken.patient_name}
                </span>
              </div>
            </div>
          </div>

          {/* Chamber & Doctor Info Box */}
          <div className="flex items-center gap-4 bg-slate-950/70 p-5 rounded-2xl border border-white/10">
            <div className="text-right">
              <span className="text-xs uppercase font-bold text-slate-400 block">
                Proceed To
              </span>
              <span className="text-xl sm:text-2xl font-black text-teal-300 block">
                {callingToken.room}
              </span>
              <span className="text-xs text-slate-400 font-medium block mt-0.5">
                {callingToken.doctor}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
              <Stethoscope className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Bilingual Running Subtitle */}
        <div className="mt-4 pt-3 border-t border-white/10 text-xs sm:text-sm text-teal-300/90 font-medium flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>कृपया ध्यान दें: टोकन {callingToken.token} ({callingToken.patient_name}) तुरंत {callingToken.room} में उपस्थित हों।</span>
        </div>
      </div>

      {/* FULL-SCREEN DEPARTURE BOARD STYLE TABLE */}
      <section className="flex-1 bg-[#070d1c]/90 rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col">
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-300 font-mono">
              Live Consultation Departures Schedule
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Synchronized with Hospital OPD Event Mesh
          </span>
        </div>

        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono">
            <thead>
              <tr className="bg-white/[0.04] border-b border-white/10 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <th className="py-4 px-6">TOKEN</th>
                <th className="py-4 px-6">PATIENT</th>
                <th className="py-4 px-6">CLINIC / DEPT</th>
                <th className="py-4 px-6">CHAMBER</th>
                <th className="py-4 px-6">PHYSICIAN</th>
                <th className="py-4 px-6">STATUS</th>
                <th className="py-4 px-6 text-right">EST. WAIT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {queue.map((session, index) => {
                const isNowCalling = callingToken.token === session.token_number;
                const isStat = session.priority === "high";

                return (
                  <tr
                    key={session.id}
                    className={`transition-colors ${
                      isNowCalling
                        ? "bg-teal-950/40 text-white font-bold"
                        : isStat
                        ? "bg-red-950/20 text-red-200"
                        : "hover:bg-white/[0.02] text-slate-300"
                    }`}
                  >
                    <td className="py-4 px-6">
                      <span className={`text-base font-black px-3 py-1 rounded-xl border ${
                        isNowCalling
                          ? "bg-teal-500/30 text-teal-300 border-teal-400 shadow-sm"
                          : isStat
                          ? "bg-red-900/40 text-red-300 border-red-500/40"
                          : "bg-white/5 text-white border-white/10"
                      }`}>
                        {session.token_number}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-bold text-white text-base">
                      {session.patient_name}
                      <span className="text-xs text-slate-500 font-normal ml-2 font-mono">
                        ({session.patient_age}Y/{session.patient_gender?.[0]})
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-300">
                      General OPD & Cardiology
                    </td>
                    <td className="py-4 px-6 font-bold text-teal-300 text-sm">
                      Chamber 4
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-300">
                      Dr. Priya Deshmukh
                    </td>
                    <td className="py-4 px-6">
                      {isNowCalling ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/30 text-teal-300 text-xs font-black uppercase tracking-wider border border-teal-400">
                          <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping"></span>
                          NOW CALLING
                        </span>
                      ) : isStat ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/30 text-red-300 text-xs font-black uppercase tracking-wider border border-red-500/40">
                          <Flame className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                          PRIORITY STAT
                        </span>
                      ) : session.status === "verified" ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          COMPLETED
                        </span>
                      ) : index === 1 ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                          NEXT IN LINE
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 text-slate-400 text-xs border border-white/10">
                          IN QUEUE
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right font-mono font-bold text-slate-300">
                      {isNowCalling ? (
                        <span className="text-teal-400 font-black">IMMEDIATE</span>
                      ) : (
                        `~${(index + 1) * 6} mins`
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Bottom Telemetry & Emergency Broadcast Ticker */}
      <footer className="mt-6 p-4 rounded-2xl bg-[#090f1e]/80 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30 font-bold uppercase text-[10px]">
            HOSPITAL TICKER
          </span>
          <span className="truncate">
            Please keep your ABHA QR code and physical prescriptions ready when your token is called.
          </span>
        </div>

        <div className="flex items-center gap-4 text-[11px] shrink-0">
          <span>MediKiosk Public Display Engine</span>
          <span className="text-teal-400 font-bold">• 100% On-Premises Telemetry</span>
        </div>
      </footer>
    </div>
  );
}
