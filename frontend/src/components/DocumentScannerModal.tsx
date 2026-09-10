"use client";

import { useState, useEffect } from "react";
import { Camera, RefreshCw, CheckCircle2, X, UploadCloud, AlertCircle, FileText, Sparkles } from "lucide-react";
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
    "Document detected",
    "Text extracted",
    "Medicines identified",
    "Investigations identified",
    "Medical history updated",
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
    confidence: 0.96,
    raw_text: "Dr. K. S. Murthy, MD (Cardiology)\nPatient: Ramesh Sharma, 52M\nRx:\n1. Tab. Atorvastatin 20mg - 1 OD HS\n2. Tab. Metoprolol Tartrate 25mg - 1 BD\n3. Tab. Aspirin 75mg - 1 OD PC\nDiagnosis: Essential Hypertension, Dyslipidemia.",
    entities: [
      { id: "e1", entity_type: "medication", value: "Atorvastatin 20mg", normalized_value: "Atorvastatin", confidence: 0.98 },
      { id: "e2", entity_type: "medication", value: "Metoprolol Tartrate 25mg", normalized_value: "Metoprolol", confidence: 0.95 },
      { id: "e3", entity_type: "medication", value: "Aspirin 75mg", normalized_value: "Aspirin", confidence: 0.99 },
      { id: "e4", entity_type: "investigation", value: "Serum Total Cholesterol: 242 mg/dL", confidence: 0.88 },
      { id: "e5", entity_type: "diagnosis", value: "Essential Hypertension", confidence: 0.92 },
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Document Scanner & OCR</h2>
              <p className="text-xs text-slate-500">Scan previous prescriptions, lab investigations, or discharge notes</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* State 1: Viewfinder Frame */}
          {step === "viewfinder" && (
            <div className="flex flex-col items-center">
              <div className="relative w-full max-w-lg aspect-[3/4] bg-slate-900 rounded-2xl overflow-hidden shadow-inner flex flex-col items-center justify-center border-4 border-dashed border-teal-500/60 p-6 text-center">
                {/* Simulated Document inside Camera Feed */}
                <div className="w-full h-full bg-slate-800 rounded-xl p-6 flex flex-col justify-between border-2 border-slate-700 relative overflow-hidden">
                  {/* Boundary markers */}
                  <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-teal-400" />
                  <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-teal-400" />
                  <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-teal-400" />
                  <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-teal-400" />

                  <div className="space-y-3 opacity-60">
                    <div className="h-4 bg-slate-600 rounded w-2/3" />
                    <div className="h-3 bg-slate-700 rounded w-1/2" />
                    <div className="h-3 bg-slate-700 rounded w-full" />
                    <div className="h-3 bg-slate-700 rounded w-4/5" />
                    <div className="h-3 bg-slate-700 rounded w-3/4" />
                  </div>

                  <div className="text-center text-teal-300 text-xs font-semibold py-2 px-3 bg-slate-900/80 rounded-lg border border-teal-500/30 self-center">
                    Align document within boundary frame
                  </div>
                </div>
              </div>

              {/* Capture CTA */}
              <div className="mt-6 flex items-center gap-4">
                <button
                  type="button"
                  onClick={handleCapture}
                  className="btn-kiosk-primary min-w-[200px]"
                >
                  <Camera className="w-5 h-5" />
                  Capture Document
                </button>
              </div>
            </div>
          )}

          {/* State 2: Captured Preview (Confirm / Retake) */}
          {step === "captured" && (
            <div className="flex flex-col items-center">
              <div className="w-full max-w-md p-6 bg-slate-50 border border-slate-200 rounded-2xl shadow-sm text-left mb-6">
                <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-wider text-teal-700">
                  <CheckCircle2 className="w-4 h-4" />
                  Document captured cleanly
                </div>
                <div className="space-y-2 text-sm text-slate-700 font-mono bg-white p-4 rounded-xl border border-slate-200">
                  <p className="font-bold text-slate-900">Apollo Hospitals — Cardiology OPD</p>
                  <p>Rx: Tab Atorvastatin 20mg OD</p>
                  <p>Tab Metoprolol 25mg BD</p>
                  <p>Tab Aspirin 75mg OD</p>
                  <p className="text-xs text-slate-500 pt-2 border-t border-slate-100">Dx: Essential Hypertension</p>
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
              <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mb-6">
                <RefreshCw className="w-8 h-8 animate-spin" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Reading your document...</h3>
              <p className="text-sm text-slate-500 mb-8">
                Our clinical AI engine is extracting medications, dosages, and test results.
              </p>

              {/* Progress Steps */}
              <div className="w-full space-y-3 text-left">
                {processingSteps.map((stepText, idx) => {
                  const isDone = idx < processingStepIndex;
                  const isCurrent = idx === processingStepIndex;
                  return (
                    <div
                      key={stepText}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                        isDone
                          ? "bg-green-50 border-green-200 text-green-800"
                          : isCurrent
                          ? "bg-teal-50 border-teal-300 text-teal-900 font-bold"
                          : "bg-slate-50 border-slate-200 text-slate-400"
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                      ) : isCurrent ? (
                        <RefreshCw className="w-5 h-5 text-teal-600 animate-spin shrink-0" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-slate-300 shrink-0" />
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
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Original Document</span>
                    <span className="badge-clean badge-clean-primary">Apollo_Rx_Nov2025.jpg</span>
                  </div>
                  <div className="aspect-[4/5] bg-white rounded-xl border border-slate-200 p-4 font-mono text-xs text-slate-700 overflow-y-auto leading-relaxed whitespace-pre-wrap shadow-inner">
                    {sampleDoc.raw_text}
                  </div>
                </div>

                {/* Right: Extracted Information */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Extracted Clinical Data</span>
                    <span className="badge-clean badge-clean-success">
                      Confidence: {(sampleDoc.confidence! * 100).toFixed(0)}%
                    </span>
                  </div>

                  {/* Identified Medications */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-600 block">Medications Identified:</span>
                    {sampleDoc.entities?.filter((e) => e.entity_type === "medication").map((m) => (
                      <div key={m.id} className="flex items-center justify-between p-2.5 rounded-xl bg-teal-50/60 border border-teal-200 text-sm">
                        <span className="font-bold text-teal-900">{m.value}</span>
                        <span className="text-xs font-semibold text-teal-700">{(m.confidence! * 100).toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>

                  {/* Identified Investigations */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-600 block">Investigations Identified:</span>
                    {sampleDoc.entities?.filter((e) => e.entity_type === "investigation").map((inv) => (
                      <div key={inv.id} className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-sm">
                        <span className="font-bold text-amber-900">{inv.value}</span>
                        <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                          Please verify
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-200">
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
