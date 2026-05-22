"use client";

import { useRouter } from "next/navigation";
import { Folder, Trash2 } from "lucide-react";
import { Subject } from "@/types";
import { useApp } from "@/lib/store";

interface SubjectCardsProps {
  subjects: Subject[];
}

export default function SubjectCards({ subjects }: SubjectCardsProps) {
  const router = useRouter();
  const { deleteSubject } = useApp();

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Delete this subject? All notes inside will also be deleted.")) {
      deleteSubject(id);
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {subjects.map((subject) => (
        <div
          key={subject.id}
          onClick={() => router.push(`/home/subject/${subject.id}`)}
          className="group relative bg-white rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all duration-200 overflow-hidden"
        >
          <div
            className="h-2 w-full"
            style={{ backgroundColor: subject.color }}
          />
          <div className="p-4">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
              style={{ backgroundColor: subject.color + "22" }}
            >
              <Folder
                className="w-5 h-5"
                style={{ color: subject.color }}
              />
            </div>
            <p className="font-semibold text-gray-800 text-sm truncate">
              {subject.name}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {subject.noteCount} {subject.noteCount === 1 ? "note" : "notes"}
            </p>
          </div>
          <button
            onClick={(e) => handleDelete(e, subject.id)}
            className="absolute top-3 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-50"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
          </button>
        </div>
      ))}
    </div>
  );
}