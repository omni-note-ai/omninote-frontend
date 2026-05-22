"use client";

import { Trash2, RotateCcw, X, FolderOpen, FileText } from "lucide-react";
import { useApp } from "@/lib/store";
import Sidebar from "@/components/common/Sidebar";

export default function RecentlyDeletedPage() {
  const { deletedItems, restoreItem, permanentlyDelete } = useApp();

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-3">
            <Trash2 className="w-5 h-5 text-gray-400" />
            <h1 className="text-2xl font-bold text-gray-800">Recently Deleted</h1>
          </div>
          {deletedItems.length > 0 && (
            <button
              onClick={() => {
                if (confirm("Permanently delete all items?")) {
                  deletedItems.forEach((item) => permanentlyDelete(item.id));
                }
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
              <Trash2 className="w-14 h-14 text-gray-200 mb-3" />
              <p className="text-gray-400 text-sm">
                Nothing in the trash. Deleted items appear here.
              </p>
            </div>
          ) : (
            <>
              <p className="text-xs text-gray-400 mb-4">
                Items are kept for 30 days before being permanently removed.
              </p>
              <div className="space-y-2">
                {deletedItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-5 py-3.5 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      {item.type === "subject" ? (
                        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                          <FolderOpen className="w-4 h-4 text-amber-500" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                          <FileText className="w-4 h-4 text-indigo-400" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-gray-700">
                          {item.title}
                        </p>
                        <p className="text-xs text-gray-400">
                          {item.type === "note" && item.subjectName
                            ? `From "${item.subjectName}" · `
                            : ""}
                          Deleted {formatDate(item.deletedAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => restoreItem(item.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 border border-indigo-200 rounded-lg transition-colors"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Restore
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("Permanently delete this item?")) {
                            permanentlyDelete(item.id);
                          }
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 border border-red-200 rounded-lg transition-colors"
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