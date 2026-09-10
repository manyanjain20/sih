"use client";

import { useState } from "react";
import { Calendar, FileText, Activity, Pill, ShieldAlert, CheckCircle2 } from "lucide-react";
import { TimelineEvent } from "@/lib/types";

interface MedicalTimelineProps {
  events?: TimelineEvent[];
  onSelectEvent?: (event: TimelineEvent) => void;
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
    description: "Severe retrosternal crushing pain (8/10) radiating to left arm. AI flagged potential ACS.",
    source: "MediKiosk Intake (Voice / Socrates)",
  },
];

export default function MedicalTimeline({
  events = DEFAULT_EVENTS,
  onSelectEvent,
}: MedicalTimelineProps) {
  const [selectedId, setSelectedId] = useState<string>(events[events.length - 1]?.id || "");

  const getIcon = (type: TimelineEvent["event_type"]) => {
    switch (type) {
      case "diagnosis":
        return <Activity className="w-4 h-4 text-blue-600" />;
      case "prescription":
        return <Pill className="w-4 h-4 text-teal-600" />;
      case "investigation":
        return <FileText className="w-4 h-4 text-purple-600" />;
      case "complaint":
        return <ShieldAlert className="w-4 h-4 text-red-600" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Chronological Medical History
        </h4>
        <span className="text-xs text-slate-400 font-medium">{events.length} Milestones</span>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
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
                isSelected
                  ? "bg-white border-teal-600 shadow-sm ring-2 ring-teal-500/10"
                  : "bg-slate-50/60 border-slate-200 hover:bg-white hover:border-slate-300"
              }`}
            >
              {/* Timeline Bullet Node */}
              <div
                className={`absolute -left-[27px] top-4 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-transform ${
                  isSelected
                    ? "bg-teal-700 border-white text-white shadow-xs scale-110"
                    : "bg-white border-slate-300 group-hover:border-teal-600"
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-current" />
              </div>

              {/* Event Content */}
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-md bg-white border border-slate-200">
                    {getIcon(evt.event_type)}
                  </span>
                  <span className="text-sm font-bold text-slate-900">{evt.title}</span>
                </div>
                <span className="text-xs font-semibold text-slate-500 font-mono">
                  {evt.event_date || evt.event_year}
                </span>
              </div>

              {evt.description && (
                <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                  {evt.description}
                </p>
              )}

              {evt.source && (
                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Source: {evt.source}</span>
                  <span className="font-semibold text-teal-700 group-hover:underline">Inspect →</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
