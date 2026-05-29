"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { AlertCircle, CheckCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto dismiss
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast container floating on screen */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => {
          const isSuccess = t.type === "success";
          const isError = t.type === "error";
          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-center gap-3.5 px-4.5 py-3.5 rounded-2xl shadow-xl border glass animate-in fade-in slide-in-from-bottom-5 duration-300 ${
                isSuccess
                  ? "border-green-100/50 bg-green-50/90 text-green-800 dark:border-green-900/30 dark:bg-green-950/80 dark:text-green-200"
                  : isError
                  ? "border-red-100/50 bg-red-50/90 text-red-800 dark:border-red-900/30 dark:bg-red-950/80 dark:text-red-200"
                  : "border-gray-100/50 bg-white/90 text-gray-800 dark:border-gray-800/30 dark:bg-gray-900/80 dark:text-gray-200"
              }`}
            >
              <div className="shrink-0">
                {isSuccess && <CheckCircle className="w-5 h-5 text-green-500" />}
                {isError && <AlertCircle className="w-5 h-5 text-red-500" />}
                {!isSuccess && !isError && <Info className="w-5 h-5 text-blue-500" />}
              </div>
              <p className="text-xs font-semibold leading-relaxed flex-1">{t.message}</p>
              <button
                onClick={() => removeToast(t.id)}
                className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors shrink-0 text-current/60"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
