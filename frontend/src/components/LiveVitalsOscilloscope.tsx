"use client";

import { useRef, useEffect, useState } from "react";
import { Activity, Heart, Radio } from "lucide-react";
import { hospitalEventBus } from "@/lib/events";

interface LiveVitalsProps {
  heartRate?: number;
  bloodPressure?: string;
  spO2?: number;
}

export default function LiveVitalsOscilloscope({
  heartRate = 98,
  bloodPressure = "142/92",
  spO2 = 97,
}: LiveVitalsProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hr, setHr] = useState(heartRate);
  const [bp, setBp] = useState(bloodPressure);
  const [spo2Val, setSpo2Val] = useState(spO2);
  const [isAlert, setIsAlert] = useState(false);

  useEffect(() => {
    // Listen for live vitals events
    const unsub = hospitalEventBus.on("VITALS_TICK", (evt) => {
      if (evt.payload?.heartRate) setHr(evt.payload.heartRate);
      if (evt.payload?.bloodPressure) setBp(evt.payload.bloodPressure);
      if (evt.payload?.spO2) setSpo2Val(evt.payload.spO2);
      if (evt.payload?.status === "TACHYCARDIA_SPIKE") {
        setIsAlert(true);
        setTimeout(() => setIsAlert(false), 5000);
      }
    });

    const unsubRf = hospitalEventBus.on("RED_FLAG_TRIGGERED", () => {
      setIsAlert(true);
      setHr(126);
      setTimeout(() => setIsAlert(false), 7000);
    });

    return () => {
      unsub();
      unsubRf();
    };
  }, []);

  // HTML5 Canvas ECG Oscilloscope drawing loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let x = 0;
    const height = canvas.height;
    const width = canvas.width;
    const midY = height / 2;

    // Background clear with dark medical grid
    ctx.fillStyle = "#050e1a";
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = "rgba(16, 185, 129, 0.08)";
    ctx.lineWidth = 1;
    for (let gx = 0; gx < width; gx += 15) {
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, height);
      ctx.stroke();
    }
    for (let gy = 0; gy < height; gy += 15) {
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(width, gy);
      ctx.stroke();
    }

    let beatPhase = 0;

    const render = () => {
      const step = isAlert ? 3 : 2;
      const beatInterval = Math.max(35, Math.floor(2400 / hr));

      // Erase ahead bar
      ctx.fillStyle = "#050e1a";
      ctx.fillRect(x, 0, 18, height);

      // Re-draw grid ahead
      ctx.strokeStyle = "rgba(16, 185, 129, 0.08)";
      for (let gy = 0; gy < height; gy += 15) {
        ctx.beginPath();
        ctx.moveTo(x, gy);
        ctx.lineTo(x + 18, gy);
        ctx.stroke();
      }

      // Calculate ECG curve point (P-Q-R-S-T wave)
      let y = midY;
      const phaseInBeat = beatPhase % beatInterval;

      if (phaseInBeat === 6) y = midY - 6; // P wave
      else if (phaseInBeat === 7) y = midY - 10;
      else if (phaseInBeat === 8) y = midY - 4;
      else if (phaseInBeat === 12) y = midY + 5; // Q wave
      else if (phaseInBeat === 14) y = midY - 32; // R spike
      else if (phaseInBeat === 15) y = midY + 12; // S wave
      else if (phaseInBeat === 20) y = midY - 8; // T wave
      else if (phaseInBeat === 21) y = midY - 12;
      else if (phaseInBeat === 22) y = midY - 6;

      // Draw ECG line with glow
      ctx.beginPath();
      ctx.strokeStyle = isAlert ? "#f43f5e" : "#10b981";
      ctx.shadowColor = isAlert ? "#f43f5e" : "#10b981";
      ctx.shadowBlur = 8;
      ctx.lineWidth = 2.2;
      ctx.moveTo(x, midY);
      ctx.lineTo(x + step, y);
      ctx.stroke();
      ctx.shadowBlur = 0;

      x += step;
      beatPhase++;

      if (x >= width) {
        x = 0;
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [hr, isAlert]);

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-950/90 p-2.5 rounded-2xl border border-slate-800 shadow-xl">
      {/* Canvas Oscilloscope */}
      <div className="relative overflow-hidden rounded-xl border border-emerald-500/30 bg-[#050e1a] shadow-inner">
        <canvas
          ref={canvasRef}
          width={180}
          height={52}
          className="w-[180px] h-[52px] block"
        />
        <div className="absolute top-1 left-2 flex items-center gap-1 text-[9px] font-mono font-bold text-emerald-400">
          <Activity className="w-2.5 h-2.5 animate-pulse" />
          <span>LEAD II • ECG</span>
        </div>
      </div>

      {/* Telemetry Numeric Readouts */}
      <div className="flex items-center gap-2">
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${
            isAlert
              ? "bg-red-950/60 border-red-500/50 text-red-300 animate-pulse"
              : "bg-slate-900 border-slate-800 text-slate-200"
          }`}
        >
          <Heart className={`w-4 h-4 ${isAlert ? "text-red-400" : "text-rose-400"} animate-pulse`} />
          <div>
            <span className="text-[9px] text-slate-400 block font-semibold uppercase">PULSE</span>
            <span className="text-xs font-black font-mono">{hr} bpm</span>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200">
          <Activity className="w-4 h-4 text-cyan-400" />
          <div>
            <span className="text-[9px] text-slate-400 block font-semibold uppercase">BP</span>
            <span className="text-xs font-black font-mono">{bp}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200">
          <Radio className="w-4 h-4 text-emerald-400" />
          <div>
            <span className="text-[9px] text-slate-400 block font-semibold uppercase">SPO2</span>
            <span className="text-xs font-black font-mono">{spo2Val}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
