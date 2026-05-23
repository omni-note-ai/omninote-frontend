"use client";

import { useRouter } from "next/navigation";
import { FileText, Trash2 } from "lucide-react";
import { Note } from "@/types";
import { useApp } from "@/lib/store";

export default function NoteCard({ note }: { note: Note }) {
  const router = useRouter();
  const { deleteNote } = useApp();

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" });
  };

  return (
    <div
      onClick={() => router.push(`/home/note/${note.id}`)}
      className="group relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4 cursor-pointer hover:shadow-md transition-all duration-200 min-h-[120px]"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm">{note.title}</p>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); router.push(`/home/note/${note.id}`); }}
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <FileText className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
            className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
          </button>
        </div>
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{formatDate(note.createdAt)}</p>
      {note.content && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-3">{note.content}</p>
      )}
    </div>
  );
}