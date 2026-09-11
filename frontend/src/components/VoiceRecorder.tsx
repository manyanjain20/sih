"use client";

import { useState, useEffect } from "react";
import { Mic, MicOff, AlertCircle, RefreshCw, Keyboard, Check, Volume2, Sparkles } from "lucide-react";

export type VoiceState = "idle" | "listening" | "processing" | "followup" | "error";

interface VoiceRecorderProps {
  questionText: string;
  questionNumberText?: string;
  onAnswerReceived: (answer: string) => void;
  touchOptions?: { label: string; value: string }[];
  placeholderText?: string;
}

export default function VoiceRecorder({
  questionText,
  questionNumberText = "1 question answered",
  onAnswerReceived,
  touchOptions = [
    { label: "Chest (सीने में)", value: "Chest" },
    { label: "Head (सिर में)", value: "Head" },
    { label: "Stomach (पेट में)", value: "Stomach" },
    { label: "Back (पीठ में)", value: "Back" },
    { label: "Other", value: "Other location" },
  ],
  placeholderText = "Speak naturally about what you are feeling...",
}: VoiceRecorderProps) {
  const [state, setState] = useState<VoiceState>("idle");
  const [typedText, setTypedText] = useState("");
  const [showTypeInput, setShowTypeInput] = useState(false);
  const [simulatedVolume, setSimulatedVolume] = useState([25, 45, 75, 55, 30, 60, 40]);

  // Audio waveform animation when listening
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (state === "listening") {
      interval = setInterval(() => {
        setSimulatedVolume([
          Math.floor(20 + Math.random() * 50),
          Math.floor(30 + Math.random() * 65),
          Math.floor(45 + Math.random() * 55),
          Math.floor(25 + Math.random() * 70),
          Math.floor(40 + Math.random() * 60),
          Math.floor(30 + Math.random() * 50),
          Math.floor(20 + Math.random() * 45),
        ]);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [state]);

  const handleMicClick = () => {
    if (state === "idle" || state === "error") {
      setState("listening");
      // Simulate listening transition to processing after 3.5s
      setTimeout(() => {
        setState("processing");
        setTimeout(() => {
          setState("idle");
          onAnswerReceived("Severe discomfort in central chest radiating to arm");
        }, 1400);
      }, 3500);
    } else if (state === "listening") {
      setState("processing");
      setTimeout(() => {
        setState("idle");
        onAnswerReceived("Severe discomfort in central chest radiating to arm");
      }, 1200);
    }
  };

  const handleTouchOption = (opt: { label: string; value: string }) => {
    onAnswerReceived(opt.value);
  };

  const handleTypedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedText.trim()) return;
    onAnswerReceived(typedText.trim());
    setTypedText("");
    setShowTypeInput(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center text-center">
      {/* Question Card */}
      <div className="w-full mb-6">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-snug">
          {questionText}
        </h2>
        <p className="mt-2 text-base text-slate-500 font-medium">
          Speak your answer naturally in your mother tongue, or select one of the quick options below.
        </p>
      </div>

      {/* Voice State Visualizer & Ripple Rings */}
      <div className="flex flex-col items-center justify-center my-6 relative">
        {/* Pulsing ripples during listening */}
        {state === "listening" && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="w-36 h-36 rounded-full bg-red-500/15 animate-ping duration-1000"></span>
            <span className="w-48 h-48 rounded-full bg-red-500/10 animate-pulse"></span>
          </div>
        )}

        <button
          type="button"
          onClick={handleMicClick}
          aria-label="Microphone"
          className={`relative z-10 w-32 h-32 rounded-full flex flex-col items-center justify-center cursor-pointer transition-all duration-300 shadow-xl ${
            state === "listening"
              ? "bg-red-50 border-4 border-red-500 text-red-600 scale-105"
              : state === "processing"
              ? "bg-teal-50 border-4 border-teal-500 text-teal-600 scale-100"
              : "bg-gradient-to-br from-teal-50 to-teal-100/70 border-4 border-teal-600 text-teal-700 hover:scale-105 hover:shadow-2xl"
          }`}
        >
          {state === "listening" ? (
            <Mic className="w-12 h-12 animate-pulse text-red-600" />
          ) : state === "processing" ? (
            <RefreshCw className="w-10 h-10 animate-spin text-teal-700" />
          ) : (
            <Mic className="w-12 h-12 text-teal-700" />
          )}
        </button>

        {/* State Label */}
        <div className="mt-5 min-h-[32px] flex items-center justify-center">
          {state === "idle" && (
            <span className="text-base sm:text-lg font-bold text-slate-700">
              Tap the microphone to speak
            </span>
          )}
          {state === "listening" && (
            <div className="flex items-center gap-2 text-base sm:text-lg font-black text-red-600">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
              Listening... Speak in Hindi, English, Kannada or Tamil
            </div>
          )}
          {state === "processing" && (
            <div className="flex items-center gap-2 text-base sm:text-lg font-bold text-teal-700">
              <Sparkles className="w-4 h-4 text-teal-600 animate-spin" />
              Structuring clinical response with AI...
            </div>
          )}
          {state === "error" && (
            <div className="flex items-center gap-1.5 text-base font-semibold text-amber-700">
              <AlertCircle className="w-5 h-5" />
              I couldn't hear you clearly.
            </div>
          )}
        </div>

        {/* Dynamic Waveform Visualizer */}
        {state === "listening" && (
          <div className="flex items-center gap-1.5 h-10 mt-3 px-4 py-2 rounded-full bg-red-50 border border-red-200">
            {simulatedVolume.map((vol, idx) => (
              <div
                key={idx}
                className="w-1.5 bg-red-500 rounded-full transition-all duration-100"
                style={{ height: `${vol}%` }}
              />
            ))}
          </div>
        )}

        {/* Error State Fallback Actions */}
        {state === "error" && (
          <div className="flex items-center gap-3 mt-3">
            <button
              type="button"
              onClick={() => setState("listening")}
              className="px-4 py-2 rounded-xl bg-teal-50 text-teal-800 text-sm font-bold border border-teal-200 hover:bg-teal-100"
            >
              Try Again
            </button>
            <button
              type="button"
              onClick={() => setShowTypeInput(true)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold border border-slate-300 hover:bg-slate-200"
            >
              Use Touch / Type
            </button>
          </div>
        )}

        {/* Type instead secondary toggle */}
        {!showTypeInput && state !== "listening" && state !== "processing" && (
          <button
            type="button"
            onClick={() => setShowTypeInput(true)}
            className="mt-4 text-xs font-semibold text-slate-500 hover:text-teal-700 flex items-center gap-1.5 py-1.5 px-3.5 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
          >
            <Keyboard className="w-4 h-4" />
            Prefer to type? Click here
          </button>
        )}
      </div>

      {/* Manual Typing Form */}
      {showTypeInput && (
        <form onSubmit={handleTypedSubmit} className="w-full max-w-lg mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              value={typedText}
              onChange={(e) => setTypedText(e.target.value)}
              placeholder="Type your response here..."
              className="flex-1 px-4 py-3.5 rounded-2xl border-2 border-slate-300 focus:border-teal-600 outline-none text-base font-medium text-slate-900 bg-white shadow-sm"
              autoFocus
            />
            <button
              type="submit"
              className="px-6 py-3.5 bg-teal-700 text-white rounded-2xl font-bold hover:bg-teal-800 transition-colors shadow-sm"
            >
              Submit
            </button>
          </div>
        </form>
      )}

      {/* Touch Fallback: Choose an answer with dual language labels */}
      <div className="w-full mt-4 pt-6 border-t border-slate-200/80">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 text-center">
          Or tap your answer directly:
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {touchOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleTouchOption(opt)}
              className="px-5 py-3 rounded-2xl border border-slate-200 bg-white hover:border-teal-600 hover:bg-teal-50 text-slate-800 text-base font-semibold transition-all shadow-xs hover:shadow-md hover:scale-[1.02] min-h-[52px]"
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Natural progress indicator */}
      <div className="mt-8 text-xs font-semibold text-slate-400">
        {questionNumberText}
      </div>
    </div>
  );
}
