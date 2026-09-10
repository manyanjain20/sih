"use client";

import { Leaf, Flame, Droplets, Wind, Sparkles } from "lucide-react";
import { DashavidhaData } from "@/lib/types";

interface DashavidhaRadarProps {
  data?: DashavidhaData;
}

export default function DashavidhaRadar({ data }: DashavidhaRadarProps) {
  if (!data) return null;

  const vata = data.prakriti?.vata ?? 35;
  const pitta = data.prakriti?.pitta ?? 45;
  const kapha = data.prakriti?.kapha ?? 20;

  return (
    <div className="rounded-2xl bg-gradient-to-b from-slate-900/90 to-[#0b1b2d] border border-teal-500/20 p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-teal-500/20 text-teal-300">
            <Leaf className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
              AYUSH Dashavidha Pariksha Matrix
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 font-extrabold uppercase">
                10-Fold
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">Ayurvedic Prakriti & Physiological Assessment</p>
          </div>
        </div>
        <span className="text-xs font-bold text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-full border border-teal-500/20">
          Dominant: {data.prakriti?.dominant || "Pitta-Vata"}
        </span>
      </div>

      {/* Tridosha Balance Bars */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-xl bg-slate-950/60 border border-indigo-500/30 flex flex-col items-center gap-1.5 text-center">
          <div className="flex items-center gap-1 text-indigo-400 text-xs font-bold">
            <Wind className="w-3.5 h-3.5" /> Vata
          </div>
          <span className="text-lg font-extrabold text-indigo-300">{vata}%</span>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-indigo-400 h-full rounded-full" style={{ width: `${vata}%` }} />
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Kinetic / Nervous</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/60 border border-amber-500/30 flex flex-col items-center gap-1.5 text-center">
          <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
            <Flame className="w-3.5 h-3.5" /> Pitta
          </div>
          <span className="text-lg font-extrabold text-amber-300">{pitta}%</span>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-amber-400 h-full rounded-full" style={{ width: `${pitta}%` }} />
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Metabolic / Heat</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/60 border border-teal-500/30 flex flex-col items-center gap-1.5 text-center">
          <div className="flex items-center gap-1 text-teal-400 text-xs font-bold">
            <Droplets className="w-3.5 h-3.5" /> Kapha
          </div>
          <span className="text-lg font-extrabold text-teal-300">{kapha}%</span>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-teal-400 h-full rounded-full" style={{ width: `${kapha}%` }} />
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Structural / Fluid</span>
        </div>
      </div>

      {/* 10-Fold Parameters Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
        <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Sara (Tissue Quality)</span>
          <span className="text-xs font-semibold text-slate-200 mt-0.5 block truncate">{data.sara || "Madhyama"}</span>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Samhanana (Compactness)</span>
          <span className="text-xs font-semibold text-slate-200 mt-0.5 block truncate">{data.samhanana || "Madhyama"}</span>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Ahara Shakti (Digestion)</span>
          <span className="text-xs font-semibold text-slate-200 mt-0.5 block truncate">{data.ahara_shakti || "Madhyama"}</span>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Sattva (Mental Resilience)</span>
          <span className="text-xs font-semibold text-slate-200 mt-0.5 block truncate">{data.sattva || "Pravara"}</span>
        </div>
      </div>
    </div>
  );
}
