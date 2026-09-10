"use client";

import { useState } from "react";

interface SeveritySliderProps {
  value: number;
  onChange: (val: number) => void;
}

export default function SeveritySlider({ value, onChange }: SeveritySliderProps) {
  const getSeverityLabel = (score: number) => {
    if (score === 0) return { label: "No Pain / Discomfort", color: "text-slate-500", bg: "bg-slate-100" };
    if (score <= 3) return { label: "Mild Discomfort (Noticeable, but easily ignored)", color: "text-green-700", bg: "bg-green-50" };
    if (score <= 6) return { label: "Moderate Pain (Interferes with daily tasks)", color: "text-amber-700", bg: "bg-amber-50" };
    if (score <= 8) return { label: "Severe Pain (Hard to focus or perform tasks)", color: "text-orange-700", bg: "bg-orange-50" };
    return { label: "Very Severe / Worst Possible Pain", color: "text-red-700", bg: "bg-red-50" };
  };

  const currentLabel = getSeverityLabel(value);

  return (
    <div className="w-full max-w-xl mx-auto p-6 rounded-3xl bg-white border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-bold uppercase tracking-wider text-slate-500">Pain Severity</span>
        <div className={`px-4 py-1.5 rounded-full text-base font-extrabold ${currentLabel.bg} ${currentLabel.color}`}>
          {value} / 10
        </div>
      </div>

      {/* Large Touch Slider */}
      <div className="relative my-6 px-1">
        <input
          type="range"
          min="0"
          max="10"
          step="1"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value, 10))}
          className="w-full h-4 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-700"
        />

        {/* Numeric Ticks */}
        <div className="flex justify-between mt-3 text-xs font-bold text-slate-400">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => onChange(num)}
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                value === num
                  ? "bg-teal-700 text-white font-black shadow-sm scale-110"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      {/* Clinical Description Tag */}
      <div className={`p-3.5 rounded-2xl ${currentLabel.bg} border border-slate-100 text-center transition-colors`}>
        <span className={`text-base font-bold ${currentLabel.color}`}>
          {currentLabel.label}
        </span>
      </div>
    </div>
  );
}
