"use client";

import { useRef, useEffect, useState } from "react";
import { Activity, Heart, Radio, AlertTriangle } from "lucide-react";
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
    ctx.fillStyle = "#030812";
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = "rgba(20, 184, 166, 0.1)";
    ctx.lineWidth = 1;
    for (let gx = 0; gx < width; gx += 16) {
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, height);
      ctx.stroke();
    }
    for (let gy = 0; gy < height; gy += 16) {
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(width, gy);
      ctx.stroke();
    }

    let beatPhase = 0;

    const render = () => {
      const step = isAlert ? 3 : 2;
      const beatInterval = Math.max(35, Math.floor(2600 / hr));

      // Erase ahead bar
      ctx.fillStyle = "#030812";
      ctx.fillRect(x, 0, 24, height);

      // Re-draw grid ahead
      ctx.strokeStyle = "rgba(20, 184, 166, 0.1)";
      for (let gy = 0; gy < height; gy += 16) {
        ctx.beginPath();
        ctx.moveTo(x, gy);
        ctx.lineTo(x + 24, gy);
        ctx.stroke();
      }

      // Calculate ECG curve point (P-Q-R-S-T wave)
      let y = midY;
      const phaseInBeat = beatPhase % beatInterval;

      if (phaseInBeat === 6) y = midY - 6; // P wave
      else if (phaseInBeat === 7) y = midY - 11;
      else if (phaseInBeat === 8) y = midY - 5;
      else if (phaseInBeat === 12) y = midY + 6; // Q wave
      else if (phaseInBeat === 14) y = midY - 34; // R spike
      else if (phaseInBeat === 15) y = midY + 14; // S wave
      else if (phaseInBeat === 20) y = midY - 8; // T wave
      else if (phaseInBeat === 21) y = midY - 13;
      else if (phaseInBeat === 22) y = midY - 6;

      // Draw ECG line with glow
      ctx.beginPath();
      ctx.strokeStyle = isAlert ? "#f43f5e" : "#14b8a6";
      ctx.shadowColor = isAlert ? "#f43f5e" : "#14b8a6";
      ctx.shadowBlur = 10;
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
    <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-[#0a0f1d]/90 p-4 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl">
      {/* Canvas Oscilloscope */}
      <div className="relative overflow-hidden rounded-2xl border border-teal-500/30 bg-[#030812] shadow-inner w-full lg:w-auto">
        <canvas
          ref={canvasRef}
          width={320}
          height={68}
          className="w-full lg:w-[320px] h-[68px] block"
        />
        <div className="absolute top-2 left-3 flex items-center gap-1.5 text-[10px] font-mono font-bold text-teal-400">
          <Activity className="w-3 h-3 animate-pulse" />
          <span>REAL-TIME LEAD II ECG • 25mm/s</span>
        </div>
      </div>

      {/* Telemetry Numeric Readouts */}
      <div className="grid grid-cols-3 gap-3 w-full lg:w-auto">
        <div
          className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border transition-all ${
            isAlert
              ? "bg-red-950/60 border-red-500/50 text-red-300 animate-pulse"
              : "bg-slate-900 border-white/5 text-slate-200"
          }`}
        >
          <Heart className={`w-5 h-5 ${isAlert ? "text-red-400" : "text-rose-400"} animate-pulse shrink-0`} />
          <div>
            <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">HEART RATE</span>
            <span className="text-base font-black font-mono text-white">{hr} <span className="text-xs font-normal text-slate-400">bpm</span></span>
          </div>
        </div>

        <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-900 border border-white/5 text-slate-200">
          <Activity className="w-5 h-5 text-teal-400 shrink-0" />
          <div>
            <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">BLOOD PRESSURE</span>
            <span className="text-base font-black font-mono text-white">{bp} <span className="text-xs font-normal text-slate-400">mmHg</span></span>
          </div>
        </div>

        <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-900 border border-white/5 text-slate-200">
          <Radio className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">OXYGEN SPO2</span>
            <span className="text-base font-black font-mono text-teal-300">{spo2Val}% <span className="text-xs font-normal text-slate-400">Room Air</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}
