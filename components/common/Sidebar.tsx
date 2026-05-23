"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CheckSquare, Trash2, PenLine } from "lucide-react";

const navItems = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/home/tasks", label: "My Tasks", icon: CheckSquare },
  { href: "/recently-deleted", label: "Recently Deleted", icon: Trash2 },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[250px] min-h-screen bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col justify-between px-4 py-6 shrink-0">
      <div>
        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <PenLine className="w-5 h-5 text-gray-700 dark:text-gray-300" strokeWidth={2.2} />
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
            OmniNotes
          </span>
        </div>

        <nav className="flex flex-col gap-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={
                  isActive
                    ? "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-all"
                    : "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent transition-all"
                }
              >
                <Icon className={isActive ? "w-4 h-4 text-gray-900 dark:text-gray-100" : "w-4 h-4 text-gray-400 dark:text-gray-500"} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* BOTTOM */}
      <div className="flex flex-col gap-4">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-3 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-200 font-bold text-sm shrink-0">
            H
          </div>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            hoperochelleandales
          </span>
        </div>

        <button className="flex items-center gap-2 px-3 py-1 text-sm font-medium text-red-500 hover:text-red-600 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}