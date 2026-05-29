"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, CheckSquare, Trash2, LogOut, Sun, Moon } from "lucide-react";
import { useApp } from "@/lib/store";
import { useToast } from "@/components/common/ToastProvider";
import { useEffect, useState } from "react";

export default function MobileNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, tasks } = useApp();
  const { toast } = useToast();
  const [dark, setDark] = useState<boolean | null>(null);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleLogout = () => {
    logout();
    toast("Logged out successfully", "info");
    router.push("/");
  };

  const pendingTasks = tasks.filter((t) => !t.completed).length;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 flex items-center justify-around px-4 z-40 shadow-lg select-none">
      <Link
        href="/home"
        className={`flex flex-col items-center gap-1 p-2 transition-colors cursor-pointer ${
          pathname === "/home"
            ? "text-gray-950 dark:text-white"
            : "text-gray-400 hover:text-gray-600"
        }`}
      >
        <Home className="w-5 h-5" strokeWidth={2.0} />
        <span className="text-[9px] font-bold uppercase tracking-wider">Home</span>
      </Link>

      <Link
        href="/home/tasks"
        className={`flex flex-col items-center gap-1 p-2 relative transition-colors cursor-pointer ${
          pathname === "/home/tasks"
            ? "text-gray-950 dark:text-white"
            : "text-gray-400 hover:text-gray-600"
        }`}
      >
        <CheckSquare className="w-5 h-5" strokeWidth={2.0} />
        {pendingTasks > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] font-extrabold rounded-full w-4.5 h-4.5 flex items-center justify-center animate-in zoom-in duration-200">
            {pendingTasks}
          </span>
        )}
        <span className="text-[9px] font-bold uppercase tracking-wider">Tasks</span>
      </Link>

      <Link
        href="/recently-deleted"
        className={`flex flex-col items-center gap-1 p-2 transition-colors cursor-pointer ${
          pathname === "/recently-deleted"
            ? "text-gray-950 dark:text-white"
            : "text-gray-400 hover:text-gray-600"
        }`}
      >
        <Trash2 className="w-5 h-5" strokeWidth={2.0} />
        <span className="text-[9px] font-bold uppercase tracking-wider">Trash</span>
      </Link>

      <button
        onClick={toggleTheme}
        className="flex flex-col items-center gap-1 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
        aria-label="Toggle theme"
      >
        {dark ? <Sun className="w-5 h-5" strokeWidth={2.0} /> : <Moon className="w-5 h-5" strokeWidth={2.0} />}
        <span className="text-[9px] font-bold uppercase tracking-wider">Theme</span>
      </button>

      <button
        onClick={handleLogout}
        className="flex flex-col items-center gap-1 p-2 text-red-500 hover:text-red-650 cursor-pointer"
      >
        <LogOut className="w-5 h-5" strokeWidth={2.0} />
        <span className="text-[9px] font-bold uppercase tracking-wider">Logout</span>
      </button>
    </div>
  );
}
