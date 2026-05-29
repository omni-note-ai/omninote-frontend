"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Folder, Trash2 } from "lucide-react";
import { Subject } from "@/types";
import { useApp } from "@/lib/store";
import { useToast } from "@/components/common/ToastProvider";
import ConfirmModal from "@/components/common/ConfirmModal";

export default function SubjectCards({ subjects }: { subjects: Subject[] }) {
  const router = useRouter();
  const { deleteSubject } = useApp();
  const { toast } = useToast();
  const [targetId, setTargetId] = useState<string | null>(null);

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setTargetId(id);
  };

  const handleConfirmDelete = async () => {
    if (!targetId) return;
    try {
      await deleteSubject(targetId);
      toast("Subject folder deleted successfully", "success");
    } catch (e) {
      console.error(e);
      toast("Failed to delete subject folder", "error");
    } finally {
      setTargetId(null);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-in fade-in duration-300">
        {subjects.map((subject) => (
          <div
            key={subject.id}
            onClick={() => router.push(`/home/subject/${subject.id}`)}
            className="group relative bg-white/90 dark:bg-gray-900/90 rounded-[32px] border border-gray-100 dark:border-gray-800 cursor-pointer p-7.5 transition-all duration-300 flex flex-col justify-between hover:shadow-lg hover:shadow-gray-200/40 dark:hover:shadow-none hover:border-gray-300 dark:hover:border-gray-700 hover:-translate-y-0.5 min-h-[160px]"
          >
            {/* Top row with Dot and Folder Icon */}
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: subject.color }} />
              <Folder className="w-5 h-5 text-gray-400 dark:text-gray-500" strokeWidth={1.6} />
            </div>

            {/* Title and notes count */}
            <div>
              <p className="font-bold text-gray-900 dark:text-white text-base leading-tight">
                {subject.name}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold mt-1">
                {subject.noteCount} {subject.noteCount === 1 ? "note" : "notes"}
              </p>
            </div>

            {/* Hover Delete Button */}
            <button
              onClick={(e) => handleDeleteClick(e, subject.id)}
              className="absolute top-5 right-5 sm:opacity-0 sm:group-hover:opacity-100 opacity-100 transition-all p-1.5 rounded-xl hover:bg-red-500/10 text-gray-405 hover:text-red-500 duration-200 cursor-pointer"
              title="Delete folder"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <ConfirmModal
        isOpen={!!targetId}
        title="Delete Subject Folder?"
        message="Are you sure you want to delete this folder? All notes and captures stored inside it will be moved to recently deleted trash."
        confirmLabel="Delete Folder"
        onConfirm={handleConfirmDelete}
        onCancel={() => setTargetId(null)}
      />
    </>
  );
}