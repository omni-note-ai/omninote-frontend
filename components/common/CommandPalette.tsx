"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, FileText, CheckSquare, Trash2, Sun, Moon, Plus, LogOut } from "lucide-react";
import { useApp } from "@/lib/store";

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const { notes, subjects, createNote, createSubject, logout } = useApp();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Filter commands and notes based on search
  const filteredNotes = notes.filter((n) =>
    n.title.toLowerCase().includes(query.toLowerCase())
  );

  const staticCommands = [
    {
      id: "tasks",
      title: "Go to My Tasks",
      icon: CheckSquare,
      action: () => {
        router.push("/home/tasks");
        setIsOpen(false);
      },
    },
    {
      id: "deleted",
      title: "Go to Recently Deleted",
      icon: Trash2,
      action: () => {
        router.push("/recently-deleted");
        setIsOpen(false);
      },
    },
    {
      id: "dark-mode",
      title: "Toggle Light/Dark Mode",
      icon: Sun,
      action: () => {
        const isDark = document.documentElement.classList.contains("dark");
        if (isDark) {
          document.documentElement.classList.remove("dark");
          localStorage.setItem("theme", "light");
        } else {
          document.documentElement.classList.add("dark");
          localStorage.setItem("theme", "dark");
        }
        setIsOpen(false);
      },
    },
    {
      id: "new-folder",
      title: "Create New Subject Folder",
      icon: Plus,
      action: () => {
        const name = prompt("Enter Subject Folder Name:");
        if (name && name.trim()) {
          createSubject(name.trim());
        }
        setIsOpen(false);
      },
    },
    {
      id: "logout",
      title: "Log Out",
      icon: LogOut,
      action: () => {
        logout();
        router.push("/");
        setIsOpen(false);
      },
    },
  ].filter((c) => c.title.toLowerCase().includes(query.toLowerCase()));

  const items = [
    ...staticCommands.map((c) => ({ ...c, type: "command" })),
    ...filteredNotes.slice(0, 5).map((n) => ({
      id: n.id,
      title: `Open note: ${n.title}`,
      icon: FileText,
      type: "note",
      action: () => {
        router.push(`/home/note/${n.id}`);
        setIsOpen(false);
      },
    })),
  ];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + items.length) % items.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (items[selectedIndex]) {
        items[selectedIndex].action();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 dark:bg-black/60 flex items-start justify-center z-[9999] animate-in fade-in duration-200 px-6 pt-[12vh] backdrop-blur-sm">
      <div className="w-full max-w-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-top-4 duration-300">
        
        {/* Search header box */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <Search className="w-5 h-5 text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search notes..."
            className="flex-1 bg-transparent text-sm.5 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 border border-gray-250 dark:border-gray-700 text-[10px] text-gray-450 font-mono">
            ESC
          </kbd>
        </div>

        {/* Results items */}
        <div className="max-h-[340px] overflow-y-auto p-2 flex flex-col gap-0.5">
          {items.length === 0 ? (
            <div className="py-12 text-center text-xs.5 text-gray-400 dark:text-gray-500">
              No results found for "{query}"
            </div>
          ) : (
            items.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-left transition ${
                    isSelected
                      ? "bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50/50 dark:hover:bg-gray-850/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isSelected ? "text-gray-800 dark:text-gray-100" : "text-gray-400"}`} />
                    <span className="text-xs.5 font-semibold">{item.title}</span>
                  </div>
                  {isSelected && (
                    <span className="text-[10px] text-gray-400 font-medium">
                      Enter
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="bg-gray-50/60 dark:bg-gray-950/40 px-5 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[10px] text-gray-400">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>Enter Select</span>
          </div>
          <span>Ctrl + K to close</span>
        </div>

      </div>
    </div>
  );
}
