"use client";

import { useState } from "react";
import { AlertCircle, ShieldAlert, Check, BellRing } from "lucide-react";
import { RedFlagAlert } from "@/lib/types";

interface RedFlagBannerProps {
  alerts: RedFlagAlert[];
  onAcknowledge?: (alertId: string) => void;
  isPatientView?: boolean;
}

export default function RedFlagBanner({
  alerts,
  onAcknowledge,
  isPatientView = false,
}: RedFlagBannerProps) {
  const [acknowledgedList, setAcknowledgedList] = useState<string[]>([]);

  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="space-y-3 w-full">
      {alerts.map((alert) => {
        const isAck = alert.is_acknowledged || acknowledgedList.includes(alert.id);

        if (isPatientView) {
          return (
            <div
              key={alert.id}
              className="p-6 rounded-3xl bg-red-50 border-2 border-red-300 text-red-950 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-200 text-red-800 text-xs font-black uppercase tracking-wider mb-2">
                    Priority: HIGH
                  </div>
                  <h3 className="text-xl font-bold text-red-900 leading-snug">
                    Your responses need immediate medical attention.
                  </h3>
                  <p className="text-base text-red-800 mt-1">
                    Please inform the triage nurse or wait here. A healthcare professional is being notified immediately.
                  </p>
                </div>
              </div>
            </div>
          );
        }

        // Doctor View: Professional & Compact Warning Banner
        return (
          <div
            key={alert.id}
            className={`p-4 rounded-2xl border transition-all ${
              isAck
                ? "bg-slate-50 border-slate-200 text-slate-700"
                : "bg-red-50/90 border-red-300 text-red-950 shadow-xs"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-xl shrink-0 ${
                    isAck ? "bg-slate-200 text-slate-600" : "bg-red-600 text-white"
                  }`}
                >
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-800 font-extrabold text-[11px] uppercase tracking-wider border border-red-200">
                      Priority Attention Required
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      Potential clinical red flag:
                    </span>
                    <span className="text-sm font-bold text-red-900">{alert.rule_name}</span>
                  </div>
                  <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                    Reason: {alert.description}
                  </p>
                  {alert.triggered_by && alert.triggered_by.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap text-xs text-slate-600">
                      <span className="font-semibold text-slate-500">Triggers:</span>
                      {alert.triggered_by.map((trig, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-800 font-medium text-[11px]"
                        >
                          {trig}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="shrink-0 flex items-center">
                {isAck ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-semibold">
                    <Check className="w-3.5 h-3.5 text-green-600" />
                    Doctor Acknowledged
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setAcknowledgedList((prev) => [...prev, alert.id]);
                      if (onAcknowledge) onAcknowledge(alert.id);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-bold transition-all shadow-xs"
                  >
                    <BellRing className="w-3.5 h-3.5" />
                    Acknowledge
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
