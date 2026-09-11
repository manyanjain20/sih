"use client";

import { Leaf, Flame, Droplets, Wind, Sparkles } from "lucide-react";
import { DashavidhaData } from "@/lib/types";

interface DashavidhaRadarProps {
  data?: DashavidhaData;
}

export default function DashavidhaRadar({ data }: DashavidhaRadarProps) {
  const vata = data?.prakriti?.vata ?? 35;
  const pitta = data?.prakriti?.pitta ?? 45;
  const kapha = data?.prakriti?.kapha ?? 20;

  return (
    <div className="rounded-3xl bg-[#0a0f1d]/90 border border-teal-500/20 p-6 shadow-2xl space-y-4 backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              AYUSH Dashavidha Pariksha Matrix
              <span className="text-[10px] px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 font-extrabold uppercase border border-teal-500/30 font-mono">
                10-FOLD PROTOCOL
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">Ayurvedic Prakriti & Physiological Assessment</p>
          </div>
        </div>
        <span className="text-xs font-bold text-teal-300 bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/30 font-mono">
          Dominant: {data?.prakriti?.dominant || "Pitta-Vata (पित्त-वात)"}
        </span>
      </div>

      {/* Tridosha Balance Bars */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-indigo-500/30 flex flex-col items-center gap-1.5 text-center">
          <div className="flex items-center gap-1.5 text-indigo-400 text-xs font-bold font-mono">
            <Wind className="w-4 h-4" /> Vata (वात)
          </div>
          <span className="text-xl font-black text-indigo-300 font-mono">{vata}%</span>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-indigo-400 h-full rounded-full" style={{ width: `${vata}%` }} />
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Kinetic / Nervous Force</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-amber-500/30 flex flex-col items-center gap-1.5 text-center">
          <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold font-mono">
            <Flame className="w-4 h-4" /> Pitta (पित्त)
          </div>
          <span className="text-xl font-black text-amber-300 font-mono">{pitta}%</span>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full" style={{ width: `${pitta}%` }} />
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Metabolic / Cellular Heat</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-teal-500/30 flex flex-col items-center gap-1.5 text-center">
          <div className="flex items-center gap-1.5 text-teal-400 text-xs font-bold font-mono">
            <Droplets className="w-4 h-4" /> Kapha (कफ)
          </div>
          <span className="text-xl font-black text-teal-300 font-mono">{kapha}%</span>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-teal-500 to-teal-400 h-full rounded-full" style={{ width: `${kapha}%` }} />
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Structural / Fluid Balance</span>
        </div>
      </div>

      {/* 10-Fold Parameters Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/5">
          <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">Sara (Tissue Quality)</span>
          <span className="text-xs font-bold text-slate-200 mt-0.5 block truncate">{data?.sara || "Madhyama (Moderate)"}</span>
        </div>
        <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/5">
          <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">Samhanana (Compactness)</span>
          <span className="text-xs font-bold text-slate-200 mt-0.5 block truncate">{data?.samhanana || "Madhyama (Well-knit)"}</span>
        </div>
        <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/5">
          <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">Ahara Shakti (Digestion)</span>
          <span className="text-xs font-bold text-slate-200 mt-0.5 block truncate">{data?.ahara_shakti || "Tikshnagni (High acid)"}</span>
        </div>
        <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/5">
          <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">Vyayama (Stamina)</span>
          <span className="text-xs font-bold text-slate-200 mt-0.5 block truncate">{data?.vyayama_shakti || "Avara (Low/Fatigued)"}</span>
        </div>
      </div>
    </div>
  );
}
