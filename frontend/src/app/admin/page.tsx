"use client";

import { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Activity, 
  Users, 
  AlertTriangle, 
  Clock, 
  Settings, 
  FileCode, 
  Database, 
  Layers, 
  CheckCircle2, 
  Search, 
  TrendingUp, 
  Lock,
  Flame,
  Filter,
  Radio,
  Download,
  Terminal,
  ChevronDown,
  ChevronUp,
  Heart,
  Brain,
  ShieldAlert,
  Sparkles
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { hospitalEventBus, HospitalEvent } from "@/lib/events";

interface AuditEntry {
  id: string;
  time: string;
  user: string;
  action: string;
  details: string;
  status: "Success" | "Alert" | "Critical" | "Live";
  payload?: any;
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"metrics" | "rules" | "questions" | "audit">("metrics");
  const [ruleSearch, setRuleSearch] = useState("");
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [liveEventCount, setLiveEventCount] = useState(0);

  const clinicalRules = [
    {
      id: "RF_001",
      name: "Potential Acute Coronary Syndrome (ACS / MI)",
      category: "Cardiovascular",
      severity: "high",
      condition: "chest_pain == true AND (radiation in ['left_arm', 'jaw'] OR severity >= 8)",
      status: "active",
      triggers_today: 3,
    },
    {
      id: "RF_002",
      name: "Acute Stroke / TIA (FAST Criteria)",
      category: "Neurological",
      severity: "high",
      condition: "facial_droop == true OR arm_weakness == true OR slurred_speech == true",
      status: "active",
      triggers_today: 1,
    },
    {
      id: "RF_003",
      name: "Severe Sepsis / Septic Shock Warning",
      category: "Infectious",
      severity: "high",
      condition: "fever >= 102.5 AND (altered_mental_status == true OR sbp < 90)",
      status: "active",
      triggers_today: 0,
    },
    {
      id: "RF_004",
      name: "Severe Anaphylaxis / Airway Compromise",
      category: "Immunological",
      severity: "high",
      condition: "wheezing == true AND (lip_swelling == true OR allergen_exposure == true)",
      status: "active",
      triggers_today: 0,
    },
    {
      id: "RF_005",
      name: "Acute Surgical Abdomen / Peritonitis",
      category: "Gastrointestinal",
      severity: "medium",
      condition: "severe_abdominal_pain == true AND (rebound_tenderness == true OR rigid_abdomen == true)",
      status: "active",
      triggers_today: 2,
    },
  ];

  const initialAuditLogs: AuditEntry[] = [
    { id: "log-1", time: "10:28:45 AM", user: "Kiosk-01", action: "PATIENT_CHECKED_IN", details: "Token: OPD-042 (Ramesh Sharma)", status: "Success" },
    { id: "log-2", time: "10:28:46 AM", user: "RuleEngine", action: "RED_FLAG_TRIGGERED", details: "Rule: RF_001 (Potential ACS)", status: "Alert" },
    { id: "log-3", time: "10:35:12 AM", user: "Dr. Priya Deshmukh", action: "CASE_OPENED", details: "Patient: Ramesh Sharma", status: "Success" },
    { id: "log-4", time: "10:38:00 AM", user: "Dr. Priya Deshmukh", action: "RED_FLAG_ACKNOWLEDGED", details: "Rule: RF_001 acknowledged", status: "Success" },
    { id: "log-5", time: "10:41:20 AM", user: "Dr. Priya Deshmukh", action: "CASE_VERIFIED", details: "Summary verified and signed", status: "Success" },
  ];

  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>(initialAuditLogs);

  useEffect(() => {
    // Populate with existing historical events
    const history = hospitalEventBus.getHistory();
    if (history.length > 0) {
      const historicalLogs: AuditEntry[] = history.map((evt) => ({
        id: evt.id,
        time: new Date(evt.timestamp).toLocaleTimeString(),
        user: evt.actor,
        action: evt.type,
        details: typeof evt.payload === "object" ? JSON.stringify(evt.payload).slice(0, 60) + "..." : String(evt.payload || ""),
        status: evt.severity === "CRITICAL" ? "Critical" : evt.severity === "WARNING" ? "Alert" : "Live",
        payload: evt.payload,
      }));
      setAuditLogs((prev) => [...historicalLogs, ...prev]);
      setLiveEventCount(history.length);
    }

    // Subscribe to all incoming live events
    const unsub = hospitalEventBus.onAny((evt: HospitalEvent) => {
      setLiveEventCount((c) => c + 1);
      const newEntry: AuditEntry = {
        id: evt.id,
        time: new Date(evt.timestamp).toLocaleTimeString(),
        user: evt.actor,
        action: evt.type,
        details: typeof evt.payload === "object" ? JSON.stringify(evt.payload).slice(0, 60) + "..." : String(evt.payload || ""),
        status: evt.severity === "CRITICAL" ? "Critical" : evt.severity === "WARNING" ? "Alert" : "Live",
        payload: evt.payload,
      };
      setAuditLogs((prev) => [newEntry, ...prev.slice(0, 49)]); // keep latest 50
    });

    return () => unsub();
  }, []);

  const exportLogsAsJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `medikiosk_dpdp_audit_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pt-24 pb-16 px-4 sm:px-6 max-w-7xl mx-auto w-full flex flex-col gap-6">
        {/* Admin Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-teal-700 text-white flex items-center justify-center font-bold shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">Hospital Administration & Clinical Rules Console</h1>
                <span className="badge-clean badge-clean-primary">
                  Super Admin
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                MediKiosk Hospital Gateway • Smart India Hackathon 2026
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              All Engines Synchronized
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          {[
            { id: "metrics", label: "OPD Analytics & Throughput", icon: TrendingUp },
            { id: "rules", label: "Red Flag Rules Engine", icon: AlertTriangle },
            { id: "audit", label: "DPDP / Compliance Audit Logs", icon: Lock },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? "bg-teal-50 text-teal-900 border border-teal-200 shadow-xs"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ─── TAB 1: OPD Metrics ────────────────────────────────────────── */}
        {activeTab === "metrics" && (
          <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Patients Today</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-extrabold text-slate-900">142</span>
                  <span className="text-xs text-green-700 font-bold">+18% vs avg</span>
                </div>
                <p className="text-[11px] text-slate-400">Average intake time: 3.8 mins</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">OCR Digitized Records</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-extrabold text-teal-700">286</span>
                  <span className="text-xs text-teal-700 font-bold">96.4% Acc</span>
                </div>
                <p className="text-[11px] text-slate-400">Handwritten & Printed Prescriptions</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Red Flags Intercepted</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-extrabold text-red-700">6</span>
                  <span className="text-xs text-red-700 font-bold">100% Ack</span>
                </div>
                <p className="text-[11px] text-slate-400">Zero missed critical cases</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Physician Time Saved</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-extrabold text-teal-800">62%</span>
                  <span className="text-xs text-teal-700 font-bold">~8 min/pt</span>
                </div>
                <p className="text-[11px] text-slate-400">Automated structured intake</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
                  Live Event Stream
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-extrabold text-teal-700 font-mono">{liveEventCount}</span>
                  <span className="text-xs text-teal-700 font-bold">Reactive Mesh</span>
                </div>
                <p className="text-[11px] text-slate-400">BroadcastChannel sync</p>
              </div>
            </div>

            {/* Language Breakdown */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Multilingual Intake Distribution (Voice & Touch)
              </h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-300">
                    <span>Hindi (हिन्दी)</span>
                    <span>54% (77 patients)</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div className="bg-cyan-500 h-full rounded-full" style={{ width: "54%" }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-300">
                    <span>Kannada (ಕನ್ನಡ)</span>
                    <span>28% (40 patients)</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div className="bg-teal-500 h-full rounded-full" style={{ width: "28%" }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-300">
                    <span>English</span>
                    <span>18% (25 patients)</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full" style={{ width: "18%" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 2: Red Flag Rules Engine ──────────────────────────────── */}
        {activeTab === "rules" && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  value={ruleSearch}
                  onChange={(e) => setRuleSearch(e.target.value)}
                  placeholder="Search clinical rules by ID, condition..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-400"
                />
              </div>
              <span className="text-xs font-bold text-slate-400">
                Active Rules: <strong className="text-white">{clinicalRules.length}</strong>
              </span>
            </div>

            <div className="space-y-3">
              {clinicalRules.map((rule) => (
                <div
                  key={rule.id}
                  className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5 hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${
                        rule.category.includes("Cardio")
                          ? "text-rose-400 bg-rose-500/10 border-rose-500/30"
                          : rule.category.includes("Neuro")
                          ? "text-purple-400 bg-purple-500/10 border-purple-500/30"
                          : rule.category.includes("Infect")
                          ? "text-amber-400 bg-amber-500/10 border-amber-500/30"
                          : rule.category.includes("Immuno")
                          ? "text-cyan-400 bg-cyan-500/10 border-cyan-500/30"
                          : "text-teal-400 bg-teal-500/10 border-teal-500/30"
                      }`}>
                        {rule.category.includes("Cardio") ? (
                          <Heart className="w-4 h-4" />
                        ) : rule.category.includes("Neuro") ? (
                          <Brain className="w-4 h-4" />
                        ) : rule.category.includes("Immuno") ? (
                          <ShieldAlert className="w-4 h-4" />
                        ) : (
                          <Flame className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-700 text-indigo-300 font-mono text-xs font-bold">
                            {rule.id}
                          </span>
                          <h4 className="text-sm font-bold text-white">{rule.name}</h4>
                        </div>
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border flex items-center gap-1 ${
                        rule.severity === "high"
                          ? "bg-red-500/20 text-red-300 border-red-500/40"
                          : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                      }`}
                    >
                      {rule.severity === "high" ? <Flame className="w-3 h-3 text-red-400" /> : <AlertTriangle className="w-3 h-3 text-amber-400" />}
                      {rule.severity} Priority
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-900 font-mono text-xs text-cyan-300">
                    IF {rule.condition}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>Category: <strong>{rule.category}</strong></span>
                    <span>Triggered today: <strong className="text-white">{rule.triggers_today} times</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── TAB 3: Audit Logs ─────────────────────────────────────────── */}
        {activeTab === "audit" && (
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Lock className="w-4 h-4 text-indigo-400" />
                  Immutable Clinical Audit Trail (DPDP Act 2023 & ISO 27799)
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Cryptographically trackable ledger of patient consent, OCR extractions, clinical alerts, and doctor sign-offs.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                  LIVE EVENT MESH
                </span>

                <button
                  type="button"
                  onClick={exportLogsAsJson}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 text-xs font-bold transition-all hover:scale-105"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export JSON
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
              {auditLogs.map((log) => {
                const isExpanded = expandedLogId === log.id;
                return (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800/80 hover:border-slate-700 transition-all space-y-2"
                  >
                    <div
                      onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                      className="flex items-center justify-between cursor-pointer text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-slate-500 text-[11px]">{log.time}</span>
                        <span className="font-bold text-indigo-300">{log.user}</span>
                        <span className="text-white font-medium">• {log.action}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400 text-[11px] hidden sm:inline max-w-xs truncate">
                          {log.details}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                            log.status === "Critical"
                              ? "bg-red-500/20 text-red-300 border-red-500/40 animate-pulse"
                              : log.status === "Alert"
                              ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                              : log.status === "Live"
                              ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                              : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                          }`}
                        >
                          {log.status}
                        </span>
                        {log.payload ? (
                          isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                          )
                        ) : null}
                      </div>
                    </div>

                    {/* Expandable JSON Payload Viewer */}
                    {isExpanded && log.payload && (
                      <div className="mt-2 p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-cyan-200 overflow-x-auto">
                        <div className="flex items-center justify-between pb-1 mb-1 border-b border-slate-800 text-slate-400 text-[10px]">
                          <span>EVENT PAYLOAD DESERIALIZATION</span>
                          <span>ID: {log.id}</span>
                        </div>
                        <pre className="whitespace-pre-wrap">{JSON.stringify(log.payload, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
