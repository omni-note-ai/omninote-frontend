"use client";

import { useApp } from "@/lib/store";
import { useRouter } from "next/navigation";
import { PenLine, Sparkles, GripVertical, Minimize2, ArrowRight } from "lucide-react";
import ThemeToggle from "@/components/common/ThemeToggle";
import { useState } from "react";

export default function LandingPage() {
  const router = useRouter();
  const { isLoggedIn } = useApp();
  const [showAiTip, setShowAiTip] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950 px-6 relative overflow-hidden transition-colors duration-300">
      
      {/* Background Decorative Mesh Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[50%] bg-[radial-gradient(circle_at_center,rgba(243,244,246,0.8),transparent_70%)] dark:bg-[radial-gradient(circle_at_center,rgba(31,41,55,0.2),transparent_70%)] blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[50%] bg-[radial-gradient(circle_at_center,rgba(243,244,246,0.8),transparent_70%)] dark:bg-[radial-gradient(circle_at_center,rgba(31,41,55,0.2),transparent_70%)] blur-3xl pointer-events-none" />

      {/* Top Header Row */}
      <header className="absolute top-0 left-0 right-0 flex items-center justify-between px-10 py-6 z-10">
        <div className="flex items-center gap-2">
          <PenLine className="w-5 h-5 text-gray-800 dark:text-gray-200" strokeWidth={2.2} />
          <span className="font-bold text-gray-900 dark:text-white tracking-tight">OmniNotes</span>
        </div>
        <ThemeToggle />
      </header>

      {/* Main Core Presentation */}
      <main className="flex flex-col items-center max-w-2xl text-center z-10">
        {/* Nib Box Logo Container */}
        <div className="w-16 h-16 rounded-2xl bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 flex items-center justify-center shadow-sm mb-8 transition-transform hover:scale-105 duration-300">
          <PenLine className="w-7 h-7 text-gray-800 dark:text-gray-200" strokeWidth={1.8} />
        </div>

        {/* Brand Title */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4 select-none">
          OmniNotes.
        </h1>

        {/* Spacing and Description Paragraph */}
        <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base max-w-lg leading-relaxed mb-9">
          A focused, intelligent space for your thoughts. Organize subjects, write notes, and leverage AI to summarize your learning without the visual noise.
        </p>

        {/* Enter Workspace Action Button */}
        <button
          onClick={() => router.push(isLoggedIn ? "/home" : "/login")}
          className="flex items-center gap-2 px-7 py-3 bg-gray-950 dark:bg-gray-50 text-white dark:text-gray-950 text-sm font-semibold rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 active:scale-97 transition-all duration-200 shadow-sm cursor-pointer"
        >
          <span>Enter Workspace</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </main>

      {/* Floating Bottom Right Pill Panel widget */}
      <div className="fixed bottom-8 right-8 flex flex-col items-center gap-5 bg-gray-950 text-white rounded-2xl py-4.5 px-3 shadow-xl border border-gray-900 transition-all duration-300 z-50">
        {/* Grip Area */}
        <div className="text-gray-600 cursor-default">
          <GripVertical className="w-4 h-4 opacity-50" />
        </div>

        {/* Sparkles Tool */}
        <button
          onClick={() => setShowAiTip(!showAiTip)}
          className={`p-1.5 rounded-xl transition-all relative group ${
            showAiTip ? "bg-gray-800 text-yellow-300" : "text-gray-400 hover:text-white hover:bg-gray-800"
          }`}
          aria-label="Toggle AI Tip"
        >
          <Sparkles className="w-4.5 h-4.5" />
          
          {/* Default Hover Tooltip */}
          <span className="absolute right-12 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 shadow-lg border border-gray-800">
            Intelligent AI Active
          </span>
        </button>

        {/* Diagonal Action */}
        <button 
          onClick={() => router.push(isLoggedIn ? "/home" : "/login")}
          className="p-1 text-gray-600 hover:text-gray-400 transition-colors"
          aria-label="Toggle panel size"
        >
          <Minimize2 className="w-4 h-4" />
        </button>
      </div>

      {/* AI Feature Panel Drawer Tip */}
      {showAiTip && (
        <div className="fixed bottom-32 right-8 max-w-xs bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-4.5 shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            <h4 className="text-sm font-bold text-gray-950 dark:text-white">AI Summarizer Panel</h4>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-normal">
            OmniNotes includes automated summarization tools, text capture parsing, and interactive study items. Log in to start querying!
          </p>
          <button
            onClick={() => setShowAiTip(false)}
            className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 hover:text-gray-600 dark:hover:text-gray-250 mt-3 transition-colors block text-right w-full"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}