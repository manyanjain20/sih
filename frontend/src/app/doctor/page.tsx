"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Stethoscope, 
  Users, 
  Clock, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  FileText, 
  Activity, 
  Calendar, 
  Pill, 
  TestTube, 
  History, 
  Edit3, 
  Save, 
  Printer, 
  Search, 
  Check, 
  ChevronRight,
  Filter,
  Flame,
  LayoutDashboard,
  FolderOpen,
  Settings,
  BellRing,
  User,
  ArrowRight,
  Eye,
  CheckCheck,
  Sparkles,
  Heart,
  Radio,
  FileCheck,
  Zap,
  Send
} from "lucide-react";
import Navbar from "@/components/Navbar";
import RedFlagBanner from "@/components/RedFlagBanner";
import MedicalTimeline from "@/components/MedicalTimeline";
import LiveVitalsOscilloscope from "@/components/LiveVitalsOscilloscope";
import DashavidhaRadar from "@/components/DashavidhaRadar";
import { fetchDoctorQueue, acknowledgeRedFlag, verifyDoctorSummary } from "@/lib/api";
import { hospitalEventBus } from "@/lib/events";
import { IntakeSession, ClinicalEntity } from "@/lib/types";

export default function DoctorConsolePage() {
  const [queue, setQueue] = useState<IntakeSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>("sess-101");
  const [activeTab, setActiveTab] = useState<"overview" | "socrates_ayush" | "ocr_records" | "rx_notes">("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [isCalling, setIsCalling] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [doctorNotes, setDoctorNotes] = useState(
    "Patient presenting with classic retrosternal angina radiating to left arm. Advised STAT 12-lead ECG, Troponin-I, sublingual nitrates, and immediate cardiology referral."
  );

  // Editable clinical entities state for Doctor Verification
  const [verifiedEntities, setVerifiedEntities] = useState<Record<string, { value: string; isVerified: boolean }>>({
    med_1: { value: "Tab. Atorvastatin 20mg - 1 OD HS", isVerified: false },
    med_2: { value: "Tab. Metoprolol Tartrate 25mg - 1 BD", isVerified: false },
    med_3: { value: "Tab. Aspirin 75mg - 1 OD PC", isVerified: false },
    inv_1: { value: "Total Cholesterol: 242 mg/dL", isVerified: false },
    inv_2: { value: "LDL Cholesterol: 162 mg/dL", isVerified: false },
  });
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [tempEditValue, setTempEditValue] = useState("");

  useEffect(() => {
    async function load() {
      const data = await fetchDoctorQueue();
      setQueue(data);
      if (data.length > 0 && !selectedSessionId) {
        setSelectedSessionId(data[0].id);
      }
    }
    load();

    const unsubIntake = hospitalEventBus.on("INTAKE_COMPLETED", () => {
      fetchDoctorQueue().then((data) => setQueue(data));
    });

    const unsubRf = hospitalEventBus.on("RED_FLAG_TRIGGERED", () => {
      fetchDoctorQueue().then((data) => setQueue(data));
    });

    return () => {
      unsubIntake();
      unsubRf();
    };
  }, [selectedSessionId]);

  const selectedSession = queue.find((s) => s.id === selectedSessionId) || queue[0];

  const handleCallPatient = () => {
    if (!selectedSession) return;
    setIsCalling(true);
    hospitalEventBus.emit("DOCTOR_CALLED_PATIENT", {
      token: selectedSession.token_number,
      patient_name: selectedSession.patient_name,
      room: "Consultation Chamber 4",
      doctor: "Dr. Priya Deshmukh, MD",
    });
    hospitalEventBus.playHospitalChime();
    hospitalEventBus.speakAnnouncement(
      `Attention please. Token ${selectedSession.token_number}, ${selectedSession.patient_name}, please proceed to Consultation Chamber 4.`
    );
    setTimeout(() => setIsCalling(false), 2000);
  };

  const handleVerifyCase = async () => {
    if (!selectedSession) return;
    await verifyDoctorSummary(selectedSession.id, doctorNotes, "Dr. Priya Deshmukh");
    setIsVerified(true);
    setVerifiedEntities((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((k) => (updated[k].isVerified = true));
      return updated;
    });
  };

  const handleSaveEntityEdit = (key: string) => {
    setVerifiedEntities((prev) => ({
      ...prev,
      [key]: { value: tempEditValue, isVerified: true },
    }));
    setEditingKey(null);
  };

  const filteredQueue = queue.filter((p) => {
    const matchesSearch =
      (p.patient_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.token_number || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = filterPriority === "all" || p.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  const waitingCount = queue.filter((s) => s.status !== "verified").length;
  const completedCount = queue.filter((s) => s.status === "verified").length;
  const highPriorityCount = queue.filter((s) => s.priority === "high").length;

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col font-sans selection:bg-teal-500/20 selection:text-teal-300">
      <Navbar />

      {/* 2-Pane Focused Tabbed Diagnostic Studio */}
      <div className="flex-1 pt-[68px] flex overflow-hidden">
        {/* PANE 1: Left Compact Priority Queue Sidebar */}
        <aside className="w-80 lg:w-96 bg-[#080d1a] border-r border-white/10 flex flex-col shrink-0">
          {/* Queue Filter & Search Header */}
          <div className="p-4 border-b border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-400" />
                <span className="text-sm font-bold text-white tracking-wide">
                  OPD Triage Queue
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 font-bold">
                  {highPriorityCount} STAT
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/10">
                  {filteredQueue.length} Total
                </span>
              </div>
            </div>

            {/* Search input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patient or token..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-white placeholder:text-slate-500 outline-none focus:border-teal-500"
              />
            </div>

            {/* Priority Quick Filter */}
            <div className="flex items-center gap-1.5 text-[11px] font-bold">
              {[
                { id: "all", label: "All Cases" },
                { id: "high", label: "🚨 STAT High" },
                { id: "medium", label: "🟡 Medium" },
                { id: "normal", label: "🟢 Normal" },
              ].map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setFilterPriority(filter.id)}
                  className={`px-2.5 py-1 rounded-lg transition-all text-[11px] ${
                    filterPriority === filter.id
                      ? "bg-teal-500/20 text-teal-300 border border-teal-500/40"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Scrolling Queue List */}
          <div className="flex-1 overflow-y-auto divide-y divide-white/5 custom-scrollbar-dark">
            {filteredQueue.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No patients found matching current filter.
              </div>
            ) : (
              filteredQueue.map((patient) => {
                const isSelected = selectedSession?.id === patient.id;
                return (
                  <div
                    key={patient.id}
                    onClick={() => setSelectedSessionId(patient.id)}
                    className={`p-3.5 cursor-pointer transition-all ${
                      isSelected
                        ? "bg-teal-950/40 border-l-4 border-l-teal-400 text-white"
                        : "hover:bg-white/[0.03] text-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-slate-900 border border-white/10 text-teal-300">
                          {patient.token_number}
                        </span>
                        <span className="font-bold text-sm text-white truncate max-w-[130px]">
                          {patient.patient_name}
                        </span>
                      </div>

                      {patient.priority === "high" ? (
                        <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 text-[10px] font-black tracking-wider uppercase animate-pulse">
                          STAT
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-mono">
                          {patient.status === "verified" ? "Verified" : "Waiting"}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
                      <span>{patient.patient_age}Y / {patient.patient_gender}</span>
                      <span className="truncate max-w-[180px] text-[11px] text-slate-400">
                        {patient.chief_complaint}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* PANE 2: Right Full-Width Diagnostic Studio */}
        <main className="flex-1 flex flex-col overflow-y-auto custom-scrollbar-dark p-6 space-y-6">
          {/* Header Card: Patient Demographics + Vitals + Actions */}
          {selectedSession && (
            <div className="p-6 rounded-3xl bg-[#0a0f1d]/90 border border-white/10 backdrop-blur-xl shadow-2xl space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left: Patient info */}
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-black font-mono text-teal-400">
                      {selectedSession.token_number}
                    </span>
                    <h2 className="text-2xl font-black text-white">
                      {selectedSession.patient_name}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs font-mono">
                      ABHA: 91-2345-6789-0123
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium">
                    {selectedSession.patient_age} Years • {selectedSession.patient_gender} • {selectedSession.patient_mobile} • Lang: {selectedSession.language_code?.toUpperCase()}
                  </p>
                </div>

                {/* Right: Chamber Calling & Verification Actions */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleCallPatient}
                    disabled={isCalling}
                    className="px-5 py-3 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-extrabold text-sm flex items-center gap-2 shadow-lg shadow-teal-500/20 transition-all hover:scale-105 active:scale-95"
                  >
                    <BellRing className={`w-4 h-4 ${isCalling ? "animate-bounce" : ""}`} />
                    {isCalling ? "Announcing Calling..." : "Call to Chamber 4"}
                  </button>

                  <button
                    type="button"
                    onClick={handleVerifyCase}
                    className={`px-5 py-3 rounded-2xl border font-extrabold text-sm flex items-center gap-2 transition-all ${
                      isVerified
                        ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                        : "bg-white/5 border-white/15 text-slate-200 hover:bg-white/10"
                    }`}
                  >
                    <CheckCheck className="w-4 h-4" />
                    {isVerified ? "Case Verified ✓" : "Sign & Approve"}
                  </button>
                </div>
              </div>

              {/* Vital Signs Live Chips Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 pt-2 border-t border-white/5">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Heart Rate</span>
                  <span className="text-lg font-black text-rose-400 font-mono">98 bpm</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Blood Pressure</span>
                  <span className="text-lg font-black text-white font-mono">142/92 mmHg</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">SpO2 Oxygen</span>
                  <span className="text-lg font-black text-teal-300 font-mono">97% Room Air</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Body Temp</span>
                  <span className="text-lg font-black text-white font-mono">98.6 °F</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Pain Score</span>
                  <span className="text-lg font-black text-amber-400 font-mono">8 / 10 (Severe)</span>
                </div>
              </div>

              {/* Red Flag Warning Alert */}
              {selectedSession.priority === "high" && (
                <div className="p-4 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-200 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
                    <div>
                      <span className="text-xs font-black uppercase tracking-wider text-red-300 bg-red-900/60 px-2 py-0.5 rounded mr-2 border border-red-500/30">
                        CLINICAL RED FLAG
                      </span>
                      <span className="font-bold text-sm text-white">
                        Potential Acute Coronary Syndrome (ACS / MI)
                      </span>
                      <p className="text-xs text-red-300 mt-0.5">
                        Patient reports retrosternal crushing chest pain radiating to left arm with breathlessness. STAT ECG recommended.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => acknowledgeRedFlag("rf-101")}
                    className="px-3 py-1.5 rounded-xl bg-red-900/70 hover:bg-red-800 text-xs font-bold text-white border border-red-500/40 shrink-0"
                  >
                    Acknowledge Alert
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Diagnostic Studio Tab Switcher */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#080d1a] border border-white/10 w-fit">
            {[
              { id: "overview", label: "Overview & Vitals ECG", icon: Activity },
              { id: "socrates_ayush", label: "SOCRATES & AYUSH Matrix", icon: Sparkles },
              { id: "ocr_records", label: "Prescription OCR & Verification", icon: FileText },
              { id: "rx_notes", label: "Clinical Notes & Rx Pad", icon: Stethoscope },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? "bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: Overview & Vitals ECG */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* HTML5 Live ECG Oscilloscope Card */}
              <LiveVitalsOscilloscope heartRate={98} bloodPressure="142/92" spO2={97} />

              {/* AI Structured Clinical Story + Medical Timeline Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* AI Structured Clinical Narrative */}
                <div className="p-6 rounded-3xl bg-[#0a0f1d]/90 border border-white/10 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-teal-400" />
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                        AI Structured Clinical Case Narrative
                      </h3>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                      Bilingual Synthesized
                    </span>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed">
                    A 52-year-old male with a documented history of essential hypertension presents to OPD with acute retrosternal chest discomfort radiating to left arm, worsening on exertion. The patient reported onset approximately 2 hours ago with associated mild diaphoresis and shortness of breath. No prior episodes of syncope.
                  </p>

                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/5 space-y-2">
                    <span className="text-xs font-bold uppercase text-slate-400 block">
                      Differential Diagnoses Suggested by Clinical Protocol:
                    </span>
                    <ul className="text-xs space-y-1.5 text-slate-300">
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                        <strong className="text-white">Acute Coronary Syndrome (Unstable Angina / NSTEMI)</strong> — High Probability
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                        <strong className="text-white">Gastroesophageal Reflux Disease (GERD)</strong> — Low Probability
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                        <strong className="text-white">Musculoskeletal Chest Wall Pain</strong> — Excluded by radiation pattern
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Medical Timeline Component */}
                <div className="p-6 rounded-3xl bg-[#0a0f1d]/90 border border-white/10">
                  <MedicalTimeline isDark={true} />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SOCRATES & AYUSH Matrix */}
          {activeTab === "socrates_ayush" && (
            <div className="space-y-6">
              {/* SOCRATES 8-Point Pain Analysis */}
              <div className="p-6 rounded-3xl bg-[#0a0f1d]/90 border border-white/10 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Activity className="w-4 h-4 text-teal-400" />
                    SOCRATES Clinical Pain Framework
                  </h3>
                  <span className="text-xs font-bold text-teal-400 bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/30">
                    Severity: 8 / 10
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">SITE</span>
                    <span className="text-sm font-bold text-white mt-1 block">Central Chest (Retrosternal)</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">ONSET</span>
                    <span className="text-sm font-bold text-white mt-1 block">Sudden onset during light walk</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">CHARACTER</span>
                    <span className="text-sm font-bold text-white mt-1 block">Crushing / Tight Pressure</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">RADIATION</span>
                    <span className="text-sm font-bold text-rose-400 mt-1 block">Radiates to Left Arm & Jaw</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">ASSOCIATIONS</span>
                    <span className="text-sm font-bold text-white mt-1 block">Dyspnea, Diaphoresis</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">TIME COURSE</span>
                    <span className="text-sm font-bold text-white mt-1 block">Past 2 hours, episodic</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">EXACERBATING</span>
                    <span className="text-sm font-bold text-white mt-1 block">Exertion, cold exposure</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">SEVERITY</span>
                    <span className="text-sm font-bold text-amber-400 mt-1 block">8 / 10 on VAS Scale</span>
                  </div>
                </div>
              </div>

              {/* AYUSH Dashavidha Pariksha Matrix Card */}
              <DashavidhaRadar data={selectedSession?.dashavidha} />
            </div>
          )}

          {/* TAB 3: Prescription OCR & Verification */}
          {activeTab === "ocr_records" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left: Scanned Document Preview Frame */}
              <div className="lg:col-span-6 p-6 rounded-3xl bg-[#0a0f1d]/90 border border-white/10 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-teal-400" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Prescription Scan (Apollo_Rx_Nov2025.jpg)
                    </h3>
                  </div>
                  <span className="badge-clean badge-clean-success font-mono text-[10px]">
                    OCR Confidence 98.4%
                  </span>
                </div>

                <div className="relative aspect-[3/4] bg-slate-950 rounded-2xl border border-white/10 overflow-hidden flex flex-col justify-between p-6">
                  {/* Bounding Boxes Overlaid on Physical Prescription Simulator */}
                  <div className="border border-teal-500/40 bg-teal-500/10 p-3 rounded-lg text-xs font-mono text-teal-300">
                    <div className="text-[10px] uppercase text-teal-400 font-bold mb-1">OCR Box #1: Medication</div>
                    Tab. Atorvastatin 20mg OD HS (Confidence: 0.98)
                  </div>

                  <div className="border border-teal-500/40 bg-teal-500/10 p-3 rounded-lg text-xs font-mono text-teal-300">
                    <div className="text-[10px] uppercase text-teal-400 font-bold mb-1">OCR Box #2: Medication</div>
                    Tab. Metoprolol Tartrate 25mg BD (Confidence: 0.96)
                  </div>

                  <div className="border border-teal-500/40 bg-teal-500/10 p-3 rounded-lg text-xs font-mono text-teal-300">
                    <div className="text-[10px] uppercase text-teal-400 font-bold mb-1">OCR Box #3: Medication</div>
                    Tab. Ecosprin 75mg OD PC (Confidence: 0.97)
                  </div>

                  <div className="text-[11px] text-slate-500 font-mono text-center pt-2">
                    Processed with Google Health OCR Engine • Traceable Bounding Coordinates [x1, y1, x2, y2]
                  </div>
                </div>
              </div>

              {/* Right: Extracted Entities with 1-Click Verification Checks */}
              <div className="lg:col-span-6 p-6 rounded-3xl bg-[#0a0f1d]/90 border border-white/10 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Extracted Entities Verification
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setVerifiedEntities((prev) => {
                        const copy = { ...prev };
                        Object.keys(copy).forEach((k) => (copy[k].isVerified = true));
                        return copy;
                      });
                    }}
                    className="text-xs font-bold text-teal-400 hover:text-teal-300 flex items-center gap-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" /> Verify All
                  </button>
                </div>

                <div className="space-y-3">
                  {Object.entries(verifiedEntities).map(([key, item]) => (
                    <div
                      key={key}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        item.isVerified
                          ? "bg-emerald-950/20 border-emerald-500/30"
                          : "bg-slate-900/80 border-white/10"
                      }`}
                    >
                      <div className="flex-1">
                        {editingKey === key ? (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={tempEditValue}
                              onChange={(e) => setTempEditValue(e.target.value)}
                              className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-teal-500 text-xs text-white"
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveEntityEdit(key)}
                              className="px-3 py-1 bg-teal-600 text-white rounded-lg text-xs font-bold"
                            >
                              Save
                            </button>
                          </div>
                        ) : (
                          <div>
                            <span className="text-xs font-mono font-bold text-white block">
                              {item.value}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              Confidence 96%+ • Source verified
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingKey(key);
                            setTempEditValue(item.value);
                          }}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400"
                          title="Edit entity"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setVerifiedEntities((prev) => ({
                              ...prev,
                              [key]: { ...prev[key], isVerified: !prev[key].isVerified },
                            }));
                          }}
                          className={`p-1.5 rounded-lg border text-xs font-bold transition-all ${
                            item.isVerified
                              ? "bg-emerald-500 text-slate-950 border-emerald-400"
                              : "bg-white/5 text-slate-400 border-white/10 hover:border-teal-500"
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Clinical Notes & Rx Pad */}
          {activeTab === "rx_notes" && (
            <div className="p-6 rounded-3xl bg-[#0a0f1d]/90 border border-white/10 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <h3 className="text-base font-bold text-white">Physician Consultation Notes & Rx Pad</h3>
                  <p className="text-xs text-slate-400">Structured documentation for hospital EMR sync.</p>
                </div>
                <button
                  type="button"
                  onClick={handleVerifyCase}
                  className="btn-kiosk-primary text-xs py-2 px-4 min-h-[40px]"
                >
                  <Save className="w-4 h-4" /> Save & Sign Consultation
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Physician Clinical Impression & Action Plan
                  </label>
                  <textarea
                    rows={4}
                    value={doctorNotes}
                    onChange={(e) => setDoctorNotes(e.target.value)}
                    className="w-full p-4 rounded-2xl bg-slate-900 border border-white/10 focus:border-teal-500 outline-none text-sm text-slate-200 leading-relaxed font-sans"
                  />
                </div>

                {/* Quick Prescriptions Grid */}
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/5 space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-400 block">
                    Recommended Stat Orders:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="p-3 rounded-xl bg-[#0b1220] border border-white/10 text-xs">
                      <span className="font-bold text-white block">12-Lead ECG</span>
                      <span className="text-slate-400">Immediate Triage Bay</span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#0b1220] border border-white/10 text-xs">
                      <span className="font-bold text-white block">Cardiac Troponin-I</span>
                      <span className="text-slate-400">Stat Biochemistry Lab</span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#0b1220] border border-white/10 text-xs">
                      <span className="font-bold text-white block">Sublingual Sorbitrate 5mg</span>
                      <span className="text-slate-400">Immediate Chamber Dispense</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
