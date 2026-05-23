"use client";

import { Trash2, RotateCcw, X, FolderOpen, FileText } from "lucide-react";
import { useApp } from "@/lib/store";
import Sidebar from "@/components/common/Sidebar";

export default function RecentlyDeletedPage() {
  const { deletedItems, restoreItem, permanentlyDelete } = useApp();

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="flex items-center gap-3">
            <Trash2 className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Recently Deleted</h1>
          </div>
          {deletedItems.length > 0 && (
            <button
              onClick={() => {
                if (confirm("Permanently delete all items?"))
                  deletedItems.forEach((item) => permanentlyDelete(item.id));
              }}
              className="text-sm text-red-500 hover:text-red-600 font-medium transition-colors"
            >
              Empty Trash
            </button>
          )}
        </div>

        <div className="flex-1 px-8 py-6">
          {deletedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Trash2 className="w-14 h-14 text-gray-200 dark:text-gray-700 mb-3" />
              <p className="text-gray-400 dark:text-gray-500 text-sm">Nothing in the trash.</p>
            </div>
          ) : (
            <>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
                Items are kept for 30 days before being permanently removed.
              </p>
              <div className="space-y-2">
                {deletedItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl px-5 py-3.5 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        {item.type === "subject"
                          ? <FolderOpen className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          : <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        }
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{item.title}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {item.type === "note" && item.subjectName ? `From "${item.subjectName}" · ` : ""}
                          Deleted {formatDate(item.deletedAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => restoreItem(item.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Restore
                      </button>
                      <button
                        onClick={() => { if (confirm("Permanently delete?")) permanentlyDelete(item.id); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950 border border-red-200 dark:border-red-900 rounded-lg transition-colors"
                      >
                        <X className="w-3 h-3" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}