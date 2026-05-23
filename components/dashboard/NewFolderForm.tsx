"use client";

import { useState, useRef, useEffect } from "react";
import { useApp } from "@/lib/store";

export default function NewFolderForm({ onClose, onCreated }: { onClose: () => void; onCreated?: (id: string) => void }) {
  const [value, setValue] = useState("");
  const { createSubject } = useApp();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleCreate = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    const subject = createSubject(trimmed);
    onCreated?.(subject.id);
    onClose();
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm mb-6">
      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Create New Subject Folder</p>
      <div className="flex items-center gap-3">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); if (e.key === "Escape") onClose(); }}
          placeholder="e.g., Advanced Mathematics"
          className="flex-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 transition"
        />
        <button
          onClick={onClose}
          className="px-4 py-2.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleCreate}
          disabled={!value.trim()}
          className="px-5 py-2.5 text-sm font-semibold text-white bg-gray-900 dark:bg-gray-100 dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
        >
          Create
        </button>
      </div>
    </div>
  );
}