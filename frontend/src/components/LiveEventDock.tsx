"use client";

import { useState, useEffect } from "react";
import { 
  Radio, 
  AlertTriangle, 
  Volume2, 
  VolumeX, 
  ChevronUp, 
  ChevronDown, 
  Zap, 
  FileText, 
  Heart, 
  BellRing, 
  ShieldAlert, 
  Clock, 
  Terminal,
  Activity,
  CheckCircle2,
  Trash2,
  Sparkles
} from "lucide-react";
import { hospitalEventBus, HospitalEvent } from "@/lib/events";

export default function LiveEventDock() {
  const [isOpen, setIsOpen] = useState(false);
  const [events, setEvents] = useState<HospitalEvent[]>([]);
  const [latestEvent, setLatestEvent] = useState<HospitalEvent | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);

  useEffect(() => {
    setEvents(hospitalEventBus.getHistory());
    setIsMuted(hospitalEventBus.getMuted());

    // Subscribe to all events
    const unsubscribe = hospitalEventBus.on("*", (event) => {
      setLatestEvent(event);
      setEvents((prev) => [event, ...prev].slice(0, 50));

      setIsFlashing(true);
      setTimeout(() => setIsFlashing(false), 900);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const toggleMute = () => {
    const muted = hospitalEventBus.toggleMute();
    setIsMuted(muted);
  };

  const clearHistory = () => {
    hospitalEventBus.clearHistory();
    setEvents([]);
    setLatestEvent(null);
  };

  // Event Simulation Handlers for judges/evaluators
  const triggerEmergencyACS = () => {
    hospitalEventBus.emit(
      "RED_FLAG_TRIGGERED",
      {
        rule_id: "RF_001",
        rule_name: "Potential Acute Coronary Syndrome (ACS / MI)",
        patient_name: "Ramesh Sharma (52M)",
        token: "OPD-042",
        symptoms: ["Severe retrosternal chest pain", "Left arm radiation", "Dyspnea", "Severity 9/10"],
        recommended_action: "STAT 12-lead ECG, Sublingual Nitrate, Immediate Triage Room 4",
      },
      "RULE_ENGINE",
      "CRITICAL"
    );
  };

  const triggerCallPatient = () => {
    hospitalEventBus.emit(
      "DOCTOR_CALLED_PATIENT",
      {
        token: "OPD-042",
        patient_name: "Ramesh Sharma",
        room: "Chamber 4",
        doctor: "Dr. Priya Deshmukh, MD",
      },
      "DOCTOR",
      "WARNING"
    );
  };

  const triggerOCRStream = () => {
    hospitalEventBus.emit("OCR_SCAN_STARTED", { filename: "Apollo_Rx_Nov2025.jpg" }, "OCR_VISION", "NORMAL");
    setTimeout(() => {
      hospitalEventBus.emit(
        "OCR_ENTITIES_EXTRACTED",
        {
          filename: "Apollo_Rx_Nov2025.jpg",
          entities: [
            { type: "medication", value: "Tab. Atorvastatin 20mg", confidence: 0.98 },
            { type: "medication", value: "Tab. Metoprolol 25mg", confidence: 0.96 },
            { type: "diagnosis", value: "Essential Hypertension", confidence: 0.94 },
          ],
        },
        "OCR_VISION",
        "NORMAL"
      );
    }, 900);
  };

  const triggerCodeBlue = () => {
    hospitalEventBus.emit(
      "CODE_BLUE_TRIGGERED",
      {
        location: "OPD Waiting Bay 2",
        reason: "Cardiac / Respiratory Arrest Alert",
        timestamp: new Date().toLocaleTimeString(),
      },
      "SYSTEM",
      "CRITICAL"
    );
  };

  const triggerTachycardiaVitals = () => {
    hospitalEventBus.emit(
      "VITALS_TICK",
      {
        heartRate: 148,
        bloodPressure: "165/105",
        spO2: 91,
        status: "TACHYCARDIA_SPIKE",
      },
      "PATIENT",
      "WARNING"
    );
  };

  return (
    <aside aria-label="Event-Driven Operations Bus" className="fixed bottom-4 right-4 sm:right-6 z-50 max-w-xl w-full px-2 sm:px-0">
      {/* Floating Header Pill */}
      <div
        className={`flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl border transition-all duration-300 shadow-2xl backdrop-blur-2xl ${
          isFlashing
            ? "bg-teal-950/90 border-teal-400 shadow-teal-500/40 scale-[1.02]"
            : "bg-[#080d1a]/90 border-white/15 hover:border-teal-500/50"
        }`}
      >
        {/* Left Status & Ticker */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2.5 flex-1 cursor-pointer overflow-hidden group"
        >
          <div className="relative shrink-0 flex items-center justify-center">
            <Radio className="w-4 h-4 text-teal-400 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          </div>

          <div className="flex flex-col truncate">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-black tracking-widest text-teal-300 flex items-center gap-1">
                TELEMETRY BUS
                <Sparkles className="w-2.5 h-2.5 text-amber-400" />
              </span>
              <span className="px-1.5 py-0.2 rounded-full bg-teal-500/20 text-teal-300 text-[9px] font-mono font-bold border border-teal-500/30">
                {events.length} Events
              </span>
            </div>
            <span className="text-[11px] text-slate-300 truncate font-mono">
              {latestEvent
                ? `${latestEvent.type} [${latestEvent.actor}]`
                : "Real-time Event Engine Ready"}
            </span>
          </div>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={toggleMute}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-all border border-white/5"
            title={isMuted ? "Unmute Hospital Chimes" : "Mute Sound"}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-teal-400" />}
          </button>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-all border border-white/5"
            title="Toggle Event Drawer"
          >
            {isOpen ? <ChevronDown className="w-4 h-4 text-teal-400" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Event Drawer */}
      {isOpen && (
        <div className="mt-2.5 p-4 rounded-3xl bg-[#080d1a]/95 border border-teal-500/30 shadow-2xl backdrop-blur-3xl space-y-4 max-h-[520px] overflow-hidden flex flex-col">
          {/* Quick Simulation Trigger Buttons */}
          <div className="space-y-2 pb-3 border-b border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" />
                Live Telemetry Injector (Interactive Evaluation):
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={triggerEmergencyACS}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-950/60 hover:bg-red-900/60 border border-red-500/40 text-red-300 text-[10px] font-bold transition-all text-left truncate shadow-sm hover:scale-[1.02]"
              >
                <AlertTriangle className="w-3 h-3 text-red-400 shrink-0" />
                <span>🚨 Trigger ACS Alarm</span>
              </button>

              <button
                type="button"
                onClick={triggerCallPatient}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-950/60 hover:bg-teal-900/60 border border-teal-500/40 text-teal-300 text-[10px] font-bold transition-all text-left truncate shadow-sm hover:scale-[1.02]"
              >
                <BellRing className="w-3 h-3 text-teal-400 shrink-0" />
                <span>📢 Call Token OPD-042</span>
              </button>

              <button
                type="button"
                onClick={triggerOCRStream}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 text-[10px] font-bold transition-all text-left truncate shadow-sm hover:scale-[1.02]"
              >
                <FileText className="w-3 h-3 text-cyan-400 shrink-0" />
                <span>📄 Stream Rx OCR</span>
              </button>

              <button
                type="button"
                onClick={triggerTachycardiaVitals}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-950/60 hover:bg-amber-900/60 border border-amber-500/40 text-amber-300 text-[10px] font-bold transition-all text-left truncate shadow-sm hover:scale-[1.02]"
              >
                <Heart className="w-3 h-3 text-amber-400 shrink-0" />
                <span>💓 Tachycardia (HR 148)</span>
              </button>

              <button
                type="button"
                onClick={triggerCodeBlue}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-500/40 text-indigo-300 text-[10px] font-bold transition-all text-left truncate shadow-sm hover:scale-[1.02]"
              >
                <ShieldAlert className="w-3 h-3 text-indigo-400 shrink-0" />
                <span>⚡ Code Blue Broadcast</span>
              </button>

              <button
                type="button"
                onClick={clearHistory}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white text-[10px] font-bold transition-all text-left truncate shadow-sm"
              >
                <Trash2 className="w-3 h-3 shrink-0" />
                <span>Clear History</span>
              </button>
            </div>
          </div>

          {/* Rolling Event Stream List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[290px] custom-scrollbar-dark">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase pb-1">
              <span>Real-Time Stream ({events.length})</span>
              <span>Actor & Severity</span>
            </div>

            {events.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                No events recorded yet. Interact with the Kiosk or click an injector above.
              </div>
            ) : (
              events.map((evt) => (
                <div
                  key={evt.id}
                  className={`p-3 rounded-xl border text-xs font-mono transition-all ${
                    evt.severity === "CRITICAL"
                      ? "bg-red-950/50 border-red-500/40 text-red-200 shadow-red-950/20 shadow-md"
                      : evt.severity === "WARNING"
                      ? "bg-amber-950/40 border-amber-500/40 text-amber-200"
                      : "bg-[#0b1220]/70 border-white/10 text-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-[10px] text-slate-500">
                        {new Date(evt.timestamp).toLocaleTimeString()}
                      </span>
                      <span className="font-bold text-white truncate">{evt.type}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold border shrink-0 ${
                      evt.severity === "CRITICAL"
                        ? "bg-red-900/60 text-red-300 border-red-500/40"
                        : "bg-white/5 text-teal-400 border-teal-500/30"
                    }`}>
                      {evt.actor}
                    </span>
                  </div>

                  {evt.payload && (
                    <div className="mt-1.5 text-[11px] text-slate-400 truncate opacity-90">
                      {typeof evt.payload === "string"
                        ? evt.payload
                        : JSON.stringify(evt.payload).substring(0, 95) + "..."}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
