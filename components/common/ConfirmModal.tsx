"use client";

import { AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isDanger = true,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 dark:bg-black/60 flex items-center justify-center z-[9999] animate-in fade-in duration-200 px-6 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl p-6.5 shadow-2xl flex flex-col border border-gray-100 dark:border-gray-800 animate-in zoom-in-95 duration-200">
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
            isDanger ? "bg-red-50 dark:bg-red-950 text-red-500" : "bg-blue-50 dark:bg-blue-950 text-blue-500"
          }`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-gray-950 dark:text-white leading-snug">{title}</h3>
            <p className="text-xs.5 text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2.5 text-xs.5 font-semibold rounded-xl border border-gray-200 dark:border-gray-850 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-950 transition cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2.5 text-xs.5 font-semibold rounded-xl text-white transition cursor-pointer shadow-sm hover:opacity-90 active:scale-97 ${
              isDanger 
                ? "bg-red-500 hover:bg-red-650"
                : "bg-gray-950 dark:bg-gray-50 dark:text-gray-950 hover:bg-gray-850"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
