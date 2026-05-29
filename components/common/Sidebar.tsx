"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, CheckSquare, Trash2, PenLine, ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { useApp } from "@/lib/store";
import { useToast } from "@/components/common/ToastProvider";
import ThemeToggle from "@/components/common/ThemeToggle";

const navItems = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/home/tasks", label: "My Tasks", icon: CheckSquare, badgeKey: "tasks" },
  { href: "/recently-deleted", label: "Recently Deleted", icon: Trash2 },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, tasks } = useApp();
  const { toast } = useToast();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    toast("Logged out successfully", "info");
    router.push("/");
  };

  const email = user?.email ?? "hello@example.com";
  const initials = email.charAt(0).toUpperCase();
  const displayName = email.split("@")[0];

  // Calculate task badge
  const pendingTasks = tasks.filter((t) => !t.completed).length;

  return (
    <aside
      className={`hidden md:flex relative min-h-screen bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col justify-between p-4 pb-6 shrink-0 transition-all duration-300 ${
        isCollapsed ? "w-[76px]" : "w-[260px]"
      }`}
    >
      {/* Collapse Toggle Arrow */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-8 -right-3 w-6 h-6 rounded-full border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors shadow-sm cursor-pointer z-10"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      <div>
        {/* Logo and Brand */}
        <div className={`flex items-center gap-3 mb-8 px-2 overflow-hidden ${isCollapsed ? "justify-center" : ""}`}>
          <div className="w-10 h-10 rounded-2xl bg-gray-950 dark:bg-gray-50 flex items-center justify-center shrink-0 shadow-md">
            <PenLine className="w-5 h-5 text-white dark:text-gray-950" strokeWidth={2.2} />
          </div>
          {!isCollapsed && (
            <span className="text-lg font-bold text-gray-900 dark:text-white tracking-tight leading-none">
              OmniNotes
            </span>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1.5">
          {navItems.map(({ href, label, icon: Icon, badgeKey }) => {
            const isActive = pathname === href;
            const hasBadge = badgeKey === "tasks" && pendingTasks > 0;

            return (
              <Link
                key={href}
                href={href}
                className={`group flex items-center rounded-2xl text-sm transition-all border ${
                  isActive
                    ? "px-4 py-3 font-bold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 border-gray-250/50 dark:border-gray-700 shadow-sm"
                    : "px-4 py-3 font-semibold text-gray-500 dark:text-gray-450 hover:bg-gray-50/50 dark:hover:bg-gray-800/40 border-transparent hover:text-gray-950 dark:hover:text-white"
                } ${isCollapsed ? "justify-center" : "justify-between"}`}
                title={isCollapsed ? label : undefined}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                      isActive ? "text-gray-950 dark:text-white" : "text-gray-400"
                    }`}
                  />
                  {!isCollapsed && <span>{label}</span>}
                </div>

                {hasBadge && (
                  <span className={`flex items-center justify-center text-[10px] font-bold rounded-full min-w-[20px] h-[20px] px-1 shadow-sm leading-none shrink-0 ${
                    isActive 
                      ? "bg-gray-950 text-white dark:bg-white dark:text-gray-950" 
                      : "bg-red-500 text-white"
                  }`}>
                    {pendingTasks}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Account Profile Bottom Panel */}
      <div className="flex flex-col gap-4">
        <div className={`bg-gray-50 dark:bg-gray-950 border border-gray-100/50 dark:border-gray-800/40 rounded-2xl p-2.5 flex items-center gap-3 overflow-hidden ${
          isCollapsed ? "justify-center" : ""
        }`}>
          <div className="w-8 h-8 rounded-full bg-gray-900 text-white dark:bg-white dark:text-gray-950 flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
            {initials}
          </div>
          {!isCollapsed && (
            <span className="text-xs.5 font-bold text-gray-800 dark:text-gray-250 truncate">
              {displayName}
            </span>
          )}
        </div>

        <div className={`flex items-center justify-between ${isCollapsed ? "flex-col gap-3" : "px-1"}`}>
          <button
            onClick={handleLogout}
            className={`flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-red-500 hover:text-red-650 transition-all rounded-xl hover:bg-red-500/5 ${
              isCollapsed ? "justify-center" : ""
            }`}
            title={isCollapsed ? "Log Out" : undefined}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Log Out</span>}
          </button>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}