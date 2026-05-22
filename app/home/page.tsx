"use client";

import { useState } from "react";
import { Search, Plus, Folder } from "lucide-react"; 
import { useApp } from "@/lib/store";
import SubjectCards from "@/components/common/SubjectCards";
import NewFolderForm from "@/components/dashboard/NewFolderForm";

export default function HomePage() {
  const { filteredSubjects, searchQuery, setSearchQuery } = useApp();
  const [showNewFolder, setShowNewFolder] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-[#FAFAFA]">
      <div className="flex items-center justify-between px-12 py-6 bg-transparent">
        <h1 className="text-[28px] font-bold text-[#1E293B]">My Subjects</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="pl-11 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition w-64 text-gray-700 placeholder-gray-400"
            />
          </div>
          <button
            onClick={() => setShowNewFolder(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Folder
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col px-12 pb-12">
        {showNewFolder && (
          <NewFolderForm onClose={() => setShowNewFolder(false)} />
        )}

        {filteredSubjects.length === 0 && !showNewFolder ? (
          <div className="flex-1 flex flex-col items-center justify-center -mt-16 text-center select-none">
            <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center mb-5 bg-white shadow-sm">
              <Folder className="w-10 h-10 text-gray-300 stroke-[1.5]" />
            </div>
            <p className="text-[#64748B] text-base font-normal max-w-sm leading-relaxed">
              {searchQuery
                ? "No subjects match your search."
                : "No subjects yet. Create one to start taking notes!"}
            </p>
          </div>
        ) : (
          <SubjectCards subjects={filteredSubjects} />
        )}
      </div>
    </div>
  );
}