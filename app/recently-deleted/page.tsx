"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Trash2, RotateCcw, FolderOpen, FileText } from "lucide-react";
import { useApp } from "@/lib/store";
import Sidebar from "@/components/common/Sidebar";
import MobileNavbar from "@/components/common/MobileNavbar";
import { trashAPI, subjectAPI, noteAPI } from "@/lib/api";
import { useToast } from "@/components/common/ToastProvider";
import ConfirmModal from "@/components/common/ConfirmModal";

interface NormalizedTrashItem {
  id: string;
  title: string;
  type: "note" | "subject";
  subjectName?: string;
  deletedAt: string;
}

export default function RecentlyDeletedPage() {
  const { isLoggedIn, isAuthLoading } = useApp();
  const router = useRouter();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [trashItems, setTrashItems] = useState<NormalizedTrashItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Custom confirm dialog state
  const [showConfirmEmpty, setShowConfirmEmpty] = useState(false);

  const fetchTrash = async () => {
    try {
      setLoading(true);
      const res = await trashAPI.getTrash();
      if (res.success && res.data) {
        const normalized: NormalizedTrashItem[] = [];
        if (res.data.subjects) {
          res.data.subjects.forEach((s: any) => {
            normalized.push({
              id: s.id,
              title: s.name,
              type: "subject",
              deletedAt: s.updatedAt || new Date().toISOString(),
            });
          });
        }
        if (res.data.notes) {
          res.data.notes.forEach((n: any) => {
            normalized.push({
              id: n.id,
              title: n.title || "Untitled Note",
              type: "note",
              subjectName: n.subjectName || "Folder",
              deletedAt: n.updatedAt || new Date().toISOString(),
            });
          });
        }
        setTrashItems(normalized);
      }
    } catch (e) {
      console.error("Failed to load trash list:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    if (!isAuthLoading && !isLoggedIn) {
      router.push("/login");
    } else if (isLoggedIn) {
      fetchTrash();
    }
  }, [isLoggedIn, isAuthLoading, router]);

  if (!mounted || isAuthLoading || !isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950 text-sm text-gray-400 font-semibold animate-pulse">
        Loading trash details...
      </div>
    );
  }

  const handleRestore = async (id: string, type: "note" | "subject", title: string) => {
    try {
      if (type === "subject") {
        await subjectAPI.restore(id);
      } else {
        await noteAPI.restore(id);
      }
      toast(`Successfully restored "${title}"`, "success");
      await fetchTrash();
    } catch (e) {
      console.error("Restoration failed:", e);
      toast("Failed to restore item", "error");
    }
  };

  const handleEmptyTrash = async () => {
    try {
      await trashAPI.emptyTrash();
      setTrashItems([]);
      toast("Trash emptied successfully", "info");
    } catch (e) {
      console.error("Failed to empty trash:", e);
      toast("Failed to empty trash", "error");
    } finally {
      setShowConfirmEmpty(false);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50/50 dark:bg-gray-950/20">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">

        {/* Header toolbar */}
        <div className="flex items-center justify-between px-4 sm:px-8 py-5 border-b border-gray-150/30 dark:border-gray-850 bg-white dark:bg-gray-900/60 backdrop-blur-md sticky top-0 z-30 transition">
          <div className="flex items-center gap-3">
            <Trash2 className="w-5.5 h-5.5 text-gray-400 dark:text-gray-500" />
            <div>
              <h1 className="text-lg md:text-xl font-extrabold text-gray-850 dark:text-white leading-tight">Recently Deleted</h1>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Recover or empty study documents</p>
            </div>
          </div>

          {trashItems.length > 0 && (
            <button
              onClick={() => setShowConfirmEmpty(true)}
              className="text-xs.5 font-extrabold text-red-500 hover:text-red-650 hover:bg-red-500/5 px-4 py-2 rounded-xl transition cursor-pointer"
            >
              Empty Trash
            </button>
          )}
        </div>

        {/* Content body canvas */}
        <div className="flex-1 px-4 sm:px-8 md:px-12 py-8 max-w-4xl w-full mx-auto animate-in fade-in duration-300">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <p className="text-gray-400 text-xs italic animate-pulse">Fetching trash items...</p>
            </div>
          ) : trashItems.length === 0 ? (
            <div className="border border-dashed border-gray-200 dark:border-gray-850 rounded-3xl p-16 text-center bg-white dark:bg-gray-900 flex flex-col items-center justify-center min-h-[260px]">
              <Trash2 className="w-12 h-12 text-gray-200 dark:text-gray-750 mb-3" strokeWidth={1.5} />
              <p className="text-gray-550 dark:text-gray-400 text-xs.5 leading-relaxed">
                Trash is empty. Documents you delete are kept here for 30 days.
              </p>
            </div>
          ) : (
            <>
              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-505 uppercase tracking-wider mb-4 px-2">
                Items are kept for 30 days before being permanently removed.
              </p>

              <div className="space-y-2.5">
                {trashItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between bg-white dark:bg-gray-900 border border-gray-150/40 dark:border-gray-800 rounded-2.5xl px-5 py-4 shadow-sm hover:shadow-md transition duration-200"
                  >
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <div className="w-9 h-9 rounded-xl bg-gray-50 dark:bg-gray-950 flex items-center justify-center shrink-0">
                        {item.type === "subject" ? (
                          <FolderOpen className="w-4.5 h-4.5 text-gray-400" />
                        ) : (
                          <FileText className="w-4.5 h-4.5 text-gray-400" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-xs.5 font-bold text-gray-800 dark:text-slate-200 truncate leading-snug">
                          {item.title}
                        </p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-550 font-semibold mt-1 flex items-center gap-1.5 flex-wrap">
                          {item.type === "note" && item.subjectName ? (
                            <>
                              <span>From "{item.subjectName}"</span>
                              <span className="text-gray-200 dark:text-gray-800">·</span>
                            </>
                          ) : null}
                          <span>Deleted {formatDate(item.deletedAt)}</span>
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRestore(item.id, item.type, item.title)}
                      className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl transition cursor-pointer shrink-0 shadow-sm"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Restore
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      <MobileNavbar />
      <ConfirmModal
        isOpen={showConfirmEmpty}
        title="Permanently Empty Trash?"
        message="Are you sure you want to permanently delete all items in the trash? This action cannot be undone and these study files will be lost forever."
        confirmLabel="Empty Trash"
        onConfirm={handleEmptyTrash}
        onCancel={() => setShowConfirmEmpty(false)}
      />
    </div>
  );
}