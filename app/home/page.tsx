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
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950">
      <div className="flex items-center justify-between px-12 py-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Subjects</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="pl-11 pr-4 py-2.5 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700 focus:border-gray-400 dark:focus:border-gray-500 transition w-64 text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>
          <button
            onClick={() => setShowNewFolder(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 dark:bg-gray-100 hover:bg-gray-700 dark:hover:bg-gray-300 text-white dark:text-gray-900 text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Folder
          </button>
          <ThemeToggle />
        </div>
      </div>

      <div className="flex-1 flex flex-col px-12 pb-12">
        {showNewFolder && <NewFolderForm onClose={() => setShowNewFolder(false)} />}

        {filteredSubjects.length === 0 && !showNewFolder ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl flex items-center justify-center mb-5 bg-white dark:bg-gray-900">
              <Folder className="w-10 h-10 text-gray-300 dark:text-gray-600" strokeWidth={1.5} />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm">
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