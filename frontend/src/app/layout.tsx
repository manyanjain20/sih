import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import LiveEventDock from "@/components/LiveEventDock";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MediKiosk — AI Patient Case-Taking & Medical Document Digitization | SIH 2026",
  description: "Assistive AI pre-consultation patient intake platform for high-density hospital OPDs. Features multilingual voice intake, SOCRATES symptom protocol, AYUSH Dashavidha Pariksha, and prescription OCR digitization.",
  keywords: ["MediKiosk", "SIH 2026", "AI OPD Intake", "SOCRATES Protocol", "AYUSH", "Medical OCR"],
  authors: [{ name: "Team EightBit" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-teal-500/20 selection:text-teal-900">
        {children}
        <LiveEventDock />
      </body>
    </html>
  );
}
