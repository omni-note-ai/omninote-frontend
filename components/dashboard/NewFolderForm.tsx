"use client";

import { useState, useRef, useEffect } from "react";
import { useApp } from "@/lib/store";

interface NewFolderFormProps {
  onClose: () => void;
  onCreated?: (subjectId: string) => void;
}

export default function NewFolderForm({ onClose, onCreated }: NewFolderFormProps) {
  const [value, setValue] = useState("");
  const { createSubject } = useApp();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleCreate = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    const subject = createSubject(trimmed);
    onCreated?.(subject.id);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleCreate();
    if (e.key === "Escape") onClose();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm mb-6">
      <p className="text-sm font-semibold text-gray-700 mb-3">
        Create New Subject Folder
      </p>
      <div className="flex items-center gap-3">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g., Advanced Mathematics"
          className="flex-1 border border-indigo-400 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition"
        />
        <button
          onClick={onClose}
          className="px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleCreate}
          disabled={!value.trim()}
          className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
        >
          Create
        </button>
      </div>
    </div>
  );
}