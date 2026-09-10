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
  Flame
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
        setTimeout(() => setIsCallingFlash(false), 5000);
      }
    });

    // Listen for new patient intake to update queue reactively
    const unsubIntake = hospitalEventBus.on("INTAKE_COMPLETED", (evt) => {
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
    hospitalEventBus.speakAnnouncement(`Attention please. Token ${callingToken.token}, please proceed to Room 4.`);
  };

  return (
    <div className="min-h-screen bg-[#030914] text-slate-100 flex flex-col p-4 sm:p-8 font-sans selection:bg-cyan-500/30">
      {/* Top TV Header Bar */}
      <header className="flex items-center justify-between p-4 sm:p-6 rounded-3xl bg-slate-950/80 border border-slate-800 shadow-2xl">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-all">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-cyan-500/25">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  MediKiosk OPD Waiting Area Display
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-extrabold uppercase border border-cyan-500/40">
                  LIVE TV BOARD
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 font-medium">
                General Medicine & Cardiology • Ground Floor OPD Wing
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-6">
          <div className="text-right">
            <div className="text-xl sm:text-3xl font-black font-mono text-cyan-300 tracking-wider">
              {currentTime || "10:30:00 AM"}
            </div>
            <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Hospital Standard Time</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={playChimeManually}
              className="p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-800 shadow-md transition-all"
              title="Repeat Announcement Chime"
            >
              <Volume2 className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={toggleFullScreen}
              className="p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 shadow-md transition-all"
              title="Toggle Fullscreen TV Mode"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Waiting Board Grid */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 my-6">
        {/* Left 7 Columns: HUGE "NOW CALLING" Display */}
        <section className="lg:col-span-7 flex flex-col justify-between p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-slate-900/95 via-[#081829] to-[#040e1a] border border-cyan-500/40 shadow-2xl relative overflow-hidden">
          {/* Ambient Spotlight */}
          <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-gradient-to-bl from-cyan-500/15 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs sm:text-sm font-black uppercase tracking-widest">
              <BellRing className="w-4 h-4 animate-bounce" />
              NOW CALLING / रोगी बुलावा
            </div>

            <div className={`p-8 sm:p-12 rounded-3xl border text-center transition-all duration-500 ${
              isCallingFlash
                ? "bg-cyan-950/80 border-cyan-300 shadow-2xl shadow-cyan-500/50 scale-[1.02] ring-8 ring-cyan-500/30"
                : "bg-slate-950/90 border-slate-800 shadow-xl"
            }`}>
              <span className="text-xs sm:text-sm text-slate-400 font-bold uppercase tracking-widest block">
                Token Number
              </span>
              <div className="text-6xl sm:text-8xl lg:text-9xl font-black tracking-tight text-white my-3 font-mono drop-shadow-2xl">
                {callingToken.token}
              </div>
              <div className="text-lg sm:text-2xl font-bold text-cyan-300">
                {callingToken.patient_name}
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 relative z-10">
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-xl bg-cyan-500/20 text-cyan-300">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-bold uppercase block">Destination Chamber</span>
                <span className="text-base sm:text-xl font-black text-white">{callingToken.room}</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 font-bold uppercase block">Consulting Physician</span>
              <span className="text-sm sm:text-base font-bold text-teal-300">{callingToken.doctor}</span>
            </div>
          </div>
        </section>

        {/* Right 5 Columns: Waiting Queue & Emergency Triage Indicator */}
        <section className="lg:col-span-5 flex flex-col gap-5">
          {/* Emergency Triage Status Box */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-red-950/60 to-slate-900/90 border border-red-500/40 shadow-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-red-500/20 text-red-400 animate-pulse">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-extrabold text-red-300 uppercase tracking-wider block">
                  Priority Red Flag Emergency Triage
                </span>
                <span className="text-sm font-bold text-white">
                  1 Critical Alert Active (ACS Chest Pain Case)
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-red-500/20 text-red-300 text-xs font-black border border-red-500/40">
              PRIORITY 1
            </span>
          </div>

          {/* Queue List */}
          <div className="flex-1 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-cyan-400" />
                  Upcoming In Queue
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  Approx Wait: ~6 mins
                </span>
              </div>

              <div className="space-y-2.5 mt-3">
                {queue.map((pt, idx) => (
                  <div
                    key={pt.id || idx}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/90 hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center font-mono font-bold text-xs text-cyan-300">
                        #{idx + 1}
                      </span>
                      <div>
                        <span className="text-sm font-bold text-white block">
                          {pt.patient_name}
                        </span>
                        <span className="text-xs text-slate-400">
                          {pt.token_number} • {pt.patient_age}Y/{pt.patient_gender}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border flex items-center gap-1 ${
                        pt.priority === "high"
                          ? "bg-red-500/20 text-red-300 border-red-500/40 animate-pulse"
                          : "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                      }`}
                    >
                      {pt.priority === "high" ? (
                        <>
                          <Flame className="w-3 h-3 text-red-400" />
                          <span>STAT PRIORITY</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>NORMAL</span>
                        </>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Audio/TTS Guidance Banner */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Token numbers are announced automatically in English and Hindi when called by the physician.</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
