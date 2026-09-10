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
  CheckCheck
} from "lucide-react";
import Navbar from "@/components/Navbar";
import RedFlagBanner from "@/components/RedFlagBanner";
import MedicalTimeline from "@/components/MedicalTimeline";
import { fetchDoctorQueue, acknowledgeRedFlag, verifyDoctorSummary } from "@/lib/api";
import { hospitalEventBus } from "@/lib/events";
import { IntakeSession, ClinicalEntity } from "@/lib/types";

export default function DoctorConsolePage() {
  const [queue, setQueue] = useState<IntakeSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>("sess-101");
  const [activeNav, setActiveNav] = useState<"dashboard" | "queue" | "case" | "documents">("case");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [isCalling, setIsCalling] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [doctorNotes, setDoctorNotes] = useState(
    "Patient presenting with classic retrosternal angina radiating to left arm. Advised STAT 12-lead ECG, Troponin-I, sublingual nitrates, and immediate cardiology referral."
  );

  // Editable clinical entities state for Doctor Verification
  const [verifiedEntities, setVerifiedEntities] = useState<Record<string, { value: string; isVerified: boolean }>>({
    med_1: { value: "Atorvastatin 20mg - 1 OD HS", isVerified: false },
    med_2: { value: "Metoprolol Tartrate 25mg - 1 BD", isVerified: false },
    med_3: { value: "Aspirin 75mg - 1 OD PC", isVerified: false },
    inv_1: { value: "Total Cholesterol: 242 mg/dL", isVerified: false },
    inv_2: { value: "LDL Cholesterol: 162 mg/dL", isVerified: false },
  });
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [tempEditValue, setTempEditValue] = useState("");
  const [highlightedSource, setHighlightedSource] = useState<string | null>(null);

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
    // Mark all entities verified
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
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      <Navbar />

      {/* Main Clinical Layout with Sidebar & Content */}
      <div className="flex-1 pt-[68px] flex">
        {/* Left Professional Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 p-4 flex flex-col justify-between hidden md:flex shrink-0">
          <div className="space-y-6">
            {/* Active Doctor Profile */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  PD
                </div>
                <div>
                  <span className="text-sm font-bold text-slate-900 block leading-tight">
                    Dr. Priya Deshmukh
                  </span>
                  <span className="text-xs text-slate-500 font-medium">Cardiology • Chamber 4</span>
                </div>
              </div>
            </div>

            {/* Navigation links */}
            <nav className="space-y-1">
              {[
                { id: "dashboard", label: "Dashboard Overview", icon: LayoutDashboard },
                { id: "queue", label: "Priority OPD Queue", icon: Users, badge: waitingCount },
                { id: "case", label: "Patient Case File", icon: FileText },
                { id: "documents", label: "Scanned Records", icon: FolderOpen },
                { id: "settings", label: "Settings", icon: Settings },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveNav(item.id as any)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    activeNav === item.id
                      ? "bg-teal-50 text-teal-900 font-bold border border-teal-200"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={`w-4 h-4 ${activeNav === item.id ? "text-teal-700" : "text-slate-500"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-200 text-slate-700">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 space-y-1">
            <div className="font-bold text-slate-700">MediKiosk v1.0 Production</div>
            <div>Connected to Hospital Event Bus</div>
          </div>
        </aside>

        {/* Right Main Workstation Area */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto space-y-6">
          {/* Top Clinical Header & Metrics Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Clinical Intake & Examination
                </h1>
                <span className="badge-clean badge-clean-primary">OPD Room 4</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                Pre-consultation clinical history structured by MediKiosk AI Engine.
              </p>
            </div>

            {/* Quick KPI Row: Patients waiting, completed, high priority, avg intake time */}
            <div className="flex items-center gap-3">
              <div className="px-3.5 py-2 bg-white rounded-xl border border-slate-200 shadow-xs text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Waiting</span>
                <span className="text-base font-extrabold text-slate-900">{waitingCount}</span>
              </div>

              <div className="px-3.5 py-2 bg-white rounded-xl border border-slate-200 shadow-xs text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Completed</span>
                <span className="text-base font-extrabold text-green-700">{completedCount}</span>
              </div>

              <div className="px-3.5 py-2 bg-red-50 rounded-xl border border-red-200 shadow-xs text-center">
                <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider block">High Priority</span>
                <span className="text-base font-extrabold text-red-700">{highPriorityCount}</span>
              </div>

              <div className="px-3.5 py-2 bg-white rounded-xl border border-slate-200 shadow-xs text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Avg Intake</span>
                <span className="text-base font-extrabold text-teal-700">3.8m</span>
              </div>
            </div>
          </div>

          {/* DOCTOR SCREEN 4: RED FLAG BANNER (Compact & Non-Frightening at Top) */}
          {selectedSession?.red_flags && selectedSession.red_flags.length > 0 && (
            <RedFlagBanner
              alerts={selectedSession.red_flags}
              onAcknowledge={(id) => acknowledgeRedFlag(id)}
              isPatientView={false}
            />
          )}

          {/* DOCTOR SCREEN 2: PRIORITY OPD QUEUE OVERVIEW (If Dashboard or Queue Nav selected) */}
          {(activeNav === "dashboard" || activeNav === "queue") && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">Today's OPD Queue</h3>
                  <span className="text-xs text-slate-400">({filteredQueue.length} cases)</span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search patient or token..."
                      className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:border-teal-600"
                    />
                  </div>

                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
                  >
                    <option value="all">All Priorities</option>
                    <option value="high">High Priority</option>
                    <option value="medium">Medium</option>
                    <option value="normal">Normal</option>
                  </select>
                </div>
              </div>

              {/* High-density clean queue table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Token & Patient</th>
                      <th className="py-3 px-4">Age / Sex</th>
                      <th className="py-3 px-4">Chief Complaint</th>
                      <th className="py-3 px-4">Priority</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Intake Time</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {filteredQueue.map((pt) => {
                      const isSelected = selectedSessionId === pt.id;
                      return (
                        <tr
                          key={pt.id}
                          onClick={() => {
                            setSelectedSessionId(pt.id);
                            setActiveNav("case");
                          }}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? "bg-teal-50/70 font-semibold" : "hover:bg-slate-50"
                          }`}
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-xs bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                {pt.token_number}
                              </span>
                              <span className="font-bold text-slate-900">{pt.patient_name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-600 text-xs">
                            {pt.patient_age}Y / {pt.patient_gender}
                          </td>
                          <td className="py-3 px-4 text-slate-700 max-w-xs truncate text-xs">
                            {pt.chief_complaint}
                          </td>
                          <td className="py-3 px-4">
                            {pt.priority === "high" ? (
                              <span className="badge-clean badge-clean-danger">
                                <Flame className="w-3 h-3 text-red-600" /> STAT HIGH
                              </span>
                            ) : pt.priority === "medium" ? (
                              <span className="badge-clean badge-clean-warning">
                                🟡 Medium
                              </span>
                            ) : (
                              <span className="badge-clean badge-clean-success">
                                🟢 Normal
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-xs font-semibold text-slate-600">
                            {pt.status === "verified" ? (
                              <span className="text-green-700 flex items-center gap-1">
                                <CheckCheck className="w-3.5 h-3.5" /> Verified
                              </span>
                            ) : (
                              <span className="text-amber-700">Waiting</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-xs text-slate-500 font-mono">
                            {new Date(pt.started_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              className="px-3 py-1 bg-white border border-slate-200 hover:border-teal-600 rounded-lg text-xs font-bold text-teal-800 shadow-xs"
                            >
                              Open Case
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* DOCTOR SCREEN 3 & 5: PATIENT CASE VIEW (3-Column Layout) */}
          {(activeNav === "case" || activeNav === "documents") && selectedSession && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* LEFT COLUMN (4 cols): Patient Identity & Timeline */}
              <div className="lg:col-span-4 space-y-6">
                {/* Patient Identity Card */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-extrabold bg-teal-50 text-teal-800 px-2 py-0.5 rounded border border-teal-200">
                          {selectedSession.token_number}
                        </span>
                        <h2 className="text-xl font-bold text-slate-900">
                          {selectedSession.patient_name}
                        </h2>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {selectedSession.patient_age} Years • {selectedSession.patient_gender} • {selectedSession.patient_mobile}
                      </p>
                    </div>

                    {selectedSession.priority === "high" ? (
                      <span className="badge-clean badge-clean-danger">
                        <Flame className="w-3 h-3 text-red-600" /> High Priority
                      </span>
                    ) : (
                      <span className="badge-clean badge-clean-success">
                        Normal
                      </span>
                    )}
                  </div>

                  {/* Call to Chamber 4 CTA */}
                  <button
                    type="button"
                    onClick={handleCallPatient}
                    disabled={isCalling}
                    className="w-full py-2.5 px-4 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <BellRing className="w-4 h-4" />
                    {isCalling ? "Calling to TV Display..." : "Call Patient to Chamber 4"}
                  </button>
                </div>

                {/* Medical Timeline Component */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                  <MedicalTimeline
                    onSelectEvent={(evt) => {
                      setHighlightedSource(evt.source || null);
                    }}
                  />
                </div>
              </div>

              {/* CENTER COLUMN (5 cols): Clinical Summary & SOCRATES */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-teal-700" />
                      <h3 className="text-base font-bold text-slate-900">Clinical Summary</h3>
                    </div>
                    <span className="badge-clean badge-clean-primary">
                      AI Structured
                    </span>
                  </div>

                  {/* Chief Complaint */}
                  <div className="space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                      Chief Complaint
                    </span>
                    <p className="text-sm font-bold text-slate-900 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                      {selectedSession.chief_complaint}
                    </p>
                  </div>

                  {/* SOCRATES Matrix */}
                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                      SOCRATES Symptom Breakdown
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="font-bold text-slate-500 block">Site:</span>
                        <span className="font-bold text-slate-900">{selectedSession.socrates?.site || "Central Chest"}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="font-bold text-slate-500 block">Onset:</span>
                        <span className="font-bold text-slate-900">{selectedSession.socrates?.onset || "Sudden (45 mins ago)"}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="font-bold text-slate-500 block">Character:</span>
                        <span className="font-bold text-slate-900">{selectedSession.socrates?.character || "Crushing / Tight"}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="font-bold text-slate-500 block">Radiation:</span>
                        <span className="font-bold text-slate-900">{selectedSession.socrates?.radiation || "Left Arm & Jaw"}</span>
                      </div>
                    </div>
                  </div>

                  {/* AYUSH Assessment Summary */}
                  <div className="p-3 rounded-xl bg-teal-50/50 border border-teal-200 text-xs space-y-1">
                    <span className="font-bold text-teal-900 block">AYUSH Constitution (Prakriti):</span>
                    <p className="text-teal-800">
                      Dominant: <strong>{selectedSession.dashavidha?.prakriti?.dominant || "Pitta"}</strong> • Digestion: <strong>{selectedSession.dashavidha?.ahara_shakti || "Tikshnagni"}</strong>
                    </p>
                  </div>

                  {/* Doctor Notes & Sign-off */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                      Doctor's Notes & Consultation Advice
                    </label>
                    <textarea
                      rows={3}
                      value={doctorNotes}
                      onChange={(e) => setDoctorNotes(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:border-teal-600 outline-none leading-relaxed bg-white"
                    />

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-slate-500 font-medium">
                        {isVerified ? "✓ Case Verified & Signed" : "Pending physician sign-off"}
                      </span>

                      <button
                        type="button"
                        onClick={handleVerifyCase}
                        className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                          isVerified
                            ? "bg-green-100 text-green-800 border border-green-300"
                            : "bg-teal-700 hover:bg-teal-800 text-white shadow-xs"
                        }`}
                      >
                        <Check className="w-4 h-4" />
                        {isVerified ? "Doctor Verified" : "Verify & Sign Case"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN (3 cols): AI Data Sources & Inline Editable Entities */}
              <div className="lg:col-span-3 space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      AI & Data Sources
                    </h4>
                    <span className="text-[11px] text-slate-400">Traceability</span>
                  </div>

                  {/* Highlighted Source Banner if clicked from timeline */}
                  {highlightedSource && (
                    <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-900 font-medium">
                      Source highlighted: <strong>{highlightedSource}</strong>
                    </div>
                  )}

                  {/* Extracted Medications with Inline Edit & Doctor Verification Badges */}
                  <div className="space-y-2.5">
                    <span className="text-xs font-bold text-slate-600 block">Medications (OCR Extracted)</span>

                    {["med_1", "med_2", "med_3"].map((key) => {
                      const item = verifiedEntities[key];
                      const isEditing = editingKey === key;
                      return (
                        <div
                          key={key}
                          className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="badge-clean badge-clean-neutral text-[10px]">
                              OCR Extracted
                            </span>
                            {item.isVerified ? (
                              <span className="badge-clean badge-clean-success text-[10px]">
                                ✓ Doctor Verified
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingKey(key);
                                  setTempEditValue(item.value);
                                }}
                                className="text-teal-700 hover:underline text-[11px] font-bold flex items-center gap-0.5"
                              >
                                <Edit3 className="w-3 h-3" /> Edit
                              </button>
                            )}
                          </div>

                          {isEditing ? (
                            <div className="flex gap-1 pt-1">
                              <input
                                type="text"
                                value={tempEditValue}
                                onChange={(e) => setTempEditValue(e.target.value)}
                                className="w-full px-2 py-1 rounded border border-teal-600 text-xs text-slate-900 bg-white"
                                autoFocus
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveEntityEdit(key)}
                                className="px-2 py-1 bg-teal-700 text-white rounded text-xs font-bold"
                              >
                                Save
                              </button>
                            </div>
                          ) : (
                            <p className="font-semibold text-slate-800">{item.value}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Extracted Lab Tests */}
                  <div className="space-y-2.5 pt-2 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-600 block">Investigations</span>
                    {["inv_1", "inv_2"].map((key) => {
                      const item = verifiedEntities[key];
                      return (
                        <div
                          key={key}
                          className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                              Lab Panel
                            </span>
                            {item.isVerified && (
                              <span className="badge-clean badge-clean-success text-[10px]">
                                ✓ Verified
                              </span>
                            )}
                          </div>
                          <p className="font-bold text-slate-900">{item.value}</p>
                        </div>
                      );
                    })}
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
