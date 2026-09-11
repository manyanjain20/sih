"use client";

import { useState } from "react";
import { Calendar, FileText, Activity, Pill, ShieldAlert, CheckCircle2, ChevronRight } from "lucide-react";
import { TimelineEvent } from "@/lib/types";

interface MedicalTimelineProps {
  events?: TimelineEvent[];
  onSelectEvent?: (event: TimelineEvent) => void;
  isDark?: boolean;
}

const DEFAULT_EVENTS: TimelineEvent[] = [
  {
    id: "t1",
    event_year: 2024,
    event_date: "14 May 2024",
    event_type: "diagnosis",
    title: "Essential Hypertension Diagnosed",
    description: "Blood pressure recorded 158/96 mmHg during routine executive health screening.",
    source: "Clinical History (Self-reported)",
  },
  {
    id: "t2",
    event_year: 2025,
    event_date: "10 Nov 2025",
    event_type: "prescription",
    title: "Cardiology Prescription — Apollo Hospitals",
    description: "Prescribed Tab. Atorvastatin 20mg OD, Metoprolol 25mg BD, and Aspirin 75mg.",
    source: "Apollo_Rx_Nov2025.jpg (OCR Extracted)",
  },
  {
    id: "t3",
    event_year: 2026,
    event_date: "15 Jan 2026",
    event_type: "investigation",
    title: "Lipid Profile Panel",
    description: "Total Cholesterol: 242 mg/dL, Triglycerides: 210 mg/dL, LDL: 162 mg/dL.",
    source: "Lipid_Profile_Jan2026.pdf (OCR Extracted)",
  },
  {
    id: "t4",
    event_year: 2026,
    event_date: "Today (10:15 AM)",
    event_type: "complaint",
    title: "Acute Chest Pain & Dyspnea",
    description: "Severe retrosternal crushing pain (8/10) radiating to left arm. Flagged potential ACS.",
    source: "MediKiosk Intake (Voice / Socrates)",
  },
];

export default function MedicalTimeline({
  events = DEFAULT_EVENTS,
  onSelectEvent,
  isDark = true,
}: MedicalTimelineProps) {
  const [selectedId, setSelectedId] = useState<string>(events[events.length - 1]?.id || "");

  const getIcon = (type: TimelineEvent["event_type"]) => {
    switch (type) {
      case "diagnosis":
        return <Activity className="w-4 h-4 text-blue-400" />;
      case "prescription":
        return <Pill className="w-4 h-4 text-teal-400" />;
      case "investigation":
        return <FileText className="w-4 h-4 text-purple-400" />;
      case "complaint":
        return <ShieldAlert className="w-4 h-4 text-red-400" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className={`flex items-center justify-between pb-2 border-b ${
        isDark ? "border-white/10" : "border-slate-200"
      }`}>
        <h4 className={`text-xs font-bold uppercase tracking-wider ${
          isDark ? "text-slate-400" : "text-slate-500"
        }`}>
          Chronological Longitudinal Record
        </h4>
        <span className={`text-xs font-medium font-mono ${
          isDark ? "text-teal-400" : "text-teal-700"
        }`}>
          {events.length} Milestones Captured
        </span>
      </div>

      <div className={`relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 ${
        isDark ? "before:bg-white/10" : "before:bg-slate-200"
      }`}>
        {events.map((evt) => {
          const isSelected = selectedId === evt.id;
          return (
            <div
              key={evt.id}
              onClick={() => {
                setSelectedId(evt.id);
                if (onSelectEvent) onSelectEvent(evt);
              }}
              className={`relative cursor-pointer group p-3.5 rounded-2xl border transition-all ${
                isDark
                  ? isSelected
                    ? "bg-slate-900/90 border-teal-500 shadow-lg shadow-teal-950/40"
                    : "bg-[#0b1220]/60 border-white/10 hover:border-white/20 hover:bg-[#0b1220]/90"
                  : isSelected
                    ? "bg-white border-teal-600 shadow-sm ring-2 ring-teal-500/10"
                    : "bg-slate-50/60 border-slate-200 hover:bg-white hover:border-slate-300"
              }`}
            >
              {/* Timeline Bullet Node */}
              <div
                className={`absolute -left-[27px] top-4 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-transform ${
                  isSelected
                    ? isDark
                      ? "bg-teal-500 border-slate-950 text-slate-950 scale-110 shadow-teal-500/40 shadow-sm"
                      : "bg-teal-700 border-white text-white scale-110"
                    : isDark
                      ? "bg-slate-900 border-white/20 group-hover:border-teal-400"
                      : "bg-white border-slate-300 group-hover:border-teal-600"
                }`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-current" />
              </div>

              {/* Event Content */}
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <span className={`p-1 rounded-md border ${
                    isDark ? "bg-white/5 border-white/10" : "bg-white border-slate-200"
                  }`}>
                    {getIcon(evt.event_type)}
                  </span>
                  <span className={`text-sm font-bold ${
                    isDark ? "text-slate-100" : "text-slate-900"
                  }`}>
                    {evt.title}
                  </span>
                </div>
                <span className={`text-xs font-semibold font-mono ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}>
                  {evt.event_date || evt.event_year}
                </span>
              </div>

              {evt.description && (
                <p className={`text-xs mt-1 line-clamp-2 leading-relaxed ${
                  isDark ? "text-slate-300" : "text-slate-600"
                }`}>
                  {evt.description}
                </p>
              )}

              {evt.source && (
                <div className={`mt-2 pt-2 border-t flex items-center justify-between text-[11px] ${
                  isDark ? "border-white/5 text-slate-400" : "border-slate-100 text-slate-400"
                }`}>
                  <span className="truncate max-w-xs font-mono">Source: {evt.source}</span>
                  <span className={`font-semibold flex items-center gap-0.5 ${
                    isDark ? "text-teal-400 group-hover:underline" : "text-teal-700 group-hover:underline"
                  }`}>
                    Inspect <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
