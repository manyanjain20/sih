"use client";

import { useState } from "react";
import { Globe, X, Check } from "lucide-react";
import { LanguageCode } from "@/lib/types";

export interface LanguageOption {
  code: string;
  name: string;
  native: string;
}

export const ALL_INDIAN_LANGUAGES: LanguageOption[] = [
  { code: "en", name: "English", native: "English" },
  { code: "hi", name: "Hindi", native: "हिन्दी" },
  { code: "kn", name: "Kannada", native: "ಕನ್ನಡ" },
  { code: "ta", name: "Tamil", native: "தமிழ்" },
  { code: "te", name: "Telugu", native: "తెలుగు" },
  { code: "mr", name: "Marathi", native: "मराठी" },
  { code: "bn", name: "Bengali", native: "বাংলা" },
  { code: "gu", name: "Gujarati", native: "ગુજરાતી" },
  { code: "ml", name: "Malayalam", native: "മലയാളം" },
  { code: "or", name: "Odia", native: "ଓଡ଼ିଆ" },
  { code: "pa", name: "Punjabi", native: "ਪੰਜਾਬੀ" },
  { code: "as", name: "Assamese", native: "অসমীয়া" },
  { code: "ur", name: "Urdu", native: "اردو" },
];

interface LanguageModalProps {
  isOpen: boolean;
  selectedLanguage: string;
  onSelectLanguage: (code: LanguageCode | string) => void;
  onClose: () => void;
}

export default function LanguageModal({
  isOpen,
  selectedLanguage,
  onSelectLanguage,
  onClose,
}: LanguageModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Choose Language / भाषा चुनें</h2>
              <p className="text-xs text-slate-500">Select your preferred Indian language for case intake</p>
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

        {/* Language Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ALL_INDIAN_LANGUAGES.map((lang) => {
            const isSelected = selectedLanguage === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  onSelectLanguage(lang.code);
                  onClose();
                }}
                className={`flex items-center justify-between p-4 rounded-2xl border-2 text-left transition-all min-h-[58px] ${
                  isSelected
                    ? "border-teal-600 bg-teal-50/70 text-teal-900 shadow-sm"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-800"
                }`}
              >
                <div>
                  <div className="text-lg font-bold">{lang.native}</div>
                  <div className="text-xs text-slate-500 font-medium">{lang.name}</div>
                </div>
                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
          <p className="text-xs text-slate-500">
            Automated speech recognition and translations are available in all supported languages.
          </p>
        </div>
      </div>
    </div>
  );
}
