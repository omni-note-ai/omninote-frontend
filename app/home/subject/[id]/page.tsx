"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, PenLine, PenSquare, Search, LayoutGrid, List, ArrowUpDown, ChevronRight, Folder } from "lucide-react";
import { useApp } from "@/lib/store";
import NoteCard from "@/components/dashboard/NoteCard";
import NewNoteForm from "@/components/dashboard/NewNoteForm";

type SortOption = "recent" | "alphabetical";

export default function SubjectPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { subjects, notes, fetchNotes } = useApp();
  
  const [showNewNote, setShowNewNote] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [localSearch, setLocalSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("recent");

  useEffect(() => {
    fetchNotes(id);
  }, [id, fetchNotes]);

  const subject = subjects.find((s) => s.id === id);
  const subjectNotes = notes.filter((n) => n.subjectId === id);

  if (!subject) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500 text-sm font-semibold">
        Subject not found.
      </div>
    );
  }

  // Filter and sort subject specific notes
  const getProcessedNotes = () => {
    let list = [...subjectNotes];
    
    // Local search filter
    if (localSearch.trim()) {
      const q = localSearch.toLowerCase();
      list = list.filter(n => n.title.toLowerCase().includes(q) || n.content?.toLowerCase().includes(q));
    }

    // Sorting options
    if (sortBy === "recent") {
      list.sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
    } else if (sortBy === "alphabetical") {
      list.sort((a, b) => a.title.localeCompare(b.title));
    }

    return list;
  };

  const processedNotes = getProcessedNotes();

  return (
    <div className="flex flex-col h-full bg-gray-50/50 dark:bg-gray-950/20">
      
      {/* Premium Header with visual Breadcrumbs & Back Nav */}
      <div className="flex flex-col border-b border-gray-150/30 dark:border-gray-850 bg-white dark:bg-gray-900/60 backdrop-blur-md sticky top-0 z-30 transition">
        
        {/* Top Breadcrumb Navigation Row */}
        <div className="flex items-center gap-1.5 px-8 pt-4 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
          <Link href="/home" className="hover:text-gray-650 dark:hover:text-gray-250 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 text-gray-300" />
          <span className="flex items-center gap-1 font-extrabold text-gray-500 dark:text-gray-300">
            <Folder className="w-3 h-3" style={{ color: subject.color }} />
            {subject.name}
          </span>
        </div>

        {/* Header Action Row */}
        <div className="flex items-center justify-between px-8 pb-4.5 pt-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-1.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-250 transition cursor-pointer"
              title="Go back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span className="w-3.5 h-3.5 rounded-full shadow-inner animate-pulse shrink-0" style={{ backgroundColor: subject.color }} />
            <h1 className="text-lg md:text-xl font-extrabold text-gray-850 dark:text-white leading-tight">{subject.name}</h1>
          </div>

          <button
            onClick={() => setShowNewNote(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gray-950 dark:bg-white text-white dark:text-gray-950 hover:bg-gray-900 dark:hover:bg-gray-100 text-xs font-bold rounded-2xl shadow-sm transition active:scale-97 cursor-pointer"
          >
            <PenSquare className="w-3.5 h-3.5" />
            New Note
          </button>
        </div>
      </div>

      <div className="flex-1 px-8 py-6 max-w-7xl w-full mx-auto animate-in fade-in duration-300 flex flex-col gap-6">
        
        {/* New Note Form Panel Drawer */}
        {showNewNote && (
          <NewNoteForm
            subjectId={id}
            onClose={() => setShowNewNote(false)}
            onCreated={(noteId) => router.push(`/home/note/${noteId}`)}
          />
        )}

        {/* Search and Filter Row */}
        {subjectNotes.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[20px] px-5 py-2.5 shadow-sm">
            
            {/* Folder Specific Search */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Search notes in folder..."
                className="w-full pl-10 pr-3 py-2 text-xs bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-1.5 focus:ring-gray-950 dark:focus:ring-gray-150 transition text-gray-700 dark:text-gray-200 placeholder-gray-400"
              />
            </div>

            {/* Formatting filters */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
              
              {/* Note sorting selector */}
              <div className="flex items-center gap-1.5 border border-gray-250 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-650 dark:text-gray-400">
                <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="bg-transparent border-none outline-none cursor-pointer text-gray-750 dark:text-gray-300"
                >
                  <option value="recent">Recently Edited</option>
                  <option value="alphabetical">Alphabetical A-Z</option>
                </select>
              </div>

              {/* Grid vs List Toggles */}
              <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-xl p-0.5 flex items-center shadow-sm shrink-0">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === "grid"
                      ? "bg-gray-150 dark:bg-gray-800 text-gray-900 dark:text-white"
                      : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  }`}
                  aria-label="Grid view"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === "list"
                      ? "bg-gray-150 dark:bg-gray-800 text-gray-900 dark:text-white"
                      : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  }`}
                  aria-label="List view"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Class notes representation */}
        {subjectNotes.length === 0 && !showNewNote ? (
          <div className="border-2 border-dashed border-gray-200 dark:border-gray-850 rounded-3xl p-16 text-center bg-white dark:bg-gray-900 flex flex-col items-center justify-center min-h-[220px]">
            <PenLine className="w-11 h-11 text-gray-200 dark:text-gray-750 mb-3" strokeWidth={1.5} />
            <p className="text-gray-500 dark:text-gray-400 text-xs.5 leading-relaxed max-w-xs">
              No notes in this subject folder yet. Click <strong>New Note</strong> at the top to write down your study thoughts!
            </p>
          </div>
        ) : processedNotes.length === 0 ? (
          <div className="border border-dashed border-gray-200 dark:border-gray-800 rounded-3xl p-12 text-center bg-white dark:bg-gray-900 flex flex-col items-center justify-center min-h-[180px]">
            <Search className="w-9 h-9 text-gray-300 dark:text-gray-700 mb-2.5" />
            <p className="text-xs.5 text-gray-400">No notes in folder match "{localSearch}"</p>
          </div>
        ) : viewMode === "list" ? (
          <div className="flex flex-col gap-2.5">
            {processedNotes.map((note) => (
              <NoteCard key={note.id} note={note} viewMode="list" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {processedNotes.map((note) => (
              <NoteCard key={note.id} note={note} viewMode="grid" />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}