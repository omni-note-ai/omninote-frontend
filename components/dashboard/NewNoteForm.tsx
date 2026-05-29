"use client";

import { useState, useRef, useEffect } from "react";
import { useApp } from "@/lib/store";
import { useToast } from "@/components/common/ToastProvider";
import { FilePlus, X } from "lucide-react";

export default function NewNoteForm({
  subjectId,
  onClose,
  onCreated,
}: {
  subjectId: string;
  onClose: () => void;
  onCreated?: (noteId: string) => void;
}) {
  const [value, setValue] = useState("");
  const { createNote } = useApp();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleCreate = async () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    try {
      const note = await createNote(trimmed, subjectId);
      toast(`Created note "${trimmed}"`, "success");
      onCreated?.(note.id);
      onClose();
    } catch (e) {
      console.error(e);
      toast("Failed to create note", "error");
    }
  };

  return (
    <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border border-gray-200/40 dark:border-gray-800 rounded-3xl p-6 shadow-xl mb-6 animate-in slide-in-from-top-4 duration-300 relative">
      <button
        onClick={onClose}
        className="absolute top-4.5 right-4.5 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-650 transition cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-2 mb-3.5">
        <FilePlus className="w-4.5 h-4.5 text-gray-800 dark:text-gray-300 animate-pulse" />
        <h4 className="text-xs.5 font-bold text-gray-900 dark:text-gray-100">
          Create New Class Note
        </h4>
      </div>

      <div className="flex items-center gap-3">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleCreate();
            if (e.key === "Escape") onClose();
          }}
          placeholder="e.g., Lecture 1: Core Definitions, Exam Study Guide..."
          className="flex-1 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-850 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-950 dark:focus:ring-gray-700 transition shadow-inner"
        />
        <button
          onClick={handleCreate}
          disabled={!value.trim()}
          className="px-5 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed rounded-2xl transition shadow-md cursor-pointer shrink-0"
        >
          Create Note
        </button>
      </div>
    </div>
  );
}