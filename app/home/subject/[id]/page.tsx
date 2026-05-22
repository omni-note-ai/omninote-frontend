"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, PenLine, PenSquare } from "lucide-react";
import { useApp } from "@/lib/store";
import NoteCard from "@/components/dashboard/NoteCard";
import NewNoteForm from "@/components/dashboard/NewNoteForm";

export default function SubjectPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { subjects, notes } = useApp();
  const [showNewNote, setShowNewNote] = useState(false);

  const subject = subjects.find((s) => s.id === id);
  const subjectNotes = notes.filter((n) => n.subjectId === id);

  if (!subject) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm ">
        Subject not found.
      </div>
    );
  }

  const handleCreated = (noteId: string) => {
    router.push(`/home/note/${noteId}`);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 bg-white">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-gray-500" />
          </button>
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: subject.color }}
          />
          <h1 className="text-xl font-bold text-gray-800">{subject.name}</h1>
        </div>
        <button
          onClick={() => setShowNewNote(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold rounded-full transition-colors"
        >
          <PenSquare className="w-4 h-4" />
          New Note
        </button>
      </div>

      <div className="flex-1 px-8 py-6">
        {showNewNote && (
          <NewNoteForm
            subjectId={id}
            onClose={() => setShowNewNote(false)}
            onCreated={handleCreated}
          />
        )}

        {subjectNotes.length === 0 && !showNewNote ? (
          <div className="border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center h-52 text-center">
            <PenLine className="w-10 h-10 text-gray-200 mb-3" />
            <p className="text-gray-400 text-sm">No notes in this subject yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {subjectNotes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}