"use client";

import { useState } from "react";
import { Search, Plus, Folder } from "lucide-react";
import { useApp } from "@/lib/store";
import SubjectCards from "@/components/common/SubjectCards";
import NewFolderForm from "@/components/dashboard/NewFolderForm";
import ThemeToggle from "@/components/common/ThemeToggle";

export default function DashboardPage() {
  const { filteredSubjects, searchQuery, setSearchQuery } = useApp();
  const [showNewFolder, setShowNewFolder] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-950 transition-colors duration-200">
      
      {/* Main clean layout container */}
      <div className="flex-1 px-4 sm:px-8 md:px-12 py-6 sm:py-10 pb-20 md:pb-10 max-w-5xl w-full mx-auto animate-in fade-in duration-300 flex flex-col gap-6">
        
        {/* Title and subtitle */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-950 dark:text-white tracking-tight">
              Subjects
            </h1>
            <p className="text-sm.5 text-gray-400 dark:text-gray-550 font-semibold mt-1">
              Organize your thoughts and materials.
            </p>
          </div>
          <ThemeToggle />
        </div>

        {/* Search controls row */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full pl-11 pr-4 py-3 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-805 rounded-2xl outline-none focus:ring-1.5 focus:ring-gray-950 dark:focus:ring-gray-200 focus:border-transparent transition text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 shadow-inner"
            />
          </div>

          <button
            onClick={() => setShowNewFolder(true)}
            className="flex items-center gap-1.5 px-6 py-3 bg-gray-950 dark:bg-white text-white dark:text-gray-950 text-sm font-bold rounded-2xl transition shadow-md active:scale-97 hover:opacity-90 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            New
          </button>
        </div>

        {/* Inline new folder creator drawer */}
        {showNewFolder && <NewFolderForm onClose={() => setShowNewFolder(false)} />}

        {/* Folder items list grid */}
        {filteredSubjects.length === 0 && !showNewFolder ? (
          <div className="border border-dashed border-gray-200 dark:border-gray-800 rounded-3xl p-16 text-center bg-gray-50/20 dark:bg-gray-900/10 flex flex-col items-center justify-center min-h-[220px]">
            <Folder className="w-12 h-12 text-gray-300 dark:text-gray-700 mb-3" strokeWidth={1.5} />
            <p className="text-gray-500 dark:text-gray-400 text-xs.5 leading-relaxed">
              {searchQuery ? "No subjects match your search." : "No subjects yet. Create one to start taking notes!"}
            </p>
          </div>
        ) : (
          <SubjectCards subjects={filteredSubjects} />
        )}
      </div>

    </div>
  );
}