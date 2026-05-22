"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, PenLine, Camera, Sparkles } from "lucide-react";
import { useApp } from "@/lib/store";

type Tab = "text" | "captures";

export default function NotePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { notes, updateNote } = useApp();
  const [tab, setTab] = useState<Tab>("text");
  const [content, setContent] = useState("");
  const [saved, setSaved] = useState(true);

  const note = notes.find((n) => n.id === id);

  useEffect(() => {
    if (note) setContent(note.content);
  }, [note?.id]);

  const handleChange = (val: string) => {
    setContent(val);
    setSaved(false);
  };

  const save = useCallback(() => {
    if (!note) return;
    updateNote(id, content);
    setSaved(true);
  }, [id, content, note, updateNote]);

  useEffect(() => {
    if (saved) return;
    const timer = setTimeout(save, 2000);
    return () => clearTimeout(timer);
  }, [content, saved, save]);

  if (!note) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        Note not found.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-8 py-4 border-b border-gray-100 bg-white">
        <div className="flex items-center gap-3">
          <button
            onClick={() => { save(); router.back(); }}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-gray-500" />
          </button>
          <h1 className="text-lg font-bold text-gray-800">{note.title}</h1>
          {!saved && (
            <span className="text-xs text-gray-400 italic">Saving...</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTab("text")}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full border transition-colors ${
              tab === "text"
                ? "border-indigo-300 bg-indigo-50 text-indigo-600"
                : "border-gray-200 text-gray-500 hover:bg-gray-50"
            }`}
          >
            <PenLine className="w-3.5 h-3.5" />
            Text Notes
          </button>
          <button
            onClick={() => setTab("captures")}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full border transition-colors ${
              tab === "captures"
                ? "border-indigo-300 bg-indigo-50 text-indigo-600"
                : "border-gray-200 text-gray-500 hover:bg-gray-50"
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            Captures
          </button>
        </div>
      </div>

      <div className="flex-1 px-8 py-6 relative">
        <div className="flex justify-end mb-3">
          <button className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-full transition-colors">
            <Sparkles className="w-3.5 h-3.5" />
            AI Summarize
          </button>
        </div>

        {tab === "text" ? (
          <textarea
            value={content}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={save}
            placeholder="Start writing your notes..."
            className="w-full h-[calc(100vh-220px)] border border-indigo-200 rounded-xl p-5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 resize-none transition bg-white"
          />
        ) : (
          <div className="border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center h-64 text-center">
            <Camera className="w-10 h-10 text-gray-200 mb-3" />
            <p className="text-gray-400 text-sm">No captures yet.</p>
            <p className="text-gray-300 text-xs mt-1">
              Upload images or screenshots here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}