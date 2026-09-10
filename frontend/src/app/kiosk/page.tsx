"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  CheckCircle2, 
  Mic, 
  Camera, 
  FileText, 
  UploadCloud, 
  ShieldCheck, 
  AlertCircle, 
  Volume2, 
  Globe, 
  User, 
  Smartphone, 
  Heart, 
  Brain, 
  Flame, 
  Activity, 
  Wind, 
  Sparkles,
  QrCode,
  Printer,
  ChevronRight,
  ShieldAlert,
  Edit3
} from "lucide-react";
import Navbar from "@/components/Navbar";
import LanguageModal, { ALL_INDIAN_LANGUAGES } from "@/components/LanguageModal";
import VoiceRecorder from "@/components/VoiceRecorder";
import SeveritySlider from "@/components/SeveritySlider";
import DocumentScannerModal from "@/components/DocumentScannerModal";
import RedFlagBanner from "@/components/RedFlagBanner";
import { submitIntakeSession, sendOtp, verifyOtp } from "@/lib/api";
import { hospitalEventBus } from "@/lib/events";
import { LanguageCode, IntakeSession, RedFlagAlert, SocratesData, DashavidhaData, DocumentItem } from "@/lib/types";

export default function PatientKioskPage() {
  // Navigation step state: 1 (Welcome) -> 2 (Auth) -> 3 (Consent) -> 4 (Voice Intake) -> 5 (Pain/SOCRATES) -> 6 (AYUSH) -> 7 (Documents) -> 8 (Review) -> 9 (Confirmation/Token)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [language, setLanguage] = useState<string>("en");
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);

  // Authentication State
  const [authMethod, setAuthMethod] = useState<"abha" | "mobile" | "new">("mobile");
  const [mobileNumber, setMobileNumber] = useState("9876543210");
  const [otpCode, setOtpCode] = useState("123456");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Demographics
  const [patientName, setPatientName] = useState("Ramesh Sharma");
  const [patientAge, setPatientAge] = useState(52);
  const [patientGender, setPatientGender] = useState("Male");

  // Step 4: Conversational Voice State
  const [conversationIndex, setConversationIndex] = useState(0);
  const conversationQuestions = [
    {
      q: "Where exactly are you experiencing discomfort or pain?",
      fallbackOptions: [
        { label: "Chest (सीने में दर्द)", value: "Chest" },
        { label: "Head (सिर में दर्द)", value: "Head" },
        { label: "Stomach (पेट में दर्द)", value: "Stomach" },
        { label: "Back (पीठ में दर्द)", value: "Back" },
        { label: "Joints / Limbs (जोड़ों में दर्द)", value: "Joints" },
      ],
    },
    {
      q: "How long have you been experiencing this problem?",
      fallbackOptions: [
        { label: "Less than 1 hour ago", value: "Less than 1 hour ago" },
        { label: "Today / a few hours", value: "A few hours ago" },
        { label: "1 to 3 days", value: "1 to 3 days" },
        { label: "Over a week", value: "Over a week" },
        { label: "Months / Chronic", value: "Months / Chronic" },
      ],
    },
    {
      q: "Are you having any breathing difficulty, sweating, or dizziness?",
      fallbackOptions: [
        { label: "Yes, heavy breathing & sweating", value: "Yes, breathlessness & sweating" },
        { label: "Only mild breathlessness", value: "Mild breathlessness" },
        { label: "No other symptoms", value: "No other symptoms" },
      ],
    },
  ];
  const [chiefComplaint, setChiefComplaint] = useState(
    "Severe retrosternal chest pain radiating to left arm with breathlessness"
  );

  // Step 5: Natural SOCRATES Questions
  const [painSite, setPainSite] = useState("Central Chest");
  const [painOnset, setPainOnset] = useState("Sudden onset during light exertion");
  const [painCharacter, setPainCharacter] = useState("Crushing / Tight pressure");
  const [painRadiation, setPainRadiation] = useState("Radiates to Left Arm and Jaw");
  const [painFactors, setPainFactors] = useState("Worse with movement; No relief at rest");
  const [painSeverity, setPainSeverity] = useState<number>(8);

  // Step 6: AYUSH Assessment (Single sequential step at a time)
  const [ayushIndex, setAyushIndex] = useState(0);
  const ayushQuestions = [
    {
      key: "prakriti",
      title: "Body Constitution (Prakriti)",
      subtitle: "How would you describe your natural physical build and energy?",
      choices: [
        { label: "Slender / Active / Variable appetite (Vata)", value: "Vata" },
        { label: "Medium build / Sharp appetite / Sensitive to heat (Pitta)", value: "Pitta" },
        { label: "Broad build / Calm temperament / Steady stamina (Kapha)", value: "Kapha" },
      ],
    },
    {
      key: "ahara",
      title: "Digestion Pattern (Ahara Shakti)",
      subtitle: "How easily do you digest regular meals?",
      choices: [
        { label: "Irregular or variable digestion (Vishamagni)", value: "Vishamagni" },
        { label: "Intense appetite, prone to heartburn / acidity (Tikshnagni)", value: "Tikshnagni" },
        { label: "Heavy or slow digestion after meals (Mandagni)", value: "Mandagni" },
        { label: "Normal, balanced digestion (Samagni)", value: "Samagni" },
      ],
    },
    {
      key: "vyayama",
      title: "Physical Endurance (Vyayama Shakti)",
      subtitle: "How would you rate your typical physical stamina?",
      choices: [
        { label: "High stamina (Tolerates heavy physical exertion)", value: "Pravara" },
        { label: "Moderate stamina (Comfortable with moderate walking)", value: "Madhyama" },
        { label: "Low stamina / Easily fatigued currently", value: "Avara" },
      ],
    },
  ];
  const [ayushAnswers, setAyushAnswers] = useState<Record<string, string>>({
    prakriti: "Pitta",
    ahara: "Tikshnagni",
    vyayama: "Avara",
  });

  // Step 7: Documents & OCR
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Step 8 & 9: Red Flags & Final Token
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedSession, setGeneratedSession] = useState<IntakeSession | null>(null);

  const hasRedFlag = painSeverity >= 8 && painSite.toLowerCase().includes("chest");

  // Audio consent TTS
  const speakConsent = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const text =
        language === "hi"
          ? "कृपया ध्यान दें: यह प्रणाली आपकी स्वास्थ्य जानकारी एकत्र करती है ताकि आपके डॉक्टर को परामर्श में सहायता मिल सके।"
          : "Please note: We will ask a few simple questions about your health. Your answers will help your doctor prepare for your consultation.";
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === "hi" ? "hi-IN" : "en-IN";
      window.speechSynthesis.speak(utterance);
    }
  };

  // Submit case to backend
  const handleSubmitCase = async () => {
    setIsSubmitting(true);
    const sessionPayload: Partial<IntakeSession> = {
      patient_name: patientName,
      patient_age: patientAge,
      patient_gender: patientGender,
      patient_mobile: `+91 ${mobileNumber}`,
      language_code: (language as LanguageCode) || "en",
      chief_complaint: chiefComplaint,
      priority: hasRedFlag ? "high" : "normal",
      socrates: {
        site: painSite,
        onset: painOnset,
        character: painCharacter,
        radiation: painRadiation,
        exacerbating_factors: [painFactors],
        severity: painSeverity,
      },
      dashavidha: {
        prakriti: { dominant: ayushAnswers.prakriti },
        ahara_shakti: ayushAnswers.ahara,
        vyayama_shakti: ayushAnswers.vyayama,
      },
      documents: documents,
    };

    try {
      const created = await submitIntakeSession(sessionPayload);
      setGeneratedSession(created);

      // Emit event across hospital mesh
      hospitalEventBus.emit("INTAKE_COMPLETED", {
        sessionId: created.id,
        token: created.token_number,
        patientName: created.patient_name,
        priority: created.priority,
      });

      if (hasRedFlag) {
        hospitalEventBus.emit("RED_FLAG_TRIGGERED", {
          sessionId: created.id,
          severity: "high",
          ruleName: "Potential Acute Coronary Syndrome (ACS)",
          reason: "Severe crushing chest pain radiating to left arm",
        });
      }

      setCurrentStep(9); // Submission token page
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar />

      {/* Main Kiosk Viewport */}
      <main className="flex-1 pt-24 pb-16 px-4 sm:px-8 max-w-5xl mx-auto w-full flex flex-col justify-center">
        {/* =========================================================================
            SCREEN 1: PATIENT WELCOME
           ========================================================================= */}
        {currentStep === 1 && (
          <section className="kiosk-card p-8 sm:p-14 my-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Left Column: Greeting & Primary Actions */}
              <div className="lg:col-span-7 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-teal-700 text-white flex items-center justify-center shadow-sm">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xl font-black text-slate-900 tracking-tight block">
                      MediKiosk
                    </span>
                    <span className="text-xs font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                      Outpatient Self-Service Intake
                    </span>
                  </div>
                </div>

                <div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                    Your consultation starts here.
                  </h1>
                  <p className="text-lg sm:text-xl text-slate-600 font-medium mt-3 leading-relaxed">
                    Tell us about your health before meeting your doctor.
                  </p>
                </div>

                {/* Primary & Secondary CTAs */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="btn-kiosk-primary text-center"
                  >
                    Start Consultation
                    <ArrowRight className="w-5 h-5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="btn-kiosk-secondary text-center"
                  >
                    Continue Previous Session
                  </button>
                </div>

                {/* Language Selection Row */}
                <div className="pt-6 border-t border-slate-200/80">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Choose Language / भाषा चुनें
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsLangModalOpen(true)}
                      className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      More languages
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {[
                      { code: "en", label: "English" },
                      { code: "hi", label: "हिन्दी" },
                      { code: "kn", label: "ಕನ್ನಡ" },
                      { code: "ta", label: "தமிழ்" },
                      { code: "te", label: "తెలుగు" },
                    ].map((l) => (
                      <button
                        key={l.code}
                        type="button"
                        onClick={() => setLanguage(l.code)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all min-h-[44px] ${
                          language === l.code
                            ? "border-teal-700 bg-teal-50 text-teal-900 shadow-xs"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reassurance */}
                <div className="flex items-center gap-2 text-xs text-slate-500 pt-2">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  <span>Your information is handled securely according to healthcare privacy guidelines.</span>
                </div>
              </div>

              {/* Right Column: Friendly Healthcare Visual Card */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center p-8 bg-teal-50/50 rounded-3xl border border-teal-100 text-center">
                <div className="w-24 h-24 rounded-full bg-teal-700 text-white flex items-center justify-center shadow-md mb-6">
                  <Mic className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Speak or Touch</h3>
                <p className="text-sm text-slate-600 leading-relaxed max-w-xs">
                  Speak in your preferred regional language. The kiosk will prepare a clean summary for your consulting doctor.
                </p>
                <div className="mt-6 flex items-center gap-2 text-xs font-bold text-teal-800 bg-white px-3 py-1.5 rounded-full border border-teal-200 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  Average intake takes ~3 minutes
                </div>
              </div>
            </div>
          </section>
        )}

        {/* =========================================================================
            SCREEN 2: AUTHENTICATION
           ========================================================================= */}
        {currentStep === 2 && (
          <section className="kiosk-card p-8 sm:p-12 max-w-xl mx-auto w-full">
            <div className="text-center mb-8">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                Patient Identification
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 mt-3">Let's identify you</h2>
              <p className="text-sm text-slate-500 mt-1">
                Choose your preferred way to register or retrieve your OPD file.
              </p>
            </div>

            {/* 3 Large Clean Options */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { id: "mobile", label: "Mobile", icon: Smartphone },
                { id: "abha", label: "ABHA ID", icon: QrCode },
                { id: "new", label: "New Patient", icon: User },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setAuthMethod(item.id as any)}
                  className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all min-h-[80px] ${
                    authMethod === item.id
                      ? "border-teal-700 bg-teal-50 text-teal-900 font-bold"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 font-medium"
                  }`}
                >
                  <item.icon className="w-5 h-5 text-teal-700" />
                  <span className="text-xs">{item.label}</span>
                </button>
              ))}
            </div>

            {/* Input Form based on choice */}
            <div className="space-y-4">
              {authMethod === "mobile" && (
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-2">
                    Mobile Phone Number
                  </label>
                  <div className="flex gap-2">
                    <span className="px-4 py-3.5 bg-slate-100 border border-slate-200 rounded-2xl text-slate-700 font-bold text-base flex items-center">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      className="flex-1 px-4 py-3.5 rounded-2xl border-2 border-slate-300 focus:border-teal-600 outline-none text-lg font-bold text-slate-900 bg-white"
                      placeholder="Enter 10-digit number"
                    />
                  </div>
                </div>
              )}

              {authMethod === "abha" && (
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-2">
                    14-Digit ABHA Number or Address
                  </label>
                  <input
                    type="text"
                    defaultValue="91-2345-6789-0123"
                    className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-300 focus:border-teal-600 outline-none text-base font-bold text-slate-900 bg-white"
                    placeholder="e.g. 14-digit ABHA number"
                  />
                </div>
              )}

              {authMethod === "new" && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">Full Name</label>
                    <input
                      type="text"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-900 font-medium"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">Age</label>
                      <input
                        type="number"
                        value={patientAge}
                        onChange={(e) => setPatientAge(parseInt(e.target.value, 10))}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-900 font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">Gender</label>
                      <select
                        value={patientGender}
                        onChange={(e) => setPatientGender(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-900 font-medium bg-white"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="btn-kiosk-primary w-full mt-4"
              >
                Continue to Consent
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="w-full py-2 text-center text-sm font-semibold text-slate-500 hover:text-slate-800"
              >
                Back to Home
              </button>
            </div>
          </section>
        )}

        {/* =========================================================================
            SCREEN 3: CONSENT
           ========================================================================= */}
        {currentStep === 3 && (
          <section className="kiosk-card p-8 sm:p-12 max-w-xl mx-auto w-full">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto mb-4 border border-teal-200">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900">Before we begin</h2>
              <p className="text-base sm:text-lg text-slate-600 font-medium mt-3 leading-relaxed">
                We'll ask a few questions about your health. Your answers will help your doctor prepare for your consultation.
              </p>
            </div>

            {/* Audio Explanation Button */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4 my-6">
              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-teal-700 shrink-0" />
                <span className="text-sm font-bold text-slate-800">
                  Listen to this explanation
                </span>
              </div>
              <button
                type="button"
                onClick={speakConsent}
                className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:border-teal-600 text-xs font-bold text-teal-800 shadow-xs"
              >
                Play Audio
              </button>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="btn-kiosk-primary w-full"
              >
                Agree & Continue
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="btn-kiosk-secondary w-full"
              >
                I don't want to continue
              </button>
            </div>

            <p className="text-xs text-slate-400 text-center mt-6">
              DPDP Act (2023) compliant • Your health data is processed solely for your hospital visit.
            </p>
          </section>
        )}

        {/* =========================================================================
            SCREEN 4 & 5: AI CONVERSATION & ACTIVE VOICE STATE
           ========================================================================= */}
        {currentStep === 4 && (
          <section className="kiosk-card p-8 sm:p-12 w-full max-w-3xl mx-auto">
            {/* Top Step Header */}
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                  Patient Case Taking
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
                <span>Session: Active</span>
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              </div>
            </div>

            {/* Voice Recorder with Active States */}
            <VoiceRecorder
              questionText={conversationQuestions[conversationIndex].q}
              questionNumberText={`${conversationIndex + 1} of 3 intake questions answered`}
              touchOptions={conversationQuestions[conversationIndex].fallbackOptions}
              onAnswerReceived={(answer) => {
                setChiefComplaint(answer);
                if (conversationIndex < conversationQuestions.length - 1) {
                  setConversationIndex((prev) => prev + 1);
                } else {
                  setCurrentStep(5); // Proceed to Natural SOCRATES Pain Questions
                }
              }}
            />

            {/* Manual Skip / Forward */}
            <div className="flex justify-between items-center pt-8 mt-8 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  if (conversationIndex > 0) setConversationIndex((prev) => prev - 1);
                  else setCurrentStep(3);
                }}
                className="text-sm font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>

              <button
                type="button"
                onClick={() => {
                  if (conversationIndex < conversationQuestions.length - 1) {
                    setConversationIndex((prev) => prev + 1);
                  } else {
                    setCurrentStep(5);
                  }
                }}
                className="btn-kiosk-primary text-sm py-2.5 px-6 min-h-[48px]"
              >
                Next Question <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </section>
        )}

        {/* =========================================================================
            SCREEN 6: NATURAL SOCRATES PAIN QUESTIONS
           ========================================================================= */}
        {currentStep === 5 && (
          <section className="kiosk-card p-8 sm:p-12 w-full max-w-3xl mx-auto space-y-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                Understanding Your Symptoms
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                Tell us more about how you are feeling
              </h2>
            </div>

            {/* Natural Question 1: Location */}
            <div className="space-y-3">
              <label className="text-base font-bold text-slate-900 block">
                Where does the pain or discomfort occur?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  "Central Chest",
                  "Upper Abdomen",
                  "Head / Forehead",
                  "Lower Back",
                ].map((site) => (
                  <button
                    key={site}
                    type="button"
                    onClick={() => setPainSite(site)}
                    className={`p-3.5 rounded-xl border text-sm font-bold text-left transition-all ${
                      painSite === site
                        ? "border-teal-700 bg-teal-50 text-teal-900 shadow-xs"
                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    {site}
                  </button>
                ))}
              </div>
            </div>

            {/* Natural Question 2: What does it feel like? */}
            <div className="space-y-3">
              <label className="text-base font-bold text-slate-900 block">
                What does the pain feel like?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  "Crushing / Tight pressure",
                  "Burning / Acid sensation",
                  "Sharp / Stabbing pain",
                  "Dull constant ache",
                  "Throbbing sensation",
                ].map((char) => (
                  <button
                    key={char}
                    type="button"
                    onClick={() => setPainCharacter(char)}
                    className={`p-3.5 rounded-xl border text-sm font-bold text-left transition-all ${
                      painCharacter === char
                        ? "border-teal-700 bg-teal-50 text-teal-900 shadow-xs"
                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    {char}
                  </button>
                ))}
              </div>
            </div>

            {/* Natural Question 3: Does it move anywhere else? */}
            <div className="space-y-3">
              <label className="text-base font-bold text-slate-900 block">
                Does the pain move anywhere else?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  "Radiates to Left Arm and Jaw",
                  "Stays in one spot (Localized)",
                  "Spreads across Upper Back",
                  "Moves to Stomach / Abdomen",
                ].map((rad) => (
                  <button
                    key={rad}
                    type="button"
                    onClick={() => setPainRadiation(rad)}
                    className={`p-3.5 rounded-xl border text-sm font-bold text-left transition-all ${
                      painRadiation === rad
                        ? "border-teal-700 bg-teal-50 text-teal-900 shadow-xs"
                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    {rad}
                  </button>
                ))}
              </div>
            </div>

            {/* Natural Question 4: Severity Slider */}
            <div className="space-y-3">
              <label className="text-base font-bold text-slate-900 block">
                How severe is the discomfort right now?
              </label>
              <SeveritySlider value={painSeverity} onChange={(val) => setPainSeverity(val)} />
            </div>

            {/* Navigation CTAs */}
            <div className="flex justify-between items-center pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="text-sm font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep(6)}
                className="btn-kiosk-primary"
              >
                Proceed to AYUSH Assessment
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </section>
        )}

        {/* =========================================================================
            SCREEN 7: AYUSH ASSESSMENT (DASHAVIDHA PARIKSHA)
           ========================================================================= */}
        {currentStep === 6 && (
          <section className="kiosk-card p-8 sm:p-12 w-full max-w-2xl mx-auto space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                AYUSH Assessment
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                {ayushQuestions[ayushIndex].title}
              </h2>
              <p className="text-base text-slate-600 mt-1">
                {ayushQuestions[ayushIndex].subtitle}
              </p>
            </div>

            {/* Sequential Visual Choices */}
            <div className="space-y-3 my-6">
              {ayushQuestions[ayushIndex].choices.map((choice) => {
                const isSelected = ayushAnswers[ayushQuestions[ayushIndex].key] === choice.value;
                return (
                  <button
                    key={choice.value}
                    type="button"
                    onClick={() => {
                      setAyushAnswers((prev) => ({
                        ...prev,
                        [ayushQuestions[ayushIndex].key]: choice.value,
                      }));
                    }}
                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between min-h-[64px] ${
                      isSelected
                        ? "border-teal-700 bg-teal-50 text-teal-900 shadow-xs"
                        : "border-slate-200 bg-white hover:border-slate-300 text-slate-800"
                    }`}
                  >
                    <span className="text-base font-semibold">{choice.label}</span>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-teal-700 text-white flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Bottom Stepper Actions */}
            <div className="flex justify-between items-center pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  if (ayushIndex > 0) setAyushIndex((prev) => prev - 1);
                  else setCurrentStep(5);
                }}
                className="text-sm font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>

              <button
                type="button"
                onClick={() => {
                  if (ayushIndex < ayushQuestions.length - 1) {
                    setAyushIndex((prev) => prev + 1);
                  } else {
                    setCurrentStep(7); // Proceed to Document Scanning
                  }
                }}
                className="btn-kiosk-primary"
              >
                {ayushIndex < ayushQuestions.length - 1 ? "Next Question" : "Proceed to Records"}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </section>
        )}

        {/* =========================================================================
            SCREEN 8 & 9: DOCUMENT SCANNING & OCR REVIEW
           ========================================================================= */}
        {currentStep === 7 && (
          <section className="kiosk-card p-8 sm:p-12 w-full max-w-3xl mx-auto space-y-6">
            <div className="text-center max-w-lg mx-auto">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                Medical Records
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 mt-2">
                Do you have previous medical records?
              </h2>
              <p className="text-base text-slate-500 mt-1">
                Scanning your prescriptions and reports helps your doctor see your past treatments instantly.
              </p>
            </div>

            {/* 3 Large Clean Options */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <button
                type="button"
                onClick={() => setIsScannerOpen(true)}
                className="p-6 rounded-3xl border-2 border-teal-700 bg-teal-50/50 hover:bg-teal-100/50 flex flex-col items-center justify-center gap-3 transition-all min-h-[140px] text-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-teal-700 text-white flex items-center justify-center shadow-xs">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-base font-bold text-teal-900 block">Scan Document</span>
                  <span className="text-xs text-teal-700">Use kiosk camera</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setIsScannerOpen(true)}
                className="p-6 rounded-3xl border-2 border-slate-200 hover:border-slate-300 bg-white flex flex-col items-center justify-center gap-3 transition-all min-h-[140px] text-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-base font-bold text-slate-900 block">Upload Document</span>
                  <span className="text-xs text-slate-500">PDF or JPG files</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep(8)}
                className="p-6 rounded-3xl border-2 border-slate-200 hover:border-slate-300 bg-white flex flex-col items-center justify-center gap-3 transition-all min-h-[140px] text-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-base font-bold text-slate-700 block">No Previous Records</span>
                  <span className="text-xs text-slate-400">Skip directly to review</span>
                </div>
              </button>
            </div>

            {/* Scanned Documents List if added */}
            {documents.length > 0 && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 mt-6 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Attached Documents ({documents.length})
                </span>
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-teal-700" />
                      <div>
                        <span className="font-bold text-slate-900 block">{doc.original_filename}</span>
                        <span className="text-xs text-slate-500">
                          {doc.entities?.length || 0} clinical entities extracted cleanly
                        </span>
                      </div>
                    </div>
                    <span className="badge-clean badge-clean-success">
                      ✓ OCR Verified
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex justify-between items-center pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep(6)}
                className="text-sm font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep(8)}
                className="btn-kiosk-primary"
              >
                Review & Confirm <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </section>
        )}

        {/* =========================================================================
            SCREEN 10 & 11: PATIENT REVIEW & RED FLAG
           ========================================================================= */}
        {currentStep === 8 && (
          <section className="kiosk-card p-8 sm:p-12 w-full max-w-3xl mx-auto space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                Summary Verification
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 mt-2">
                Here's what we understood
              </h2>
              <p className="text-base text-slate-500 mt-1">
                Please verify the information before generating your OPD consultation token.
              </p>
            </div>

            {/* Emergency Red Flag Notice if present (Calm, non-frightening) */}
            {hasRedFlag && (
              <div className="p-6 rounded-3xl bg-red-50 border-2 border-red-200 text-red-950">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-red-800 bg-red-200/80 px-2.5 py-0.5 rounded-full">
                      Priority: HIGH
                    </span>
                    <h3 className="text-lg font-bold text-red-900 mt-2">
                      Your responses need immediate medical attention.
                    </h3>
                    <p className="text-sm text-red-800 mt-1">
                      Our clinical red-flag engine has marked this case for priority physician review. Please proceed to the waiting area after token generation.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Patient Summary Card */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 text-sm text-slate-700">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="font-bold text-slate-900 text-base">{patientName}</span>
                  <span className="text-xs text-slate-500 ml-2">
                    {patientAge}Y / {patientGender} • +91 {mobileNumber}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="text-xs font-bold text-teal-700 flex items-center gap-1 hover:underline"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase block">Main Concern</span>
                  <span className="font-semibold text-slate-900">{chiefComplaint}</span>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase block">Pain Characteristics</span>
                  <span className="font-semibold text-slate-900">
                    {painCharacter} ({painSeverity}/10 Severity)
                  </span>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase block">Pain Radiation</span>
                  <span className="font-semibold text-slate-900">{painRadiation}</span>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase block">AYUSH Constitution</span>
                  <span className="font-semibold text-slate-900">
                    {ayushAnswers.prakriti} Prakriti, {ayushAnswers.ahara}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep(7)}
                className="btn-kiosk-secondary w-full sm:w-auto"
              >
                Edit Answers
              </button>

              <button
                type="button"
                onClick={handleSubmitCase}
                disabled={isSubmitting}
                className="btn-kiosk-primary w-full sm:w-auto"
              >
                {isSubmitting ? "Generating Token..." : "Looks correct — Confirm & Submit"}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </section>
        )}

        {/* =========================================================================
            SCREEN 12: SUBMISSION & OPD TOKEN CONFIRMATION
           ========================================================================= */}
        {currentStep === 9 && (
          <section className="kiosk-card p-8 sm:p-12 w-full max-w-xl mx-auto text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto shadow-sm">
              <Check className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                Your information has been sent to your care team.
              </h2>
              <p className="text-base text-slate-600 mt-2">
                Your clinical case file and prescription records have been synced with the doctor's workstation.
              </p>
            </div>

            {/* Checklist items */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2 text-sm text-slate-700">
              <div className="flex items-center gap-2 text-green-800 font-medium">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>History collected & structured</span>
              </div>
              <div className="flex items-center gap-2 text-green-800 font-medium">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>Previous records processed</span>
              </div>
              <div className="flex items-center gap-2 text-green-800 font-medium">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>Doctor summary prepared</span>
              </div>
            </div>

            {/* Generated OPD Token Box */}
            <div className="p-6 rounded-3xl bg-teal-50 border-2 border-teal-600 text-center space-y-2 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-widest text-teal-800">
                Consultation Token Number
              </span>
              <div className="text-5xl sm:text-6xl font-black text-teal-950 font-mono tracking-tight">
                {generatedSession?.token_number || "OPD-042"}
              </div>
              <div className="text-sm font-bold text-teal-900 pt-1">
                Consultation Chamber 4 • Dr. Priya Deshmukh, MD
              </div>
            </div>

            <p className="text-lg font-bold text-slate-800">
              Please proceed to the waiting area.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => window.print()}
                className="btn-kiosk-secondary text-sm py-3 px-5 flex items-center gap-2 min-h-[48px]"
              >
                <Printer className="w-4 h-4" /> Print OPD Slip
              </button>

              <Link
                href="/doctor"
                className="btn-kiosk-primary text-sm py-3 px-5 flex items-center gap-2 min-h-[48px]"
              >
                View in Doctor Console <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </section>
        )}
      </main>

      {/* Reusable Document Scanner Modal */}
      <DocumentScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onDocumentProcessed={(doc) => {
          setDocuments((prev) => [...prev, doc]);
        }}
      />

      {/* Reusable Multilingual Modal */}
      <LanguageModal
        isOpen={isLangModalOpen}
        selectedLanguage={language}
        onSelectLanguage={(code) => setLanguage(code)}
        onClose={() => setIsLangModalOpen(false)}
      />
    </div>
  );
}
