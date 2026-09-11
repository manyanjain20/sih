"use client";

import { useState, useEffect } from "react";
import { Camera, RefreshCw, CheckCircle2, X, UploadCloud, AlertCircle, FileText, Sparkles, Scan, ChevronRight } from "lucide-react";
import { DocumentItem, ClinicalEntity } from "@/lib/types";

interface DocumentScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDocumentProcessed: (doc: DocumentItem) => void;
}

export default function DocumentScannerModal({
  isOpen,
  onClose,
  onDocumentProcessed,
}: DocumentScannerModalProps) {
  const [step, setStep] = useState<"viewfinder" | "captured" | "processing" | "review">("viewfinder");
  const [processingStepIndex, setProcessingStepIndex] = useState(0);

  const processingSteps = [
    "Physical document boundary detected",
    "High-resolution laser scan completed",
    "Bilingual prescription text extracted",
    "Medications & Dosages normalized",
    "Longitudinal EMR history updated",
  ];

  useEffect(() => {
    if (step === "processing") {
      setProcessingStepIndex(0);
      const timer = setInterval(() => {
        setProcessingStepIndex((prev) => {
          if (prev < processingSteps.length - 1) {
            return prev + 1;
          } else {
            clearInterval(timer);
            setTimeout(() => setStep("review"), 600);
            return prev;
          }
        });
      }, 700);
      return () => clearInterval(timer);
    }
  }, [step]);

  if (!isOpen) return null;

  const sampleDoc: DocumentItem = {
    id: `doc-${Date.now()}`,
    filename: "prescription_apollo_2025.jpg",
    original_filename: "Apollo_Hospital_Cardiology_Rx.jpg",
    file_type: "image/jpeg",
    document_type: "prescription",
    ocr_status: "completed",
    uploaded_at: new Date().toISOString(),
    confidence: 0.98,
    raw_text: "Dr. K. S. Murthy, MD (Cardiology)\nPatient: Ramesh Sharma, 52M\nRx:\n1. Tab. Atorvastatin 20mg - 1 OD HS\n2. Tab. Metoprolol Tartrate 25mg - 1 BD\n3. Tab. Aspirin 75mg - 1 OD PC\nDiagnosis: Essential Hypertension, Dyslipidemia.",
    entities: [
      { id: "e1", entity_type: "medication", value: "Tab. Atorvastatin 20mg", normalized_value: "Atorvastatin", confidence: 0.98 },
      { id: "e2", entity_type: "medication", value: "Tab. Metoprolol 25mg", normalized_value: "Metoprolol", confidence: 0.96 },
      { id: "e3", entity_type: "medication", value: "Tab. Aspirin 75mg", normalized_value: "Aspirin", confidence: 0.99 },
      { id: "e4", entity_type: "investigation", value: "Serum Total Cholesterol: 242 mg/dL", confidence: 0.91 },
      { id: "e5", entity_type: "diagnosis", value: "Essential Hypertension", confidence: 0.94 },
    ],
  };

  const handleCapture = () => {
    setStep("captured");
  };

  const handleConfirmScan = () => {
    setStep("processing");
  };

  const handleFinish = () => {
    onDocumentProcessed(sampleDoc);
    onClose();
    setStep("viewfinder");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030712]/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-[#0a0f1d] text-white rounded-3xl shadow-2xl border border-white/10 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
              <Scan className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Laser Document Scanner & OCR Engine</h2>
              <p className="text-xs text-slate-400">Digitize physical prescriptions, ECG strips, or lab investigation reports</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar-dark">
          {/* State 1: Viewfinder Frame */}
          {step === "viewfinder" && (
            <div className="flex flex-col items-center">
              <div className="relative w-full max-w-lg aspect-[3/4] bg-slate-950 rounded-2xl overflow-hidden shadow-2xl flex flex-col items-center justify-center border border-teal-500/40 p-6 text-center">
                {/* Neon Laser Beam Scanner */}
                <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-teal-400 to-transparent shadow-[0_0_18px_#14b8a6] animate-laser-scan z-20 pointer-events-none" />

                {/* Simulated Document inside Camera Feed */}
                <div className="w-full h-full bg-slate-900/90 rounded-xl p-6 flex flex-col justify-between border border-white/10 relative overflow-hidden shadow-inner">
                  {/* High-tech corner target reticles */}
                  <div className="absolute top-2 left-2 w-7 h-7 border-t-2 border-l-2 border-teal-400 shadow-[0_0_8px_#14b8a6]" />
                  <div className="absolute top-2 right-2 w-7 h-7 border-t-2 border-r-2 border-teal-400 shadow-[0_0_8px_#14b8a6]" />
                  <div className="absolute bottom-2 left-2 w-7 h-7 border-b-2 border-l-2 border-teal-400 shadow-[0_0_8px_#14b8a6]" />
                  <div className="absolute bottom-2 right-2 w-7 h-7 border-b-2 border-r-2 border-teal-400 shadow-[0_0_8px_#14b8a6]" />

                  {/* Simulated prescription lines */}
                  <div className="space-y-3 opacity-60">
                    <div className="h-4 bg-slate-700 rounded w-2/3" />
                    <div className="h-3 bg-slate-800 rounded w-1/2" />
                    <div className="h-3 bg-slate-800 rounded w-full" />
                    <div className="h-3 bg-slate-800 rounded w-4/5" />
                    <div className="h-3 bg-slate-800 rounded w-3/4" />
                  </div>

                  <div className="text-center text-teal-300 text-xs font-mono font-bold py-2 px-3 bg-slate-950/80 rounded-lg border border-teal-500/40 self-center">
                    Hold paper steady • Auto-detecting edges
                  </div>
                </div>
              </div>

              {/* Capture CTA */}
              <div className="mt-6 flex items-center gap-4">
                <button
                  type="button"
                  onClick={handleCapture}
                  className="btn-kiosk-primary min-w-[220px]"
                >
                  <Camera className="w-5 h-5" />
                  Capture Photo
                </button>
              </div>
            </div>
          )}

          {/* State 2: Captured Preview (Confirm / Retake) */}
          {step === "captured" && (
            <div className="flex flex-col items-center">
              <div className="w-full max-w-md p-6 bg-slate-900 border border-white/10 rounded-2xl shadow-xl text-left mb-6">
                <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-wider text-teal-400">
                  <CheckCircle2 className="w-4 h-4" />
                  Prescription Document Captured
                </div>
                <div className="space-y-2 text-sm text-slate-300 font-mono bg-slate-950 p-4 rounded-xl border border-white/5">
                  <p className="font-bold text-white">Apollo Hospitals — Cardiology OPD</p>
                  <p>Rx: Tab Atorvastatin 20mg OD HS</p>
                  <p>Tab Metoprolol Tartrate 25mg BD</p>
                  <p>Tab Aspirin 75mg OD PC</p>
                  <p className="text-xs text-slate-400 pt-2 border-t border-white/10">Dx: Essential Hypertension, Dyslipidemia</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setStep("viewfinder")}
                  className="btn-kiosk-secondary"
                >
                  Retake Photo
                </button>
                <button
                  type="button"
                  onClick={handleConfirmScan}
                  className="btn-kiosk-primary"
                >
                  Confirm & Extract Text
                </button>
              </div>
            </div>
          )}

          {/* State 3: Realistic OCR Processing Sequence */}
          {step === "processing" && (
            <div className="py-12 flex flex-col items-center max-w-md mx-auto text-center">
              <div className="w-16 h-16 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center mb-6 border border-teal-500/30">
                <RefreshCw className="w-8 h-8 animate-spin" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Reading physical prescription...</h3>
              <p className="text-sm text-slate-400 mb-8">
                Our vision model is isolating clinical entities, dosages, and historical lab markers.
              </p>

              {/* Progress Steps */}
              <div className="w-full space-y-3 text-left">
                {processingSteps.map((stepText, idx) => {
                  const isDone = idx < processingStepIndex;
                  const isCurrent = idx === processingStepIndex;
                  return (
                    <div
                      key={stepText}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
                        isDone
                          ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
                          : isCurrent
                          ? "bg-teal-950/50 border-teal-400 text-teal-200 font-bold shadow-sm"
                          : "bg-slate-900 border-white/5 text-slate-500"
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      ) : isCurrent ? (
                        <RefreshCw className="w-5 h-5 text-teal-400 animate-spin shrink-0" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-slate-700 shrink-0" />
                      )}
                      <span className="text-sm">{stepText}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* State 4: OCR Review Split Screen */}
          {step === "review" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left: Original Document Preview */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Captured Source</span>
                    <span className="badge-clean badge-clean-primary font-mono text-[10px]">Apollo_Rx_Nov2025.jpg</span>
                  </div>
                  <div className="aspect-[4/5] bg-slate-950 rounded-xl border border-white/5 p-4 font-mono text-xs text-slate-300 overflow-y-auto leading-relaxed whitespace-pre-wrap shadow-inner">
                    {sampleDoc.raw_text}
                  </div>
                </div>

                {/* Right: Extracted Information */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-white/10 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Extracted Clinical Data</span>
                    <span className="badge-clean badge-clean-success font-mono text-[10px]">
                      Confidence: {(sampleDoc.confidence! * 100).toFixed(0)}%
                    </span>
                  </div>

                  {/* Identified Medications */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-300 block">Medications Normalized:</span>
                    {sampleDoc.entities?.filter((e) => e.entity_type === "medication").map((m) => (
                      <div key={m.id} className="flex items-center justify-between p-2.5 rounded-xl bg-teal-950/40 border border-teal-500/30 text-sm">
                        <span className="font-bold text-teal-300 font-mono">{m.value}</span>
                        <span className="text-xs font-semibold text-teal-400">{(m.confidence! * 100).toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>

                  {/* Identified Investigations */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-300 block">Investigations Identified:</span>
                    {sampleDoc.entities?.filter((e) => e.entity_type === "investigation").map((inv) => (
                      <div key={inv.id} className="flex items-center justify-between p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-sm">
                        <span className="font-bold text-amber-300 font-mono">{inv.value}</span>
                        <span className="text-xs font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded-md border border-amber-500/30">
                          Verified
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-end gap-4 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setStep("viewfinder")}
                  className="btn-kiosk-secondary"
                >
                  Scan Another Record
                </button>
                <button
                  type="button"
                  onClick={handleFinish}
                  className="btn-kiosk-primary"
                >
                  Attach to Case File
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
