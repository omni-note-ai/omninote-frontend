"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Trash2, Calendar, Clock, Star } from "lucide-react";
import { Note } from "@/types";
import { useApp } from "@/lib/store";
import { useToast } from "@/components/common/ToastProvider";
import ConfirmModal from "@/components/common/ConfirmModal";

export default function NoteCard({ note, viewMode = "grid" }: { note: Note; viewMode?: "grid" | "list" }) {
  const router = useRouter();
  const { deleteNote } = useApp();
  const { toast } = useToast();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isStarred, setIsStarred] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(`note_starred_${note.id}`) === "true";
    }
    return false;
  });

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const handleStar = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !isStarred;
    setIsStarred(next);
    localStorage.setItem(`note_starred_${note.id}`, String(next));
    toast(next ? "Added to Favorites" : "Removed from Favorites", "info");
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteNote(note.id);
      toast("Note moved to recently deleted trash", "success");
    } catch (e) {
      console.error(e);
      toast("Failed to delete note", "error");
    } finally {
      setShowConfirm(false);
    }
  };

  // Estimate reading time
  const wordCount = note.content?.trim().split(/\s+/).filter(Boolean).length || 0;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  if (viewMode === "list") {
    return (
      <>
        <div
          onClick={() => router.push(`/home/note/${note.id}`)}
          className="group bg-white/90 dark:bg-gray-900/90 border border-gray-100 dark:border-gray-800/80 rounded-[24px] px-5 py-4 cursor-pointer hover:shadow-md transition-all duration-200 flex items-center justify-between gap-4 animate-in fade-in"
        >
          <div className="flex items-center gap-3.5 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-2xl bg-gray-50 dark:bg-gray-950 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-gray-400 group-hover:text-gray-650 dark:group-hover:text-gray-300 transition-colors" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-gray-50 dark:bg-gray-800 text-gray-450 dark:text-gray-500 max-w-[100px] truncate">
                  {note.subjectName}
                </span>
                <p className="font-bold text-gray-800 dark:text-gray-150 text-sm truncate">{note.title}</p>
              </div>
              {note.content && (
                <p className="text-xs text-gray-500 dark:text-gray-450 mt-1.5 line-clamp-1 truncate max-w-xl">
                  {note.content}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <span className="text-xs text-gray-400 flex items-center gap-1.5 font-semibold">
              <Calendar className="w-3.5 h-3.5 text-gray-350" />
              {formatDate(note.createdAt)}
            </span>
            <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 opacity-100 transition-opacity">
              <button
                onClick={handleStar}
                className={`p-2 rounded-xl transition ${
                  isStarred ? "text-yellow-400" : "text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-850"
                }`}
              >
                <Star className="w-4 h-4" fill={isStarred ? "currentColor" : "none"} />
              </button>
              <button
                onClick={handleDeleteClick}
                className="p-2 rounded-xl hover:bg-red-500/10 text-gray-450 hover:text-red-500 transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <ConfirmModal
          isOpen={showConfirm}
          title="Delete Note?"
          message="Are you sure you want to delete this note? It will be moved to the recently deleted list and can be restored within 30 days."
          confirmLabel="Delete Note"
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowConfirm(false)}
        />
      </>
    );
  }

  // Grid Mode (Default)
  return (
    <>
      <div
        onClick={() => router.push(`/home/note/${note.id}`)}
        className="group relative bg-white/90 dark:bg-gray-900/90 border border-gray-100 dark:border-gray-800/80 rounded-[28px] p-6 cursor-pointer hover:shadow-lg hover:shadow-gray-200/30 dark:hover:shadow-none hover:border-gray-350 dark:hover:border-gray-700 hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between min-h-[170px] animate-in fade-in"
      >
        <div>
          <div className="flex items-start justify-between gap-2.5">
            <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-gray-50 dark:bg-gray-950 border border-gray-100/50 dark:border-gray-850 text-gray-450 dark:text-gray-500 max-w-[120px] truncate shrink-0">
              {note.subjectName}
            </span>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={handleStar}
                className={`p-1 rounded-lg transition duration-200 ${
                  isStarred ? "text-yellow-400 opacity-100" : "sm:opacity-0 sm:group-hover:opacity-100 opacity-100 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-850"
                }`}
              >
                <Star className="w-3.5 h-3.5" fill={isStarred ? "currentColor" : "none"} />
              </button>
              <button
                onClick={handleDeleteClick}
                className="sm:opacity-0 sm:group-hover:opacity-100 opacity-100 transition p-1 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-500 duration-200 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <h3 className="font-bold text-gray-850 dark:text-gray-100 text-sm mt-3 leading-snug truncate">
            {note.title}
          </h3>

          {note.content && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-3 leading-relaxed">
              {note.content}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-gray-50 dark:border-gray-850 mt-4 pt-3 text-[10px] text-gray-400 dark:text-gray-500 font-semibold shrink-0">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(note.createdAt)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {readTime} min read
          </span>
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirm}
        title="Delete Note?"
        message="Are you sure you want to delete this note? It will be moved to the recently deleted list and can be restored within 30 days."
        confirmLabel="Delete Note"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
}