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
    <aside className="w-[250px] min-h-screen bg-white border-r border-gray-100 flex flex-col justify-between px-4 py-6 shrink-0">

      <div>

        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-[#ECEEFF] flex items-center justify-center">
            <PenLine className="w-5 h-5 text-[#6366F1]" strokeWidth={2.2} />
          </div>
          <h1 className="text-[22px] font-bold text-[#111827] tracking-tight">
            OmniNotes
          </h1>
        </div>

        <nav className="flex flex-col gap-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;

            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-150 text-[15px] font-medium
                  ${
                    isActive
                      ? "bg-[#F0F1FF] text-[#5B5FEF] font-semibold ring-1 ring-[#C7C9F9]"
                      : "text-[#374151] hover:bg-[#F5F6FF]"
                  }
                `}
              >
                <Icon
                  className={`w-[18px] h-[18px] shrink-0 ${
                    isActive ? "text-[#5B5FEF]" : "text-[#6B7280]"
                  }`}
                />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="space-y-4">

        <div className="bg-[#F3F4F6] rounded-2xl px-3 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#C7C9F9] flex items-center justify-center text-[#5B5FEF] font-bold text-sm shrink-0">
            H
          </div>
          <span className="text-[13px] font-medium text-[#111827] truncate">
            hoperochelleandales
          </span>
        </div>

        <button className="flex items-center gap-2 px-3 py-1 text-[#EF4444] hover:text-red-600 transition-colors font-medium text-[15px]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-[18px] h-[18px]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
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